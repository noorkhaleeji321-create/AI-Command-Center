import React, { useState } from "react";
import {
  Activity,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  PlusCircle,
  Database,
  Bot,
} from "lucide-react";
import {
  SystemAlert,
  AIAction,
  PlatformMetrics,
  PlatformName,
  SeverityLevel,
  AlertStatus,
  AuthUser,
} from "../types";
import { ErrorCard } from "./ErrorCard";
import { PlatformStatusCard } from "./PlatformStatusCard";
import { AIActionsFeedCard } from "./AIActionsFeedCard";
import { SystemMetricsCard } from "./SystemMetricsCard";
import { SecurityShieldCard } from "./SecurityShieldCard";
import { ModulesMarketplace } from "./ModulesMarketplace";

interface MasonryDashboardProps {
  alerts?: SystemAlert[];
  actions?: AIAction[];
  platforms?: PlatformMetrics[];
  currentUser?: AuthUser | null;
  onSelectForAutoFix?: (alert: SystemAlert, mode?: "code" | "database") => void;
  onSelectForAgentChat?: (alert?: SystemAlert | null) => void;
  onOpenWebhookTester?: () => void;
}

export const MasonryDashboard: React.FC<MasonryDashboardProps> = ({
  alerts = [],
  actions = [],
  platforms = [],
  currentUser,
  onSelectForAutoFix = (_alert, _mode) => {},
  onSelectForAgentChat = (_alert) => {},
  onOpenWebhookTester = () => {},
}) => {
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAlerts = (alerts || []).filter((alert) => {
    if (platformFilter !== "all" && alert.platform !== platformFilter) return false;
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
    if (statusFilter !== "all" && alert.status !== statusFilter) return false;
    return true;
  });

  const activeAlerts = (alerts || []).filter((a) => a.status === "active" || a.status === "triaged");
  const resolvedAlerts = (alerts || []).filter((a) => a.status === "resolved");

  return (
    <main className="w-full px-3 sm:px-6 py-2.5 space-y-3 flex-1">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-sans">
        <div className="glass-panel p-2.5 rounded-lg flex items-center justify-between border-white/10">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">التنبيهات النشطة</span>
            <span className="text-xl font-mono font-bold text-red-400 neon-red mt-0.5 block">
              {activeAlerts.length}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel p-2.5 rounded-lg flex items-center justify-between border-white/10">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">المصلحة تلقائياً اليوم</span>
            <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5 block">
              {resolvedAlerts.length}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel p-2.5 rounded-lg flex items-center justify-between border-white/10">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">التعديلات التلقائية</span>
            <span className="text-xl font-mono font-bold text-cyan-400 neon-cyan mt-0.5 block">
              {(actions || []).filter((a) => a.action_type === "github_commit").length}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel p-2.5 rounded-lg flex items-center justify-between border-white/10">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">زمن التشخيص</span>
            <span className="text-xl font-mono font-bold text-purple-400 mt-0.5 block">
              0.84 ثانية
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-panel p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2 border-white/10 font-sans">
        <div className="flex items-center gap-2 text-xs text-white uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">تصفية البيانات:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs uppercase tracking-wider">
          {/* Platform Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-white/40 text-[10px]">المنصة:</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-md px-2 py-0.5 text-white text-[10px] focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="all">جميع المنصات</option>
              <option value="aiwibcrafter">aiwibcrafter</option>
              <option value="AutoBot WA">AutoBot WA</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-white/40 text-[10px]">الخطورة:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-md px-2 py-0.5 text-white text-[10px] focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="all">جميع المستويات</option>
              <option value="critical">حرج (Critical)</option>
              <option value="high">عالي (High)</option>
              <option value="medium">متوسط (Medium)</option>
              <option value="low">منخفض (Low)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-white/40 text-[10px]">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-md px-2 py-0.5 text-white text-[10px] focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط (Active)</option>
              <option value="triaged">مُشخَّص (Triaged)</option>
              <option value="resolved">تم الإصلاح (Resolved)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: System Overview & Telemetry Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>لوحة تحكم المنصات والخدمات</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 items-stretch">
          {/* Monitored Platform Status Cards */}
          {platforms.map((p) => (
            <div key={p.name} className="h-full">
              <PlatformStatusCard metrics={p} />
            </div>
          ))}

          {/* Security Shield Card */}
          <div className="h-full">
            <SecurityShieldCard alerts={alerts} actions={actions} platforms={platforms} />
          </div>

          {/* System Metrics Card */}
          <div className="h-full">
            <SystemMetricsCard
              githubStatus={true}
              supabaseStatus={true}
              geminiStatus={true}
            />
          </div>

          {/* AI Actions Feed Card */}
          <div className="h-full">
            <AIActionsFeedCard actions={actions} />
          </div>
        </div>
      </div>

      {/* Section 2: Active System Alerts & Diagnostics */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>تنبيهات الأخطاء والتشخيص الذكي ({filteredAlerts.length})</span>
          </h2>
        </div>

        {filteredAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 items-stretch">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="h-full">
                <ErrorCard
                  alert={alert}
                  onSelectForAutoFix={(a) => onSelectForAutoFix(a, "code")}
                  onSelectForAgentChat={(a) => onSelectForAgentChat(a)}
                  onExecuteDatabaseFix={(a) => onSelectForAutoFix(a, "database")}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 font-sans">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">لا توجد تنبيهات ناتجة عن التصفية</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              منصتا aiwibcrafter و AutoBot WA تعملان بصورة مستقرة وسليمة. يمكنك إرسال خطأ تجريبي في أي وقت لاختبار التحليل التلقائي بواسطة الذكاء الاصطناعي.
            </p>
            <button
              onClick={onOpenWebhookTester}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إرسال خطأ تجريبي</span>
            </button>
          </div>
        )}
      </div>

      {/* Add-ons & Marketplace Dashboard Removed - Moved to AgentChatDrawer */}
    </main>
  );
};
