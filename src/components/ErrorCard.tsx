import React, { useState } from "react";
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  GitCommit,
  ShieldAlert,
  Sparkles,
  Terminal,
} from "lucide-react";
import { SystemAlert, PlatformName } from "../types";

interface ErrorCardProps {
  alert: SystemAlert;
  onSelectForAutoFix: (alert: SystemAlert) => void;
  onSelectForAgentChat: (alert: SystemAlert) => void;
  onExecuteDatabaseFix: (alert: SystemAlert) => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  alert,
  onSelectForAutoFix,
  onSelectForAgentChat,
  onExecuteDatabaseFix,
}) => {
  const [showStackTrace, setShowStackTrace] = useState(false);
  const [showCodeDiff, setShowCodeDiff] = useState(true);

  if (!alert) return null;

  const isCritical = alert.severity === "critical";
  const isHigh = alert.severity === "high";
  const isResolved = alert.status === "resolved";

  const triage = alert.ai_triage;
  const primaryAffectedFile = triage?.affected_files?.[0];

  return (
    <div
      className={`glass-panel rounded-xl transition-all duration-300 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden ${
        isResolved
          ? "border-emerald-500/30 opacity-75"
          : isCritical
          ? "border-red-500/40 animate-critical-pulse-glow"
          : isHigh
          ? "border-amber-500/30"
          : "border-white/10 hover:border-cyan-500/40"
      }`}
    >
      <div>
        {/* Card Header: Platform Badge, Severity, Status */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                alert.platform === "aiwibcrafter"
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  : "bg-purple-500/10 text-purple-400 border-purple-500/30"
              }`}
            >
              {alert.platform === "aiwibcrafter"
                ? "مهندس الويب (WebCraft)"
                : alert.platform === "AutoBot WA"
                ? "وكيل الواتساب (AutoBot)"
                : alert.platform}
            </span>

            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                alert.severity === "critical"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : alert.severity === "high"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-white/5 text-white/40"
              }`}
            >
              {alert.severity}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase">
            {isResolved ? (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> تم الإصلاح
              </span>
            ) : (
              <span>
                {new Date(alert.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Error Title and Exception Type */}
        <div className="mb-2">
          <h3 className="text-xs font-mono text-white/90 leading-snug flex items-start gap-1.5 italic">
            <AlertTriangle
              className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                isCritical ? "text-red-400" : "text-amber-400"
              }`}
            />
            <span className="line-clamp-2">
              {alert.error_type}: {alert.error_message}
            </span>
          </h3>

          {/* File Path & Line Number */}
          {alert.file_path && (
            <p className="text-[10px] font-mono text-cyan-400/90 mt-1 flex items-center gap-1 truncate">
              <Code2 className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">
                {alert.file_path}
                {alert.line_number ? `:${alert.line_number}` : ""}
              </span>
            </p>
          )}
        </div>

        {/* AI Triage Section */}
        {triage ? (
          <div className="my-2 p-2.5 rounded-lg bg-black/40 border border-white/5 relative">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono tracking-wider">
                  تشخيص روبوت Gemini
                </span>
              </div>
              <span className="text-[9px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                الدقة: {(triage.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <p className="text-[11px] text-white/80 leading-snug mb-1">
              <strong className="text-white/90 font-sans text-[10px] font-bold">السبب الرئيسية:</strong>{" "}
              {triage.root_cause}
            </p>

            <p className="text-[11px] text-white/60 leading-snug mb-1.5">
              <strong className="text-white/80 font-sans text-[10px] font-bold">الإصلاح المقترح:</strong>{" "}
              {triage.suggested_fix}
            </p>

            {/* Code Snippet Diff Preview if available */}
            {primaryAffectedFile && primaryAffectedFile.fixed_snippet && (
              <div className="mt-1 text-xs font-mono bg-black/60 rounded-lg border border-white/5 overflow-hidden">
                <div
                  className="px-2.5 py-1 bg-white/5 border-b border-white/5 flex items-center justify-between cursor-pointer"
                  onClick={() => setShowCodeDiff(!showCodeDiff)}
                >
                  <span className="text-white/50 text-[9px] font-mono flex items-center gap-1 uppercase tracking-wider truncate">
                    <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
                    التعديل البرمجي ({primaryAffectedFile.path})
                  </span>
                  {showCodeDiff ? (
                    <ChevronUp className="w-3 h-3 text-white/40 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-white/40 shrink-0" />
                  )}
                </div>

                {showCodeDiff && (
                  <pre className="p-2 text-[10px] overflow-x-auto text-cyan-200/90 leading-tight font-mono max-h-28">
                    <code>{primaryAffectedFile.fixed_snippet}</code>
                  </pre>
                )}
              </div>
            )}

            {/* SQL Remediation Script if present */}
            {triage.sql_remediation?.sql && (
              <div className="mt-1.5 p-2 rounded bg-purple-950/40 border border-purple-500/20 text-xs font-mono">
                <div className="flex items-center gap-1 text-purple-300 font-bold mb-0.5 text-[10px]">
                  <Database className="w-3 h-3 text-purple-400" />
                  <span>إصلاح SQL لقاعدة البيانات:</span>
                </div>
                <code className="text-purple-200 text-[10px] block overflow-x-auto bg-black/60 p-1.5 rounded border border-white/5">
                  {triage.sql_remediation.sql}
                </code>
              </div>
            )}
          </div>
        ) : (
          <div className="my-2 p-2 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2 text-xs text-white/40 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>جاري تحليل الحادث بواسطة روبوت الذكاء الاصطناعي...</span>
          </div>
        )}

        {/* Stack Trace Accordion */}
        {alert.stack_trace && (
          <div className="mt-1">
            <button
              onClick={() => setShowStackTrace(!showStackTrace)}
              className="text-[9px] font-mono text-white/40 hover:text-white/80 flex items-center gap-1 transition-all py-0.5 cursor-pointer uppercase tracking-wider"
            >
              {showStackTrace ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <span>{showStackTrace ? "إخفاء" : "عرض"} سلسلة التتبع الكاملة</span>
            </button>

            {showStackTrace && (
              <pre className="mt-1 p-2 rounded-lg bg-black/60 border border-white/5 text-[9px] font-mono text-red-300/80 overflow-x-auto max-h-32">
                {alert.stack_trace}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-1.5">
        <button
          onClick={() => onSelectForAgentChat(alert)}
          className="px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 font-sans"
        >
          <Bot className="w-3 h-3" />
          <span>محادثة الحل</span>
        </button>

        <div className="flex items-center gap-1.5">
          {triage?.sql_remediation?.sql && (
            <button
              onClick={() => onExecuteDatabaseFix(alert)}
              className="px-3 py-1.5 rounded-full bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 font-sans"
            >
              <Database className="w-3 h-3 text-purple-400" />
              <span>تطبيق SQL</span>
            </button>
          )}

          {!isResolved && (
            <button
              onClick={() => onSelectForAutoFix(alert)}
              className="px-3 py-1.5 rounded-full border border-white/20 text-white hover:bg-white/10 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 font-sans"
            >
              <span>إصلاح تلقائي</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
