import React from "react";
import { Bot, CheckCircle2, Database, GitCommit, Sparkles, Terminal } from "lucide-react";
import { AIAction } from "../types";

interface AIActionsFeedCardProps {
  actions: AIAction[];
}

export const AIActionsFeedCard: React.FC<AIActionsFeedCardProps> = ({ actions = [] }) => {
  return (
    <div className="glass-panel rounded-xl p-2.5 sm:p-3 border-white/10 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans uppercase tracking-wider">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>سجل إجراءات الذكاء الاصطناعي التلقائية</span>
        </h3>
        <span className="text-[9px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider">
          روبوت Gemini
        </span>
      </div>

      {actions.length === 0 ? (
        <div className="py-6 px-3 text-center text-white/40 space-y-1.5 font-sans my-auto">
          <Bot className="w-6 h-6 text-cyan-400/30 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">لم يتم تنفيذ أي إصلاحات تلقائية بعد</p>
          <p className="text-[10px] text-white/30 max-w-xs mx-auto">
            سجل العمليات الإصلاحية يمتلئ فور تطبيق اقتراحات Gemini الذكية والتصحيح التلقائي عبر GitHub أو Supabase.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {actions.map((act) => {
            const isCommit = act.action_type === "github_commit";
            const isQuery = act.action_type === "supabase_query";

            return (
              <div
                key={act.id}
                className="p-2 rounded-lg bg-black/40 border border-white/5 text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between text-white/80">
                  <div className="flex items-center gap-1 font-bold uppercase tracking-wider text-[10px]">
                    {isCommit ? (
                      <GitCommit className="w-3 h-3 text-cyan-400" />
                    ) : isQuery ? (
                      <Database className="w-3 h-3 text-purple-400" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    )}
                    <span className="text-white">
                      {act.platform === "aiwibcrafter"
                        ? "مهندس الويب (WebCraft)"
                        : act.platform === "AutoBot WA"
                        ? "وكيل الواتساب (AutoBot)"
                        : act.platform}
                    </span>
                  </div>

                  <span className="text-[9px] text-white/40">
                    {new Date(act.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-white/70 text-[10px] leading-snug">{act.description}</p>

                {act.commit_sha && (
                  <div className="flex items-center gap-1.5 pt-0.5 text-[9px] text-cyan-400 font-mono">
                    <span>Commit SHA:</span>
                    <a
                      href={act.commit_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-cyan-300"
                    >
                      {act.commit_sha.slice(0, 7)}
                    </a>
                  </div>
                )}

                {act.sql_executed && (
                  <code className="block p-1 rounded bg-black/60 text-purple-300 text-[9px] overflow-x-auto border border-white/5 font-mono">
                    {act.sql_executed}
                  </code>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
