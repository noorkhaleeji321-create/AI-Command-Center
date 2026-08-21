import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Zap,
  Server,
  FileCode2,
  CheckCircle2,
  Bot,
  RefreshCw,
  Wrench,
  AlertTriangle,
  UploadCloud,
  Check,
  Search,
  Filter,
} from "lucide-react";

export interface AuditFinding {
  id: string;
  botId: string;
  botName: string;
  file: string;
  line?: number;
  issue: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "Security" | "Quality" | "Performance" | "Deployment";
  recommendation: string;
  autoFixAvailable: boolean;
}

export const FullAuditReportPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [fixSuccessMessage, setFixSuccessMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [findings, setFindings] = useState<AuditFinding[]>([
    {
      id: "f1",
      botId: "bot-security",
      botName: "حارس الأسرار والأمان (Security Inspector)",
      file: "server/routes/platforms.ts",
      line: 42,
      issue: "مفتاح API غير مشفر بالكامل في متغيرات البيئة المؤقتة",
      severity: "HIGH",
      category: "Security",
      recommendation: "استخدام Secret Manager المعتمد وتشفير الجلسات بدلاً من التخزين المكشوف.",
      autoFixAvailable: true,
    },
    {
      id: "f2",
      botId: "bot-security",
      botName: "حارس الأسرار والأمان (Security Inspector)",
      file: "server/aiEngine.ts",
      line: 104,
      issue: "احتمالية حدوث TypeError عند قراءة userId من كائن undefined داخل AuthMiddleware",
      severity: "CRITICAL",
      category: "Security",
      recommendation: "تطبيق تسلسل اختياري (req.user?.userId) وحماية الجلسة.",
      autoFixAvailable: true,
    },
    {
      id: "f3",
      botId: "bot-quality",
      botName: "مراقب الجودة والأصالة (Code Quality Auditor)",
      file: "server/routes/actions.ts",
      line: 88,
      issue: "عدم معالجة استثناءات القيمة null في deployTarget",
      severity: "MEDIUM",
      category: "Quality",
      recommendation: "إضافة تعيين افتراضي للهدف `deployTarget || 'cloud_run'`.",
      autoFixAvailable: true,
    },
    {
      id: "f4",
      botId: "bot-performance",
      botName: "درع الأداء والثغرات (Performance Sentinel)",
      file: "server/db.ts",
      line: 15,
      issue: "استعلام متكرر بدون Connection Pooling تحت الضغط المرتفع",
      severity: "LOW",
      category: "Performance",
      recommendation: "تفعيل التخزين المؤقت وحجم الحوض المجمع (Pool Size).",
      autoFixAvailable: true,
    },
  ]);

  const handleRunFullScan = async () => {
    setIsScanning(true);
    setFixSuccessMessage(null);
    try {
      const res = await fetch("/api/platforms/full-project-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetScope: "ALL_PROJECT_FILES" }),
      });
      const data = await res.json();
      if (data.success && data.botReports) {
        const newFindings: AuditFinding[] = [];
        data.botReports.forEach((report: any) => {
          (report.findings || []).forEach((f: any, idx: number) => {
            newFindings.push({
              id: `f-${report.botId}-${idx}-${Date.now()}`,
              botId: report.botId,
              botName: report.botName,
              file: f.file || "project-root",
              issue: f.issue || "ثغرة أو تحذير في الأكواد",
              severity: report.severity || "MEDIUM",
              category: report.botId.includes("security")
                ? "Security"
                : report.botId.includes("quality")
                ? "Quality"
                : report.botId.includes("performance")
                ? "Performance"
                : "Deployment",
              recommendation: f.recommendation || report.suggestedFix,
              autoFixAvailable: true,
            });
          });
        });
        if (newFindings.length > 0) {
          setFindings(newFindings);
        }
      }
    } catch (err: any) {
      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFixAll = async () => {
    setIsFixingAll(true);
    setFixSuccessMessage(null);
    try {
      const res = await fetch("/api/actions/trigger-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionDescription: "إصلاح ذكي شامل لكافة الأخطاء المكتشفة في المشروع ودفع التحديثات مباشرة لـ GitHub",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFindings([]);
        setFixSuccessMessage("✅ تم إصلاح كافة الأخطاء المكتشفة بنجاح ودفع التحديثات إلى مستودع GitHub!");
      }
    } catch (err: any) {
      console.error("Fix all error:", err);
    } finally {
      setIsFixingAll(false);
    }
  };

  const filteredFindings = findings.filter((f) => {
    if (filterCategory !== "all" && f.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        f.file.toLowerCase().includes(q) ||
        f.issue.toLowerCase().includes(q) ||
        f.botName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>تقارير الفحص الشامل للوكلاء (Agent Audit Hub)</span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500/30 text-rose-300 font-bold">
                {findings.length} خطأ مكتشف
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              عرض تفصيلي لكافة الأخطاء المكتشفة من قبل وكلاء الفحص في المشروع مع إمكانية إصلاح الكل بنقرة واحدة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunFullScan}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "جاري إعادة الفحص..." : "فحص جديد الآن"}</span>
          </button>

          <button
            onClick={handleFixAll}
            disabled={isFixingAll || findings.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer disabled:opacity-50"
          >
            <Wrench className={`w-4 h-4 ${isFixingAll ? "animate-bounce" : ""}`} />
            <span>{isFixingAll ? "جاري إصلاح جميع الأخطاء..." : "🚀 إصلاح الكل بنقرة واحدة"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {fixSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{fixSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الملف أو نوع الخطأ..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-bold shrink-0">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>التصنيف:</span>
          </span>

          {["all", "security", "quality", "performance", "deployment"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? "bg-cyan-950 border border-cyan-500/40 text-cyan-300"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat === "all" ? "الكل" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">المشروع سليم خالٍ من الأخطاء المكتشفة!</h3>
            <p className="text-xs text-slate-500">تم معالجة كافة الأخطاء والتحذيرات بنجاح بواسطة الوكلاء الذكيين.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredFindings.map((finding) => (
              <div key={finding.id} className="p-5 hover:bg-slate-800/30 transition-colors space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        finding.severity === "CRITICAL"
                          ? "bg-rose-950 border-rose-500/40 text-rose-300"
                          : finding.severity === "HIGH"
                          ? "bg-amber-950 border-amber-500/40 text-amber-300"
                          : "bg-cyan-950 border-cyan-500/40 text-cyan-300"
                      }`}
                    >
                      {finding.severity}
                    </span>

                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{finding.file}</span>
                      {finding.line && <span className="text-slate-500 font-mono">:{finding.line}</span>}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {finding.botName}
                  </span>
                </div>

                <p className="text-xs text-white font-medium leading-relaxed">{finding.issue}</p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-mono space-y-1">
                  <p className="text-cyan-400 font-bold">💡 التوصية والإصلاح المقترح:</p>
                  <p className="text-slate-300">{finding.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
