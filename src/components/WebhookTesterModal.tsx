import React, { useState } from "react";
import { X, Send, PlusCircle, Loader2, CheckCircle2, Zap } from "lucide-react";
import { PlatformName, SeverityLevel } from "../types";

interface WebhookTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWebhookInjected: () => void;
}

export const WebhookTesterModal: React.FC<WebhookTesterModalProps> = ({
  isOpen,
  onClose,
  onWebhookInjected,
}) => {
  const [platform, setPlatform] = useState<PlatformName>("aiwibcrafter");
  const [severity, setSeverity] = useState<SeverityLevel>("critical");
  const [errorType, setErrorType] = useState("UnhandledNullReference");
  const [errorMessage, setErrorMessage] = useState("Cannot read properties of null (reading 'deployTarget')");
  const [filePath, setFilePath] = useState("src/api/deployWorker.ts");

  const [isSending, setIsSending] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInjectWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResultMsg(null);

    try {
      const res = await fetch("/api/incoming-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          severity,
          errorType,
          errorMessage,
          filePath,
          lineNumber: 84,
          environment: "production",
          userContext: { tenant: "enterprise_acme", sessionIp: "10.0.4.12" },
          stackTrace: `Error: ${errorMessage}\n    at deployWorker (${filePath}:84:12)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)`,
        }),
      });

      const data = (res.headers.get("content-type") || "").includes("application/json") ? await res.json() : {};
      if (!res.ok) throw new Error(data.error || "Failed to inject webhook");

      setResultMsg(`Webhook delivered! Alert created & triaged by Gemini.`);
      setTimeout(() => {
        onWebhookInjected();
        onClose();
      }, 1200);
    } catch (err: any) {
      setResultMsg(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const loadPreset = (presetType: "auth" | "db" | "ai") => {
    if (presetType === "auth") {
      setPlatform("aiwibcrafter");
      setSeverity("critical");
      setErrorType("JWTVerificationError");
      setErrorMessage("TokenExpiredError: jwt expired during workspace session validation");
      setFilePath("src/middleware/jwtAuth.ts");
    } else if (presetType === "db") {
      setPlatform("AutoBot WA");
      setSeverity("high");
      setErrorType("PostgresConnectionTimeout");
      setErrorMessage("FATAL: remaining connection slots are reserved for non-replication superuser connections");
      setFilePath("src/db/connectionPool.ts");
    } else {
      setPlatform("aiwibcrafter");
      setSeverity("medium");
      setErrorType("GeminiQuotaExceeded");
      setErrorMessage("429 ResourceHasBeenExhausted: Gemini API rate limit per minute reached");
      setFilePath("src/services/aiPipeline.ts");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">محاكي استقبال أخطاء Webhook</h3>
              <p className="text-xs text-slate-400">إرسال حمولة خطأ تجريبية لـ /api/incoming-errors</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleInjectWebhook} className="p-6 space-y-4 font-sans text-xs">
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-bold">تحميل سيناريو خطأ جاهز:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadPreset("auth")}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-[11px] cursor-pointer"
              >
                تعطل مصادقة JWT
              </button>
              <button
                type="button"
                onClick={() => loadPreset("db")}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-400 text-[11px] cursor-pointer"
              >
                انسداد الاتصال بـ Postgres
              </button>
              <button
                type="button"
                onClick={() => loadPreset("ai")}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-[11px] cursor-pointer"
              >
                تجاوز حد طلبات Gemini
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">المنصة المصدر</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformName)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="aiwibcrafter">aiwibcrafter</option>
                <option value="AutoBot WA">AutoBot WA</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">مستوى الخطورة</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="critical">حرج (critical)</option>
                <option value="high">عالي (high)</option>
                <option value="medium">متوسط (medium)</option>
                <option value="low">منخفض (low)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">نوع الخطأ / الاستثناء</label>
            <input
              type="text"
              value={errorType}
              onChange={(e) => setErrorType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">رسالة الخطأ</label>
            <input
              type="text"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">مسار الملف المعني</label>
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {resultMsg && (
            <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>{resultMsg}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-lg shadow-cyan-950/50"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>إرسال طلب POST</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
