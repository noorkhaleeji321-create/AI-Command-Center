import React, { useState } from "react";
import { safeFetchJson } from "../utils/safeFetch";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Github,
  Database,
  Bot,
  ExternalLink,
  Clock,
  ShieldAlert,
  ArrowRightLeft,
  X,
  Layers,
} from "lucide-react";
import { AIAction, PlatformName } from "../types";

interface HistoryRollbackPageProps {
  actions?: AIAction[];
  onRefresh?: () => void;
}

export const HistoryRollbackPage: React.FC<HistoryRollbackPageProps> = ({
  actions = [],
  onRefresh = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Rollback Modal State
  const [selectedActionForRollback, setSelectedActionForRollback] = useState<AIAction | null>(null);
  const [rollbackReason, setRollbackReason] = useState("");
  const [isSubmittingRollback, setIsSubmittingRollback] = useState(false);
  const [rollbackSuccessMsg, setRollbackSuccessMsg] = useState<string | null>(null);

  // Filter actions
  const filteredActions = (actions || []).filter((act) => {
    const matchesSearch =
      act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.target_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.executed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (act.commit_sha && act.commit_sha.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlatform = selectedPlatform === "all" || act.platform === selectedPlatform;
    const matchesType = selectedType === "all" || act.action_type === selectedType;

    return matchesSearch && matchesPlatform && matchesType;
  });

  const handleExecuteRollback = async () => {
    if (!selectedActionForRollback) return;
    setIsSubmittingRollback(true);
    setRollbackSuccessMsg(null);

    try {
      const res = await fetch("/api/actions/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionId: selectedActionForRollback.id,
          platform: selectedActionForRollback.platform,
          reason: rollbackReason || "تراجع يدوي بواسطة مهندس DevOps",
        }),
      });

      const data = await safeFetchJson(res);
      if (res.ok && data.success) {
        setRollbackSuccessMsg(data.message || "تم تنفيذ التراجع بنجاح!");
        setTimeout(() => {
          setSelectedActionForRollback(null);
          setRollbackReason("");
          setRollbackSuccessMsg(null);
          onRefresh();
        }, 1800);
      } else {
        alert(data.error || "فشل تنفيذ التراجع");
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء الاتصال بخادم التراجع: " + err.message);
    } finally {
      setIsSubmittingRollback(false);
    }
  };

  const getActionTypeBadge = (type: string) => {
    switch (type) {
      case "github_commit":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Github className="w-3 h-3 text-blue-400" /> التزام GitHub
          </span>
        );
      case "supabase_query":
      case "database_query":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Database className="w-3 h-3 text-emerald-400" /> استعلام SQL
          </span>
        );
      case "rollback":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <RotateCcw className="w-3 h-3 text-amber-400" /> تراجع تشغيلي
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Bot className="w-3 h-3 text-cyan-400" /> تشخيص تلقائي
          </span>
        );
    }
  };

  const getStatusBadge = (status: string, actionType?: string) => {
    if (status === "rolled_back" || actionType === "rollback") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/35 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          تم التراجع
        </span>
      );
    }

    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            تم التطبيق
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/35 shadow-[0_0_8px_rgba(239,68,68,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            فشل
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            قيد الانتظار
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-cyan-400 animate-spin-slow" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              سجل التنفيذ وسجل التدقيق (/history)
            </h2>
          </div>
          <p className="text-xs text-white/60 max-w-2xl">
            مراقبة شاملة لجميع التعديلات والقرارات المنفذة بواسطة الذكاء الاصطناعي مع القدرة على التراجع الفوري عن الأخطاء واستعادة الحالة المستقرة عبر GitHub API و Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/80 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>تحديث السجل</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-black/30 border border-white/10 p-3 rounded-2xl">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-white/40 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث في الوصف، الملفات، أو SHA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-all font-mono dir-rtl"
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">كل المنصات</option>
            <option value="aiwibcrafter">AIWebCraft</option>
            <option value="AutoBot WA">AutoBot WA</option>
            <option value="command_center">Command Center</option>
          </select>
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">كل أنواع الإجراءات</option>
            <option value="github_commit">Git Commit</option>
            <option value="supabase_query">Supabase SQL</option>
            <option value="triage_analysis">AI Triage</option>
            <option value="rollback">Rollbacks</option>
          </select>
        </div>
      </div>

      {/* History Actions Table */}
      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {filteredActions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Clock className="w-10 h-10 text-cyan-400/30 mx-auto" />
            <h3 className="text-sm font-bold text-white/80">لا توجد عمليات مسجلة متطابقة مع البحث</h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              عند تنفيذ أي تشخيص تلقائي أو تعديل برمجي، سيتم توثيقه هنا تلقائياً مع خيار التراجع عنه بضغطة زر.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-white/80">
              <thead className="bg-white/5 border-b border-white/10 text-white/60 font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4 text-right">الطابع الزمني</th>
                  <th className="py-3 px-4 text-right">المنصة</th>
                  <th className="py-3 px-4 text-right">ملخص الأخطاء</th>
                  <th className="py-3 px-4 text-right">الملف / الاستعلام المُعدَّل</th>
                  <th className="py-3 px-4 text-right">نوع الإجراء</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredActions.map((act) => {
                  const isRollback = act.action_type === "rollback" || act.status === "rolled_back";

                  return (
                    <tr key={act.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-white/60 whitespace-nowrap">
                        {new Date(act.created_at).toLocaleString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                          {act.platform === "aiwibcrafter" ? "AIWebCraft" : act.platform}
                        </span>
                      </td>

                      {/* Error summary / Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-white/90 line-clamp-2" title={act.description}>
                          {act.description}
                        </p>
                      </td>

                      {/* Modified file / query */}
                      <td className="py-3 px-4 max-w-xs font-mono text-[11px] text-white/60 whitespace-nowrap overflow-hidden text-ellipsis">
                        <div className="flex items-center gap-1.5">
                          <span title={act.target_ref}>{act.target_ref}</span>
                          {act.commit_sha && (
                            <a
                              href={act.commit_url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline inline-flex items-center gap-1 text-[10px]"
                            >
                              <span>#{act.commit_sha.slice(0, 7)}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Action Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActionTypeBadge(act.action_type)}
                      </td>

                      {/* Status badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(act.status, act.action_type)}
                      </td>

                      {/* Action column (Rollback button) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isRollback ? (
                          <span className="text-[10px] text-amber-400/60 font-mono font-bold">
                            تم التراجع عنه
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedActionForRollback(act)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/60 rounded-lg text-[11px] font-bold flex items-center gap-1.5 mx-auto transition-all cursor-pointer shadow-sm"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>تراجع</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ROLLBACK CONFIRMATION MODAL */}
      {selectedActionForRollback && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-red-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <ShieldAlert className="w-5 h-5 animate-bounce" />
                <h3>تأكيد التراجع التشغيلي (Rollback)</h3>
              </div>
              <button
                onClick={() => setSelectedActionForRollback(null)}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-white/80">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                <span className="font-bold text-red-400 block">الإجراء المراد التراجع عنه:</span>
                <p className="font-mono text-white/90">{selectedActionForRollback.description}</p>
                <div className="text-[11px] text-white/50 flex items-center gap-3 font-mono pt-1">
                  <span>المنصة: {selectedActionForRollback.platform}</span>
                  <span>الرمز: {selectedActionForRollback.id}</span>
                </div>
              </div>

              <p className="text-white/70">
                سيؤدي التراجع إلى إعادة تعيين حالة التنبيه في نظام المراقبة واستعادة الحالة المستقرة قبل تطبيق التعديل على منصة <span className="text-cyan-400 font-mono">{selectedActionForRollback.platform}</span>.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">
                  سبب التراجع (اختياري توثيقه في السجل):
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: اكتشاف تعارض في دالة المصادقة بعد النشر..."
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  className="w-full bg-black/80 border border-white/20 rounded-xl p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-red-500 dir-rtl"
                />
              </div>

              {rollbackSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-center font-bold">
                  {rollbackSuccessMsg}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedActionForRollback(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                disabled={isSubmittingRollback}
                onClick={handleExecuteRollback}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-400 text-black flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {isSubmittingRollback ? (
                  <span>جاري التراجع...</span>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تأكيد وتنفيذ التراجع الأن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
