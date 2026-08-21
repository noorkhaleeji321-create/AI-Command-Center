import React from "react";
import { Activity, Zap, Github, Database } from "lucide-react";

interface SystemMetricsCardProps {
  githubStatus: boolean;
  supabaseStatus: boolean;
  geminiStatus: boolean;
}

export const SystemMetricsCard: React.FC<SystemMetricsCardProps> = ({
  githubStatus,
  supabaseStatus,
  geminiStatus,
}) => {
  return (
    <div className="glass-panel rounded-xl p-2.5 sm:p-3 border-white/10 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>حالة النظام والتكاملات</span>
        </h3>
        <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          نشط وبصحة جيدة
        </span>
      </div>

      <div className="space-y-2 font-sans text-xs">
        {/* Gemini Engine */}
        <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <span className="text-white font-bold block uppercase tracking-wider text-[10px]">محرك الذكاء الاصطناعي Gemini</span>
              <span className="text-[9px] text-white/40">التشخيص الهيكلي والمحادثة الذكية</span>
            </div>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] border uppercase tracking-wider font-bold font-mono shrink-0 ${
              geminiStatus
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
            }`}
          >
            {geminiStatus ? "متصل" : "محاكاة"}
          </span>
        </div>

        {/* GitHub API */}
        <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-white font-bold block uppercase tracking-wider text-[10px]">خدمة GitHub API</span>
              <span className="text-[9px] text-white/40">إرسال التعديلات البرمجية التلقائية</span>
            </div>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] border uppercase tracking-wider font-bold font-mono shrink-0 ${
              githubStatus
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
            }`}
          >
            {githubStatus ? "مُتحقق منه" : "محاكاة"}
          </span>
        </div>

        {/* Supabase DB */}
        <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <div>
              <span className="text-white font-bold block uppercase tracking-wider text-[10px]">قاعدة بيانات Supabase</span>
              <span className="text-[9px] text-white/40">PostgreSQL وحماية RLS</span>
            </div>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] border uppercase tracking-wider font-bold font-mono shrink-0 ${
              supabaseStatus
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-purple-500/10 text-purple-300 border-purple-500/30"
            }`}
          >
            {supabaseStatus ? "متصل" : "ذاكرة مؤقتة"}
          </span>
        </div>
      </div>
    </div>
  );
};
