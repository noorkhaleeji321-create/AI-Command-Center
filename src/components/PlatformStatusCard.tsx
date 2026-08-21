import React from "react";
import { Activity, CheckCircle2, AlertOctagon, Github, ExternalLink, Server } from "lucide-react";
import { PlatformMetrics } from "../types";

interface PlatformStatusCardProps {
  metrics: PlatformMetrics;
}

export const PlatformStatusCard: React.FC<PlatformStatusCardProps> = ({ metrics }) => {
  if (!metrics) return null;

  const isCritical = metrics.status === "critical";
  const isDegraded = metrics.status === "degraded";

  return (
    <div
      className={`glass-panel rounded-xl p-2.5 sm:p-3 transition-all h-full flex flex-col justify-between ${
        isCritical
          ? "border-red-500/40 animate-critical-pulse-glow"
          : isDegraded
          ? "border-amber-500/30"
          : "border-white/10 hover:border-cyan-500/30"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              metrics.name === "aiwibcrafter"
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "bg-purple-500/10 border-purple-500/30 text-purple-400"
            }`}
          >
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider">
              {metrics.name === "aiwibcrafter"
                ? "مهندس الويب (WebCraft AI)"
                : metrics.name === "AutoBot WA"
                ? "وكيل الواتساب (AutoBot WA)"
                : metrics.name}
            </h3>
            <p className="text-[9px] text-white/40 font-mono truncate">{metrics.repoName}</p>
          </div>
        </div>

        <span
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
            isCritical
              ? "bg-red-500/20 text-red-400 border-red-500/40"
              : isDegraded
              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCritical
                ? "bg-red-500 shadow-[0_0_8px_#ff3131]"
                : isDegraded
                ? "bg-amber-400"
                : "bg-cyan-400 shadow-[0_0_8px_#00f5ff]"
            }`}
          />
          {isCritical ? "حادث نشط" : isDegraded ? "أداء منخفض" : "تشغيل مستقر"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
        <div className="p-2 rounded-lg bg-black/40 border border-white/5">
          <span className="text-[9px] text-white/40 block mb-0.5 uppercase tracking-wider font-bold">التنبيهات النشطة</span>
          <span
            className={`text-sm font-mono font-bold ${
              metrics.activeAlertsCount > 0 ? "text-red-400 neon-red" : "text-cyan-400 neon-cyan"
            }`}
          >
            {metrics.activeAlertsCount}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-white/5">
          <span className="text-[9px] text-white/40 block mb-0.5 uppercase tracking-wider font-bold">نسبة التوفر</span>
          <span className="text-sm font-mono font-bold text-cyan-400">{metrics.uptime}</span>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-white/5">
          <span className="text-[9px] text-white/40 block mb-0.5 uppercase tracking-wider font-bold">متوسط الاستجابة</span>
          <span className="text-sm font-mono font-bold text-purple-400">
            {metrics.latencyMs} ملّي ثانية
          </span>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-white/5">
          <span className="text-[9px] text-white/40 block mb-0.5 uppercase tracking-wider font-bold">تم إصلاحه اليوم</span>
          <span className="text-sm font-mono font-bold text-emerald-400">
            {metrics.resolvedToday}
          </span>
        </div>
      </div>
    </div>
  );
};
