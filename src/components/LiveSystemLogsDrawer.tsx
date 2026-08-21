import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  X,
  Play,
  Pause,
  RefreshCw,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Bot,
  ShieldCheck,
  Key,
  AlertTriangle,
  CheckCircle2,
  Database,
  GitCommit,
  Sparkles,
  Server,
  Zap,
  Activity,
} from "lucide-react";
import { AIAction, SystemAlert, PlatformName } from "../types";
import { safeFetchJson } from "../utils/safeFetch";

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  category: "AUTO_FIX" | "GATEWAY" | "SECURITY" | "DATABASE" | "SYSTEM";
  platform: PlatformName;
  message: string;
  details?: Record<string, any> | string;
  executedBy?: string;
}

interface LiveSystemLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actions?: AIAction[];
  alerts?: SystemAlert[];
  onRefreshData?: () => void;
}

export const LiveSystemLogsDrawer: React.FC<LiveSystemLogsDrawerProps> = ({
  isOpen,
  onClose,
  actions = [],
  alerts = [],
  onRefreshData,
}) => {
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeLevel, setActiveLevel] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Local state for accumulated live logs
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize and merge logs from actions & alerts
  useEffect(() => {
    const generatedLogs: SystemLogEntry[] = [];

    // Convert actions to log entries
    actions.forEach((act) => {
      generatedLogs.push({
        id: `act-${act.id}`,
        timestamp: act.created_at,
        level: act.status === "success" ? "success" : act.status === "rolled_back" ? "warn" : "info",
        category: act.action_type === "supabase_query" ? "DATABASE" : act.action_type === "github_commit" ? "AUTO_FIX" : "SECURITY",
        platform: act.platform,
        message: act.description,
        executedBy: act.executed_by || "AutoBot Repair Engine",
        details: {
          action_type: act.action_type,
          target_ref: act.target_ref,
          commit_sha: act.commit_sha,
          commit_url: act.commit_url,
          sql_executed: act.sql_executed,
        },
      });
    });

    // Convert alerts to log entries
    alerts.forEach((alt) => {
      generatedLogs.push({
        id: `alt-${alt.id}`,
        timestamp: alt.created_at,
        level: alt.severity === "high" || alt.severity === "critical" ? "error" : "warn",
        category: alt.platform.includes("WA") || alt.platform.includes("WhatsApp") ? "GATEWAY" : "SYSTEM",
        platform: alt.platform,
        message: `[${alt.error_type}] ${alt.error_message}`,
        executedBy: "System Ingestion Webhook",
        details: {
          file_path: alt.file_path,
          line_number: alt.line_number,
          stack_trace: alt.stack_trace,
          user_context: alt.user_context,
          ai_triage: alt.ai_triage,
        },
      });
    });

    // Sort descending by timestamp
    generatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setLogs((prev) => {
      // Merge unique
      const existingIds = new Set(prev.map((l) => l.id));
      const newItems = generatedLogs.filter((l) => !existingIds.has(l.id));
      if (newItems.length === 0) return prev;
      return [...newItems, ...prev];
    });
  }, [actions, alerts]);

  // Live polling timer
  useEffect(() => {
    if (!isOpen || !isLiveStreaming) return;

    const interval = setInterval(async () => {
      try {
        if (onRefreshData) {
          onRefreshData();
        }

        // Fetch live secret manager status log ping
        const httpRes = await fetch("/api/env/secret-manager/validate");
        const res = await safeFetchJson(httpRes);
        if (res?.report?.results) {
          const checkCount = res.report.results.length;
          const timestamp = new Date().toISOString();
          const autoPingLog: SystemLogEntry = {
            id: `ping-${Date.now()}`,
            timestamp,
            level: "info",
            category: "SECURITY",
            platform: "command-center",
            message: `[SupabaseSecretManager] Verified ${checkCount} platform secret keys across aiwibcrafter & AutoBot WA.`,
            executedBy: "SecretManager Daemon",
            details: { checked_keys_count: checkCount, status: "healthy" },
          };

          setLogs((prev) => [autoPingLog, ...prev.slice(0, 99)]);
        }
      } catch (e) {
        // Silent background catch
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, isLiveStreaming, onRefreshData]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  // Filter logs logic
  const filteredLogs = logs.filter((log) => {
    if (activeCategory !== "ALL" && log.category !== activeCategory) return false;
    if (activeLevel !== "ALL" && log.level !== activeLevel) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchPlat = log.platform.toLowerCase().includes(q);
      const matchExec = (log.executedBy || "").toLowerCase().includes(q);
      if (!matchMsg && !matchPlat && !matchExec) return false;
    }

    return true;
  });

  const handleCopyLog = (log: SystemLogEntry) => {
    const text = `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.platform}] ${log.message}`;
    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddManualTestLog = () => {
    const newLog: SystemLogEntry = {
      id: `manual-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "success",
      category: "AUTO_FIX",
      platform: "aiwibcrafter",
      message: "⚡ [اختبار مطور] تم محاكاة عملية معالجة خلفية وتحديث مفتاح الربط للذكاء الاصطناعي.",
      executedBy: "DevOps Engineer (Manual Test)",
      details: { simulation: true, latency_ms: 42, status: "completed" },
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end font-sans dir-rtl">
      <div className="w-full max-w-2xl bg-[#07090e] border-r border-white/10 shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-300">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center animate-neon-pulse-glow shadow-lg shadow-emerald-500/20">
              <Terminal className="w-4 h-4 text-black font-black" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <span>سجلات النظام الحية (Live System Logs)</span>
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLiveStreaming ? "bg-emerald-400 opacity-75" : "bg-amber-400 opacity-50"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveStreaming ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">مراقبة العمليات الخلفية، معالجة البوابات، وإجراءات الإصلاح التلقائي</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isLiveStreaming
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
              }`}
              title={isLiveStreaming ? "إيقاف التحديث التلقائي مؤقتاً" : "استئناف التحديث البث المباشر"}
            >
              {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveStreaming ? "بث حي نشط" : "متوقف مؤقتاً"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-3 border-b border-white/10 bg-[#0b0f19] space-y-2.5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
            {[
              { id: "ALL", label: "جميع السجلات", icon: Activity },
              { id: "AUTO_FIX", label: "إصلاحات AI", icon: Sparkles },
              { id: "GATEWAY", label: "بوابة الواتساب", icon: Zap },
              { id: "SECURITY", label: "المفاتيح والأمان", icon: Key },
              { id: "DATABASE", label: "قواعد البيانات", icon: Database },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Level Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="تصفية السجلات حسب النص، المنصة، أو المنفذ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-bold">
              {["ALL", "info", "success", "warn", "error"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(lvl)}
                  className={`px-2 py-0.5 rounded uppercase font-mono transition-all cursor-pointer ${
                    activeLevel === lvl
                      ? "bg-cyan-500 text-black font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl === "ALL" ? "الكل" : lvl}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAddManualTestLog}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                title="إضافة سجل تجريبي في القائمة"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>سجل تجريبي</span>
              </button>

              <button
                onClick={handleExportLogs}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="تصدير السجلات بصيغة JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Logs Feed Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#05070b] font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2 dir-rtl">
              <Terminal className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">لا توجد سجلات مطابقة للتصفية الحالية</p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                جرب تغيير خيارات التصفية أو زر الحفظ والعمليات لتوليد أحداث خلفية جديدة.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isError = log.level === "error";
              const isWarn = log.level === "warn";
              const isSuccess = log.level === "success";
              const isExpanded = expandedLogId === log.id;

              return (
                <div
                  key={log.id}
                  className={`rounded-xl p-3 border transition-all ${
                    isError
                      ? "bg-red-950/20 border-red-500/30 text-red-200"
                      : isWarn
                      ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                      : isSuccess
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                      : "bg-slate-900/60 border-slate-800 text-slate-200"
                  }`}
                >
                  {/* Log Item Main Line */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Level Icon */}
                      {isError ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}

                      {/* Category Badge */}
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/40 border border-white/10">
                        {log.category}
                      </span>

                      {/* Platform Badge */}
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {log.platform}
                      </span>

                      {/* Time */}
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Copy & Expand Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyLog(log)}
                        className="p-1 rounded bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="نسخ السجل"
                      >
                        {copiedId === log.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      {log.details && (
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="px-2 py-0.5 rounded text-[9px] bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                        >
                          {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <p className="mt-2 text-xs font-sans leading-relaxed text-slate-100 font-semibold dir-rtl">
                    {log.message}
                  </p>

                  {/* Executor Info */}
                  {log.executedBy && (
                    <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1 font-sans dir-rtl">
                      <Bot className="w-3 h-3 text-cyan-400" />
                      <span>تم بواسطة: {log.executedBy}</span>
                    </div>
                  )}

                  {/* Collapsible Details Panel */}
                  {isExpanded && log.details && (
                    <div className="mt-2.5 p-3 rounded-lg bg-black/80 border border-slate-800 text-[10px] space-y-1.5 overflow-x-auto text-cyan-300 dir-ltr">
                      <div className="text-slate-400 text-[9px] uppercase tracking-wider font-sans mb-1 dir-rtl">
                        حمولة البيانات وحالة العملية (Payload Data)
                      </div>
                      <pre className="font-mono leading-tight whitespace-pre-wrap">
                        {typeof log.details === "string"
                          ? log.details
                          : JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Footer Status Bar */}
        <div className="p-3 border-t border-white/10 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>إجمالي السجلات: <strong className="text-white font-mono">{logs.length}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLogs([])}
              className="text-slate-500 hover:text-red-400 text-[11px] underline cursor-pointer"
            >
              مسح السجلات الحالية
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-[10px] text-slate-500 font-mono">
              AutoBot Command Center v2.6
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
