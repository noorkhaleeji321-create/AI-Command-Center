import React, { useState } from "react";
import {
  X,
  GitCommit,
  CheckCircle2,
  Database,
  Code2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { SystemAlert, PlatformName } from "../types";

interface AutoFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: SystemAlert | null;
  mode: "code" | "database";
  onSuccess: () => void;
}

export const AutoFixModal: React.FC<AutoFixModalProps> = ({
  isOpen,
  onClose,
  alert,
  mode,
  onSuccess,
}) => {
  if (!isOpen || !alert) return null;

  const triage = alert.ai_triage;
  const primaryFile = triage?.affected_files?.[0];

  const [platform, setPlatform] = useState<PlatformName>(alert.platform);
  const [filePath, setFilePath] = useState(
    primaryFile?.path || alert.file_path || `src/services/api-${alert.platform}.ts`
  );
  const [codeContent, setCodeContent] = useState(
    primaryFile?.fixed_snippet ||
      `// Auto-generated fix by Gemini 3.6 Flash Bot for ${alert.platform}\n// Error: ${alert.error_message}\n\nexport function handleDefensiveExecution(context) {\n  if (!context) {\n    console.warn('[AI Command Center] Defensive fallback applied');\n    return { status: 'safe_fallback' };\n  }\n  return context.process();\n}`
  );
  const [commitMessage, setCommitMessage] = useState(
    triage?.recommended_action_title || `[AI Command Center] Auto-fix: ${alert.error_type} in ${filePath}`
  );
  const [sqlQuery, setSqlQuery] = useState(
    triage?.sql_remediation?.sql ||
      `CREATE INDEX IF NOT EXISTS idx_${alert.platform}_fix ON system_alerts(status);`
  );

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecuteFix = async () => {
    setIsExecuting(true);
    setErrorMessage(null);
    setExecutionResult(null);

    try {
      if (mode === "code") {
        const res = await fetch("/api/autofix/code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alertId: alert.id,
            platform,
            repo: platform,
            filePath,
            codeContent,
            commitMessage,
          }),
        });
        const data = (res.headers.get("content-type") || "").includes("application/json") ? await res.json() : {};
        if (!res.ok) throw new Error(data.error || "Failed to commit GitHub fix");
        setExecutionResult(data);
      } else {
        const res = await fetch("/api/autofix/database", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alertId: alert.id,
            platform,
            sqlQuery,
            description: `Supabase SQL remediation for ${alert.error_message}`,
          }),
        });
        const data = (res.headers.get("content-type") || "").includes("application/json") ? await res.json() : {};
        if (!res.ok) throw new Error(data.error || "Failed to execute database fix");
        setExecutionResult(data);
      }

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              {mode === "code" ? <GitCommit className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-sans">
                {mode === "code" ? "إرسال التعديل التلقائي عبر GitHub" : "إصلاح قاعدة البيانات عبر Supabase"}
              </h3>
              <p className="text-xs text-slate-400 font-sans">المنصة المستهدفة: <span className="text-cyan-400 uppercase font-mono font-bold">{platform}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs font-sans">
          {executionResult ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>تم تنفيذ الإصلاح التلقائي بنجاح!</span>
              </div>
              <p className="text-xs text-emerald-300">{executionResult.message}</p>
              {executionResult.commitSha && (
                <p className="text-[11px] font-mono">
                  معرّف التعديل (SHA): <span className="font-bold">{executionResult.commitSha.slice(0, 10)}</span>
                </p>
              )}
              {executionResult.commitUrl && (
                <a
                  href={executionResult.commitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-300 underline font-bold pt-1"
                >
                  <span>عرض التعديل على GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {mode === "code" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-bold">المستودع المستهدف</label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as PlatformName)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="aiwibcrafter">aiwibcrafter (aiwibcrafter-org/aiwibcrafter)</option>
                        <option value="AutoBot WA">AutoBot WA (aiwibcrafter-org/AutoBot-WA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1 font-bold">مسار الملف</label>
                      <input
                        type="text"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-bold">رسالة التعديل (Commit Message)</label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-bold">الكود التعديلي المقترح</label>
                    <textarea
                      rows={8}
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">استعلام Supabase SQL للإصلاح</label>
                  <textarea
                    rows={8}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!executionResult && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3 font-sans">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleExecuteFix}
              disabled={isExecuting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-950/60 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تنفيذ الإصلاح التلقائي...</span>
                </>
              ) : (
                <>
                  {mode === "code" ? <GitCommit className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                  <span>{mode === "code" ? "إرسال التعديل إلى GitHub" : "تطبيق استعلام Supabase SQL"}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
