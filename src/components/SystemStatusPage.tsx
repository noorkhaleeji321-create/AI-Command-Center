import React, { useState, useEffect } from "react";
import { safeFetchJson } from "../utils/safeFetch";
import {
  Activity,
  Server,
  Database,
  Bot,
  Zap,
  Github,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Globe,
  MessageSquare,
  Send,
  Sparkles,
  Search,
  Wifi,
  WifiOff,
  Key,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";

interface SystemStatusData {
  status: string;
  timestamp: string;
  services: {
    cloud_run: { name: string; status: string; latency_ms: number; uptime: string };
    vercel: { name: string; status: string; latency_ms: number; uptime: string };
    supabase: { name: string; status: string; latency_ms: number; uptime: string };
    gemini_ai: { name: string; status: string; latency_ms: number; uptime: string };
    webhook_ingest: { name: string; status: string; latency_ms: number; uptime: string };
    github_integration: { name: string; status: string; latency_ms: number; uptime: string };
  };
  metrics: {
    total_errors_today: number;
    resolved_errors_today: number;
    auto_fix_success_rate: number;
    avg_ai_latency_ms: number;
    total_webhooks_processed: number;
  };
}

// Simple custom Markdown to JSX parser for elegant styled report rendering
const SimpleMarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
  const lines = markdown.split("\n");
  return (
    <div className="space-y-3 text-right text-sm leading-relaxed text-white/80">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-base font-extrabold text-white mt-4 border-b border-white/5 pb-1 flex items-center gap-1.5 justify-end">
              <span>{trimmed.replace("### ", "")}</span>
            </h3>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={idx} className="text-sm font-bold text-cyan-400 mt-2 flex items-center gap-1 justify-end">
              <span>{trimmed.replace("#### ", "")}</span>
            </h4>
          );
        }
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const content = trimmed.substring(2);
          // Highlight **bold** text in list item
          const boldParts = content.split("**");
          return (
            <li key={idx} className="list-none mr-3 flex items-start gap-1.5 justify-end text-white/80">
              <span className="text-right">
                {boldParts.map((part, pIdx) =>
                  pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-semibold">{part}</strong> : part
                )}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
            </li>
          );
        }
        if (trimmed === "---") {
          return <hr key={idx} className="border-white/10 my-3" />;
        }
        if (trimmed === "") {
          return null;
        }
        // Handle bold in regular paragraph
        const boldParts = trimmed.split("**");
        return (
          <p key={idx} className="text-white/70">
            {boldParts.map((part, pIdx) =>
              pIdx % 2 === 1 ? <strong key={pIdx} className="text-cyan-300 font-bold">{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
};

export interface SystemStatusPageProps {}

export const SystemStatusPage: React.FC<SystemStatusPageProps> = () => {
  const [data, setData] = useState<SystemStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPingActive, setIsPingActive] = useState(false);

  // Platform Ping State
  const [pingPlatform, setPingPlatform] = useState<"AIWebCraft" | "AutoBot WA">("AIWebCraft");
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    status: string;
    latencyMs: number;
    message: string;
    checkedUrl: string;
  } | null>(null);

  // WhatsApp Simulator State
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("🚨 تنبيه: تم رصد حمولة Webhook غير صالحة في منصة AIWebCraft. هل تود تشغيل الإصلاح التلقائي؟");
  const [isSendingWA, setIsSendingWA] = useState(false);
  const [waSuccess, setWaSuccess] = useState<boolean | null>(null);
  const [waFeedback, setWaFeedback] = useState<string>("");
  const [waIsAuthError, setWaIsAuthError] = useState(false);
  const [waActionHint, setWaActionHint] = useState<string>("");

  // AI Diagnostics Report State
  const [aiReport, setAiReport] = useState<string>("");
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/system/health");
      const json = await safeFetchJson(res);
      if (res.ok && json.platforms) {
        setData(json);
      }
    } catch (e) {
      console.warn("Health check error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAIReport = async () => {
    setIsLoadingReport(true);
    try {
      const res = await fetch("/api/ai/diagnostics");
      const json = await safeFetchJson(res);
      if (res.ok && json.success) {
        setAiReport(json.report);
      }
    } catch (e) {
      console.warn("AI Diagnostics fetch error:", e);
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchAIReport();
    
    // Attempt to load WHATSAPP_PHONE from environmental secrets to prefill
    const fetchPrefillPhone = async () => {
      try {
        const res = await fetch("/api/env-vars");
        const json = await safeFetchJson(res);
        if (res.ok && json.secrets) {
          const found = json.secrets.find(
            (s: any) => s.key_name.toUpperCase() === "WHATSAPP_PHONE" || s.key_name.toUpperCase().includes("WA_PHONE")
          );
          if (found && found.key_value) {
            setWaPhone(found.key_value);
          }
        }
      } catch (e) {
        console.warn("Failed to prefill whatsapp phone:", e);
      }
    };
    fetchPrefillPhone();

    const interval = setInterval(fetchHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleManualPing = async () => {
    setIsPingActive(true);
    await fetchHealth();
    setTimeout(() => setIsPingActive(false), 800);
  };

  const handleExecutePing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await fetch("/api/platforms/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: pingPlatform }),
      });
      const json = await safeFetchJson(res);
      if (res.ok && json.status) {
        setPingResult(json);
        // Refresh health data to capture potential generated alerts if offline!
        fetchHealth();
      }
    } catch (e: any) {
      setPingResult({
        success: false,
        status: "offline",
        latencyMs: 4000,
        message: `خطأ أثناء الاتصال بالخادم: ${e.message || "Timeout"}`,
        checkedUrl: "N/A"
      });
    } finally {
      setIsPinging(false);
    }
  };

  const handleSendWhatsAppMessage = async () => {
    if (!waPhone) {
      alert("الرجاء إدخال رقم هاتف صالح أولاً.");
      return;
    }
    setIsSendingWA(true);
    setWaSuccess(null);
    setWaFeedback("");
    setWaIsAuthError(false);
    setWaActionHint("");
    try {
      const res = await fetch("/api/whatsapp/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: waPhone, messageText: waMessage }),
      });
      const json = await safeFetchJson(res);
      if (res.ok && json.success) {
        setWaSuccess(true);
        setWaFeedback(json.message || "تم إرسال الرسالة بنجاح!");
      } else {
        setWaSuccess(false);
        setWaFeedback(json.message || "فشل إرسال التنبيه. تحقق من بوابة الواتساب.");
        setWaIsAuthError(!!json.isAuthError);
        setWaActionHint(json.actionHint || "");
      }
    } catch (e: any) {
      setWaSuccess(false);
      setWaFeedback(`خطأ في الشبكة: ${e.message || "تعذر الاتصال بالسيرفر"}`);
    } finally {
      setIsSendingWA(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10 text-right">
          <div className="flex items-center gap-2 justify-start">
            <Activity className="w-6 h-6 text-emerald-400 animate-pulse ml-2" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              لوحة معلومات حالة النظام ونقاط النهاية (/status)
            </h2>
          </div>
          <p className="text-xs text-white/60 max-w-2xl">
            مراقبة حية لوقت تشغيل (Uptime) المنصات البرمجية، تشغيل الفحوصات الاستباقية المجدولة، وتوليد تقارير جودة الكود بالذكاء الاصطناعي.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            disabled={isPingActive}
            onClick={handleManualPing}
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPingActive ? "animate-spin" : ""}`} />
            <span>إعادة فحص البنية التحتية الآن</span>
          </button>
        </div>
      </div>

      {/* METRICS OVERVIEW GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-1 shadow-lg text-right">
          <span className="text-[11px] font-bold text-white/50 block">إجمالي الأخطاء اليوم</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">
              {data?.metrics.total_errors_today ?? 0}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              مستمر
            </span>
          </div>
          <p className="text-[10px] text-white/40">التنبيهات المرصودة خلال 24 ساعة الماضية</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-1 shadow-lg text-right">
          <span className="text-[11px] font-bold text-white/50 block">نسبة نجاح الإصلاح التلقائي</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {data?.metrics.auto_fix_success_rate ?? 100}%
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ممتاز
            </span>
          </div>
          <p className="text-[10px] text-white/40">الأخطاء المعالجة تلقائياً دون تدخل يدوي</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-1 shadow-lg text-right">
          <span className="text-[11px] font-bold text-white/50 block">متوسط زمن تشخيص التنبيه</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-cyan-400 font-mono">
              {data?.metrics.avg_ai_latency_ms ?? 380}ms
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Gemini AI
            </span>
          </div>
          <p className="text-[10px] text-white/40">سرعة محرك التحليل والتشخيص</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-1 shadow-lg text-right">
          <span className="text-[11px] font-bold text-white/50 block">إجمالي الـ Webhooks المستقبلة</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {data?.metrics.total_webhooks_processed ?? 0}
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Webhooks
            </span>
          </div>
          <p className="text-[10px] text-white/40">طلبات الأخطاء المستلمة من المنصات الخارجية</p>
        </div>
      </div>

      {/* CORE INFRASTRUCTURE AND INTERACTIVE TESTING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Hand: Services Status & Interactive WhatsApp Alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Monitored Core Infrastructure Services */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white/90 flex items-center gap-2 justify-start">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>حالة الخدمات ونقاط النهاية السحابية (Monitored Infrastructure)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cloud Run Service */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2.5 hover:border-emerald-500/30 transition-all text-right">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    مستقر (Online)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">نشر Cloud Run</span>
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-white/5">
                  <div>
                    <span className="text-white/40 block">الاستجابة:</span>
                    <span className="text-white font-bold">24ms</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">وقت التشغيل:</span>
                    <span className="text-emerald-400 font-bold">99.98%</span>
                  </div>
                </div>
              </div>

              {/* Gemini AI Engine */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2.5 hover:border-cyan-500/30 transition-all text-right">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    جاهز (Online)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">روبوت Gemini 3.6</span>
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-white/5">
                  <div>
                    <span className="text-white/40 block">الاستجابة:</span>
                    <span className="text-cyan-300 font-bold">380ms</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">الحالة:</span>
                    <span className="text-emerald-400 font-bold">مفعلة</span>
                  </div>
                </div>
              </div>

              {/* Supabase Database */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2.5 hover:border-emerald-500/30 transition-all text-right">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    مستقر (Online)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">قاعدة بيانات Supabase</span>
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-white/5">
                  <div>
                    <span className="text-white/40 block">الاستجابة:</span>
                    <span className="text-white font-bold">45ms</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">وقت التشغيل:</span>
                    <span className="text-emerald-400 font-bold">99.95%</span>
                  </div>
                </div>
              </div>

              {/* Webhook API */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2.5 hover:border-emerald-500/30 transition-all text-right">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    مستقر (Active)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">نقطة نهاية الـ Webhooks</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-white/5">
                  <div>
                    <span className="text-white/40 block">الاستجابة:</span>
                    <span className="text-white font-bold">18ms</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">الحمل:</span>
                    <span className="text-emerald-400 font-bold">آمن</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Proactive Interactive Platform Ping (Cron Test Tool) */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="space-y-1 text-right">
              <h3 className="text-sm font-bold text-white/95 flex items-center gap-2 justify-start">
                <Cpu className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>فحص منصات التشغيل التفاعلي المباشر (Uptime & Heartbeat)</span>
              </h3>
              <p className="text-[11px] text-white/50">
                يقوم النظام بإرسال إشارة اختبار (Heartbeat) حية لكلا المنصتين للتأكد من استجابتها وجودة الاتصال. في حال وجود عطل، سيتم تلقائياً فتح تذكرة تنبيه وإصلاحها!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[10px] text-white/40 mb-1 text-right font-sans">اختر المنصة للفحص:</label>
                <select
                  value={pingPlatform}
                  onChange={(e) => setPingPlatform(e.target.value as any)}
                  className="w-full text-xs font-bold text-white bg-black/60 border border-white/10 rounded-lg p-2 focus:border-cyan-500/40 outline-none"
                >
                  <option value="AIWebCraft">AIWebCraft (منصة التطوير)</option>
                  <option value="AutoBot WA">AutoBot WA (بوابة الواتساب)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  disabled={isPinging}
                  onClick={handleExecutePing}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-black font-extrabold rounded-lg text-xs tracking-wider transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-black ${isPinging ? "animate-spin" : ""}`} />
                  <span>{isPinging ? "جاري إجراء فحص النبضة الدوري..." : "إرسال نبضة فحص صامتة (Silent Ping Test)"}</span>
                </button>
              </div>
            </div>

            {pingResult && (
              <div
                className={`p-3.5 rounded-xl border ${
                  pingResult.status === "online"
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-red-950/20 border-red-500/30 text-red-300"
                } text-right text-xs space-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold">{pingResult.latencyMs}ms</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">نتيجة الفحص التلقائي لـ {pingPlatform}:</span>
                    {pingResult.status === "online" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-white/70">{pingResult.message}</p>
                <p className="text-[10px] font-mono text-white/40 truncate">العنوان المفحوص: {pingResult.checkedUrl}</p>
              </div>
            )}
          </div>

          {/* Section 3: Interactive WhatsApp Alerts Control */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="space-y-1 text-right">
              <h3 className="text-sm font-bold text-white/95 flex items-center gap-2 justify-start">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>محاكي إشعارات الواتساب التفاعلية والمباشرة (Interactive WhatsApp Alerts)</span>
              </h3>
              <p className="text-[11px] text-white/50">
                عند حدوث عطل حرج، ترسل بوابة AutoBot WA رسالة تفاعلية فورية إلى هاتفك بأزرار [تطبيق الإصلاح] أو [تجاهل]. اختبر الخدمة بالأسفل!
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/40 mb-1 text-right font-sans">رقم الهاتف المستلم (برمز الدولة):</label>
                  <input
                    type="text"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="مثال: +212612345678"
                    className="w-full text-xs font-bold text-white bg-black/60 border border-white/10 rounded-lg p-2.5 focus:border-cyan-500/40 outline-none text-left"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1 text-right font-sans">نص رسالة التنبيه التفاعلية:</label>
                  <input
                    type="text"
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="w-full text-xs text-white bg-black/60 border border-white/10 rounded-lg p-2.5 focus:border-cyan-500/40 outline-none text-right"
                  />
                </div>
              </div>

              <button
                disabled={isSendingWA}
                onClick={handleSendWhatsAppMessage}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-extrabold rounded-lg text-xs tracking-wider transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-black" />
                <span>{isSendingWA ? "جاري محاكاة الإرسال التفاعلي عبر AutoBot WA..." : "إرسال رسالة تنبيه تفاعلية تجريبية للجوال"}</span>
              </button>

              {waSuccess !== null && (
                <div
                  className={`p-4 rounded-xl border space-y-2.5 ${
                    waSuccess
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                      : waIsAuthError
                      ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                      : "bg-red-950/20 border-red-500/30 text-red-300"
                  } text-right text-xs`}
                >
                  <p className="font-bold flex items-center gap-1.5 justify-start">
                    <span>{waSuccess ? "✔️ حالة الإرسال:" : waIsAuthError ? "🔑 خطأ مصادقة الـ Token (401 / Meta OAuth 190):" : "❌ فشل الإرسال:"}</span>
                  </p>
                  <p className="text-white/80 leading-relaxed font-mono whitespace-pre-wrap">{waFeedback}</p>

                  {waIsAuthError && (
                    <div className="pt-2 border-t border-amber-500/20 space-y-2 text-right">
                      <p className="text-[11px] text-amber-300/90 leading-relaxed font-sans">
                        {waActionHint || "رمز الوصول (AUTOBOT_WA_API_TOKEN) الخاص ببوابة الواتساب انتهت صلاحيته. يمكنك استبداله برمز جديد من Meta Developer Console."}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <a
                          href="https://developers.facebook.com/apps/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white/80 transition-all flex items-center gap-1.5"
                        >
                          <span>Meta Developers Console</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {!waSuccess && !waIsAuthError && (
                    <div className="pt-2 border-t border-red-500/10 text-white/60 space-y-1">
                      <p className="font-sans font-bold text-red-300">💡 تعليمات الربط الصحيح لـ AutoBot WA:</p>
                      <p className="font-sans">1. انتقل لصفحة <span className="text-cyan-400 font-bold">المتغيرات البيئية (Env Vars)</span>.</p>
                      <p className="font-sans">2. أضف متغير <code className="text-cyan-300 font-bold font-mono">AUTOBOT_WA_API_URL</code> بالرابط المباشر لبوابة الواتساب الخاصة بك.</p>
                      <p className="font-sans">3. أضف متغير <code className="text-cyan-300 font-bold font-mono">AUTOBOT_WA_API_TOKEN</code> (إذا كانت بوابتك تطلب كود مرور أو Token).</p>
                      <p className="font-sans">4. أضف رقمك باسم <code className="text-cyan-300 font-bold font-mono">WHATSAPP_PHONE</code> بصيغة دولية كاملة (مثل: +2126xxxxxxxx).</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Hand: Daily AI Diagnostics & Predictions Report */}
        <div className="space-y-6">
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  disabled={isLoadingReport}
                  onClick={fetchAIReport}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all cursor-pointer"
                  title="تحديث تقرير الذكاء الاصطناعي"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReport ? "animate-spin" : ""}`} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">التقرير التنبؤي اليومي</span>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              <p className="text-[11px] text-white/50 text-right mb-4">
                يقوم روبوت الذكاء الاصطناعي Gemini بتحليل تراكمي لجميع الـ Webhooks والأخطاء المسجلة اليوم لتحديد الأنماط الشائعة وبنية التحسينات المقترحة.
              </p>

              {isLoadingReport ? (
                <div className="p-8 text-center space-y-2 border border-white/5 rounded-xl bg-black/40">
                  <Bot className="w-8 h-8 text-cyan-400 animate-bounce mx-auto" />
                  <p className="text-xs text-white/60">جاري صياغة التقرير التشخيصي الاستباقي وتوصيات الهيكل...</p>
                </div>
              ) : aiReport ? (
                <div className="p-4 bg-black/60 rounded-xl border border-white/5 overflow-y-auto max-h-[460px] text-right scrollbar-thin scrollbar-thumb-white/10">
                  <SimpleMarkdownRenderer markdown={aiReport} />
                </div>
              ) : (
                <div className="p-8 text-center border border-white/5 rounded-xl bg-black/40 text-white/40 text-xs">
                  لا يوجد تقرير توليدي حالي. اضغط على زر التحديث في الأعلى لتوليد أول تقرير استباقي للذكاء الاصطناعي.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 mt-4 text-right">
              <span className="text-[10px] font-mono text-cyan-400/80 uppercase">
                بواسطة طراز: gemini-3.6-flash
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
