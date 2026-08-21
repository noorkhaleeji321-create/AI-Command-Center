import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  Shield,
  Bot,
  Cpu,
  CheckCircle2,
  ArrowLeft,
  Building2,
  KeyRound,
  RotateCcw,
  Server,
  Activity,
  Terminal,
  Lock,
  Code,
  MessageSquare,
  Globe,
  ChevronRight,
  Play,
  Check,
  Copy,
  Star,
  Layers,
  Flame,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Database,
  RefreshCw,
  Sliders,
  UserCheck,
  UserPlus,
  LogIn,
} from "lucide-react";
import { AuthUser, SaaSPlanConfig, Tenant } from "../types";

interface LandingPageProps {
  onNavigateToDashboard: () => void;
  onOpenMultiTenancyModal: () => void;
  onOpenSuperAdminModal: () => void;
  onOpenAuthModal?: (mode?: "login" | "register") => void;
  currentUser?: AuthUser | null;
  plans: SaaSPlanConfig[];
  activeTenant?: Tenant;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToDashboard,
  onOpenMultiTenancyModal,
  onOpenSuperAdminModal,
  onOpenAuthModal,
  currentUser,
  plans,
  activeTenant,
}) => {

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [activeStepDemo, setActiveStepDemo] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [liveLogIndex, setLiveLogIndex] = useState(0);

  const demoSteps = [
    {
      id: 0,
      title: "01. الاكتشاف المباشر للأخطاء (Error Detection)",
      desc: "يلتقط النظام أخطاء 500 أو 429 من aiwebcrafter و AutoBot WA في أقل من 50 millisecond.",
      badge: "Real-Time Sniffer",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
      code: `// Webhook Alert Payload Captured
{
  "event": "CRITICAL_ERROR",
  "platform": "AutoBot WA",
  "status_code": 429,
  "error": "Resource has been exhausted (Quota Exceeded)",
  "timestamp": "${new Date().toISOString()}"
}`,
      statusText: "🚨 خطأ مكتشف: تجاوز الحصة في مفتاح GEMINI_API_KEY_1",
    },
    {
      id: 1,
      title: "02. التدوير الآلي للـ 5 مفاتيح (Failover Vault)",
      desc: "ينقل المحرك الحمل تلقائياً وبأقل من 10ms إلى GEMINI_API_KEY_2 دون توقف الخدمة على العميل.",
      badge: "Zero Downtime",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      code: `// Auto Failover Pool Switcher
[FailoverEngine] Switching from GEMINI_API_KEY_1 (Exhausted 429) 
               --> GEMINI_API_KEY_2 (Active & Ready)
[HealthCheck] Response Time: 124ms | Status: 200 OK
[Vault] Key rotation recorded in encrypted audit log.`,
      statusText: "⚡ تم تفعيل المفتاح الاحتياطي #2 بنجاح (124ms)",
    },
    {
      id: 2,
      title: "03. الإصلاح التلقائي بـ AI (GitHub Auto-Commit)",
      desc: "يقوم الوكيل Triage Agent بكتابة التعديل، فحص الأخطاء بـ Linter، وإرسال Pull Request آلي.",
      badge: "AI Agent Triage",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      code: `// Generated Patch by Triage AI
- const apiKey = process.env.GEMINI_API_KEY;
+ const apiKey = await getActiveFailoverKey(); // Uses 5-Key Failover Vault
// Commit: "fix(core): auto failover integration applied"
// Build Result: Compilation Succeeded ✅`,
      statusText: "✅ تم تطبيق وتمرير الكود المعدل إلى GitHub تلقائياً",
    },
    {
      id: 3,
      title: "04. إشعار الواتساب الفوري (AutoBot WA)",
      desc: "يتلقى مدير النظام إشعاراً كاملاً على الواتساب مع زر التراجع الفوري بضغطة زر (Rollback).",
      badge: "WhatsApp Instant API",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      code: `💬 WhatsApp Business Notification:
"🔔 [AI System Repair Alert]
تم إصلاح خطأ السيرفر بنجاح في AutoBot WA.
التفاصيل: تم التدوير إلى المفتاح GEMINI_API_KEY_2.
للتراجع أو استعراض التفاصيل: [انقر هنا]"`,
      statusText: "💬 تم إرسال التقرير النهائي للواتساب",
    },
  ];

  // Auto step cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepDemo((prev) => (prev + 1) % demoSteps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const liveLogs = [
    "PING -> aiwebcrafter service (Latency: 18ms)",
    "SUCCESS -> AutoBot WA Webhook Listening at /api/webhook",
    "CHECK -> Gemini 5-Keys Vault Status: 5/5 Operational",
    "AUTOBOT -> Auto-Triage Agent initialized in background",
    "TENANT -> Acme Corp usage: 4/99 Platforms | Health: 100%",
  ];

  useEffect(() => {
    const logTimer = setInterval(() => {
      setLiveLogIndex((prev) => (prev + 1) % liveLogs.length);
    }, 3000);
    return () => clearInterval(logTimer);
  }, []);

  const copyInstallCmd = () => {
    navigator.clipboard.writeText("npx aiwebcraft-agent init");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020205] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden" dir="rtl">
      
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        
        {/* Top Announcement Chip */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer group">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>الإصدار 3.6 الجديد: خزانة الـ 5 مفاتيح Gemini Failover Vault مع دعم AutoBot WA</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hero Headlines */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            منصة الذكاء الاصطناعي الشاملة{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              لإصلاح الأخطاء وإدارة البوتات
            </span>{" "}
            تلقائياً
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-3xl mx-auto">
            منظومة مراقبة وتعافي آلي فائقة السرعة. تربط بورتال الذكاء الاصطناعي مع خدماتك (aiwebcrafter, AutoBot WA, Triage Agent) بتبادل آلي بين 5 مفاتيح Gemini لتفادي توقف الخدمة (Error 429) نهائياً مع إشعارات الواتساب الفورية.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {onOpenAuthModal && (
              <button
                onClick={() => onOpenAuthModal(currentUser ? "login" : "register")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 hover:from-emerald-300 hover:to-cyan-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3"
              >
                {currentUser ? (
                  <>
                    <UserCheck className="w-5 h-5 text-slate-950" />
                    <span>حسابك المفعّل ({currentUser.name})</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 text-slate-950" />
                    <span>تسجيل حساب زبون جديد (Register / Google)</span>
                  </>
                )}
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4.5 h-4.5 text-cyan-400" />
              <span>لوحة التحكم المباشرة</span>
            </button>

            <button
              onClick={onOpenSuperAdminModal}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4.5 h-4.5 text-cyan-400" />
              <span>إدارة المفاتيح الخمسة (Admin)</span>
            </button>
          </div>


          {/* Quick Command Snippet */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>npx aiwebcraft-agent init</span>
              <button
                onClick={copyInstallCmd}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="نسخ الأمر"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live System Status Ticker */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md max-w-3xl mx-auto flex items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>نظام التعافي الآلي: نشط 100%</span>
          </div>

          <div className="text-slate-300 truncate font-mono text-[11px] hidden sm:block">
            {liveLogs[liveLogIndex]}
          </div>

          <div className="flex items-center gap-1.5 text-cyan-300 shrink-0 font-bold">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>5/5 Gemini Keys Ready</span>
          </div>
        </div>

        {/* INTERACTIVE MOCKUP & SHOWCASE DASHBOARD */}
        <div className="relative pt-6">
          <div className="p-2 sm:p-4 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl relative overflow-hidden">
            
            {/* Top Bar Controls Mockup */}
            <div className="p-3 bg-slate-950/90 rounded-2xl border border-white/10 flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono font-bold text-slate-400 mr-2">
                  aiwebcraft-control-center.internal/v3.6
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  LIVE MONITORED
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  AUTO-REPAIR ENABLED
                </span>
              </div>
            </div>

            {/* Interactive Step Switcher Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {demoSteps.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStepDemo(idx)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer font-sans space-y-1 ${
                    activeStepDemo === idx
                      ? "bg-slate-800 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/50"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{s.badge}</span>
                    {activeStepDemo === idx && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] font-bold truncate">{s.title.split(". ")[1] || s.title}</p>
                </button>
              ))}
            </div>

            {/* Demo Display Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Code/Log Box */}
              <div className="lg:col-span-7 bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>ملاحظات المعالجة التلقائية (Live Execution Stream)</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${demoSteps[activeStepDemo].badgeColor}`}>
                    {demoSteps[activeStepDemo].badge}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 leading-relaxed overflow-x-auto min-h-[160px] font-mono">
                  <pre className="text-[11px] text-cyan-300 whitespace-pre-wrap">{demoSteps[activeStepDemo].code}</pre>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                  <span>{demoSteps[activeStepDemo].statusText}</span>
                </div>
              </div>

              {/* Right Visual Explanation Card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-cyan-500/20 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 inline-block">
                    {demoSteps[activeStepDemo].badge}
                  </span>
                  <h3 className="text-base font-black text-white">{demoSteps[activeStepDemo].title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{demoSteps[activeStepDemo].desc}</p>
                </div>

                {/* Micro System Metric Preview */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">زمن استجابة المحرك (Latency):</span>
                    <span className="font-mono text-emerald-400 font-bold">12ms - 45ms</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-[88%] animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Zero Human Touch Required</span>
                    <span className="text-cyan-300 font-bold">100% Automated</span>
                  </div>
                </div>

                <button
                  onClick={onNavigateToDashboard}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>استكشاف هذه الميزة في اللوحة الحية</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* 2. STATS & PROOF COUNTERS */}
      <section className="py-12 border-y border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">+142,500</p>
            <p className="text-xs text-slate-300 font-bold">أخطاء تم إصلاحها تلقائياً</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">99.99%</p>
            <p className="text-xs text-slate-300 font-bold">استقرار الخدمة دون توقف (Uptime)</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-purple-400 font-mono">&lt; 15ms</p>
            <p className="text-xs text-slate-300 font-bold">زمن التدوير الآلي بين المفاتيح</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">5 Keys</p>
            <p className="text-xs text-slate-300 font-bold">خزانة تبادل مفاتيح Gemini API Vault</p>
          </div>
        </div>
      </section>

      {/* 3. VISUAL PLATFORM BREAKDOWN & DIAGRAMS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            شرح المنصة بالصور والمخططات التفاعلية
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            كيف تعمل منصة AI WebCraft لتأمين البوتات والتطبيقات؟
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            تم تصميم كل عنصر في النظام ليعمل بانسجام تام، بداية من التقاط الخطأ إلى التدوير الفوري للمفاتيح وإشعارات الواتساب.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: 5 Gemini Keys Vault */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 transition-all space-y-5 shadow-xl group relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white flex items-center justify-between">
                <span>خزانة 5 مفاتيح Gemini Failover</span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  Pool Vault
                </span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                تتيح لك إدخال 5 مفاتيح Gemini API مختلفة. إذا واجه المفتاح الرئيسي حد الاستهلاك (429 Quota Limit)، ينقل النظام الطلب فوراً للمفتاح الثاني دون إظهار أي خطأ للمستخدم.
              </p>
            </div>

            {/* Visual Diagram Mini Component */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-white/10 pb-1.5">
                <span>GEMINI_API_KEY_1</span>
                <span className="text-red-400">429 Exceeded</span>
              </div>
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span>GEMINI_API_KEY_2</span>
                <span className="text-emerald-400">200 OK (Active)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>GEMINI_API_KEY_3..5</span>
                <span>Ready Fallbacks</span>
              </div>
            </div>

            <button
              onClick={onOpenSuperAdminModal}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>فتح خزانة المفاتيح الخمسة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: AutoBot WA WhatsApp Integration */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 transition-all space-y-5 shadow-xl group relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white flex items-center justify-between">
                <span>إشعارات الواتساب (AutoBot WA)</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  WhatsApp API
                </span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                ربط مباشر مع WhatsApp Business API لإرسال تقارير الأخطاء والإصلاحات الحية مباشرة لهاتف الإدارة مع إمكانية التراجع أو التأكيد عبر رسالة واتساب.
              </p>
            </div>

            {/* Visual Chat Screen */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-sans text-[11px]">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تنبيه البوت AutoBot WA:</span>
                </p>
                <p className="text-[10px] text-slate-300">
                  "تم معالجة التوقف التلقائي بنجاح. النظام يعمل بكفاءة 100%."
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToDashboard}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>استكشاف إشعارات الواتساب</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Multi-Tenant SaaS Engine */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 transition-all space-y-5 shadow-xl group relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white flex items-center justify-between">
                <span>إدارة الشركات والباقات (Multi-Tenancy)</span>
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                  SaaS Engine
                </span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                نظام كامل لإدارة حسابات المشتركين، مفاتيح API المشفرة لكل شركة، حدود الاستهلاك، وتوليد الفواتير التلقائية مع لوحة Super Admin متكاملة.
              </p>
            </div>

            {/* Visual Tenant Limits Card */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center text-purple-300 font-bold">
                <span>Active Tenant:</span>
                <span className="text-white">{activeTenant?.name || "Acme Enterprise"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Plan Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{activeTenant?.plan || "Pro"}</span>
              </div>
            </div>

            <button
              onClick={onOpenMultiTenancyModal}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>إدارة الشركات والاشتراكات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 4. ARCHITECTURE INTERACTIVE FLOW DIAGRAM */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-900/60 rounded-3xl border border-white/10 backdrop-blur-xl space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            مخطط الربط والتسلسل الآلي (System Architecture)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            دورة حياة المعالجة والتعافي التلقائي من الخطأ
          </h2>
        </div>

        {/* Visual Flow Diagram Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 font-black flex items-center justify-center mx-auto text-xs">01</div>
            <h4 className="text-xs font-black text-white">حدوث الخطأ (Error Event)</h4>
            <p className="text-[10px] text-slate-400 leading-normal">تلتقط المنصة الخطأ من aiwebcrafter أو AutoBot WA (429/500).</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center mx-auto text-xs">02</div>
            <h4 className="text-xs font-black text-white">تدوير المفاتيح (Key Failover)</h4>
            <p className="text-[10px] text-slate-400 leading-normal">فحص خزانة Gemini الخمسة والتحويل الآلي للمفتاح الشغال.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 bg-cyan-950/20 text-center space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-black flex items-center justify-center mx-auto text-xs">03</div>
            <h4 className="text-xs font-black text-cyan-300">تحليل الذكاء الاصطناعي</h4>
            <p className="text-[10px] text-slate-300 leading-normal">يقوم Triage Agent بصياغة الحل وفحصه بـ TypeScript Linter.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-black flex items-center justify-center mx-auto text-xs">04</div>
            <h4 className="text-xs font-black text-white">تطبيق الكود (Auto-Commit)</h4>
            <p className="text-[10px] text-slate-400 leading-normal">تمرير التعديل المباشر إلى مستودع GitHub والتشغيل الفوري.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 bg-emerald-950/20 text-center space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center mx-auto text-xs">05</div>
            <h4 className="text-xs font-black text-emerald-300">تقرير الواتساب والتراجع</h4>
            <p className="text-[10px] text-slate-300 leading-normal">إشعار العميل على الواتساب مع زر التراجع الفوري عند الحاجة.</p>
          </div>

        </div>
      </section>

      {/* 5. PRICING & SAAS PLANS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            باقات الاشتراك والمرونة المالية
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            اختر الباقة المناسبة لحجم أعمالك وتطبيقاتك
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            خطط مرنة تبدأ للمطورين المستقلين وتتوسع لتشمل المؤسسات الكبرى مع دعم مخصص.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-white" : "text-slate-400"}`}>
              شهري (Monthly)
            </span>
            <button
              onClick={() => setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"))}
              className="w-14 h-8 rounded-full bg-slate-800 border border-slate-700 p-1 relative transition-colors cursor-pointer"
            >
              <div
                className={`w-6 h-6 rounded-full bg-cyan-400 transition-transform ${
                  billingCycle === "yearly" ? "translate-x-0" : "-translate-x-6"
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-cyan-300" : "text-slate-400"}`}>
              <span>سنوي (Yearly)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                خصم 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === "yearly" ? plan.priceYearlyUSD : plan.priceMonthlyUSD;
            return (
              <div
                key={plan.id}
                className={`p-6 sm:p-8 rounded-3xl border space-y-6 relative flex flex-col justify-between transition-all ${
                  plan.popular
                    ? "bg-slate-900 border-cyan-500 shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-500"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 uppercase shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{plan.description}</p>

                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-4xl font-black text-white font-mono">${price}</span>
                    <span className="text-xs text-slate-400 font-bold">/ شهرياً</span>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onOpenMultiTenancyModal}
                  className={`w-full py-3 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-6 ${
                    plan.popular
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  }`}
                >
                  <span>اختيار باقة {plan.name.split(" ")[0]}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FINAL CTA & BOTTOM BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 border border-cyan-500/40 relative overflow-hidden text-center space-y-6 shadow-2xl">
          <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-black text-white max-w-2xl mx-auto">
            جاهز لتأمين وإدارة كافة تطبيقاتك بالذكاء الاصطناعي بنسبة 100%؟
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            ادخل فوراً إلى لوحة التحكم الرئيسية وابدأ في تهيئة خزانة الـ 5 مفاتيح Gemini وتفعيل إشعارات الواتساب.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateToDashboard}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-3"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>الانتقال المباشر للوحة التحكم الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            {onOpenSuperAdminModal && (
              <button
                onClick={onOpenSuperAdminModal}
                className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>لوحة الأدمن الرئيسي (Super Admin)</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 AI WebCraft Platform. All Rights Reserved. Powered by Gemini 3.6 & AutoBot WA Engine.</p>
      </footer>

    </div>
  );
};
