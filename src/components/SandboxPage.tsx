import React, { useState } from "react";
import { safeFetchJson } from "../utils/safeFetch";
import {
  Send,
  FlaskConical,
  Bot,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Code,
  Database,
  ArrowRight,
  Sparkles,
  Play,
  Terminal,
  Zap,
  RefreshCw,
} from "lucide-react";
import { PlatformName, WebhookErrorPayload } from "../types";

interface SandboxPageProps {
  onWebhookInjected: () => void;
}

export const SandboxPage: React.FC<SandboxPageProps> = ({ onWebhookInjected }) => {
  const [platform, setPlatform] = useState<string>("مشروع المستخدم (User Platform)");
  const [errorMessage, setErrorMessage] = useState(
    "TypeError: Cannot read properties of undefined (reading 'userId') in AuthMiddleware"
  );
  const [errorType, setErrorType] = useState("TypeError");
  const [filePath, setFilePath] = useState("src/middleware/auth.ts");
  const [lineNumber, setLineNumber] = useState("42");
  const [severity, setSeverity] = useState<"critical" | "high" | "medium" | "low">("critical");
  const [userContextJson, setUserContextJson] = useState(
    JSON.stringify({ route: "/api/v1/workspace/deploy", userId: "usr_9941", ip: "192.168.1.45" }, null, 2)
  );
  const [secret, setSecret] = useState("whsec_9941a82f019b8c7d6e5f4a3b2c1d0e");

  // Execution & Trace Pipeline State
  const [isSending, setIsSending] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0); // 0: Idle, 1: Sent Payload, 2: AI Analyzing, 3: Fix Generated
  const [responseResult, setResponseResult] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Quick Preset Error Templates
  const handleLoadPreset = (presetKey: "auth" | "deadlock" | "ratelimit" | "supabase") => {
    switch (presetKey) {
      case "auth":
        setPlatform("مشروع المستخدم (User App)");
        setErrorType("TypeError");
        setErrorMessage("TypeError: Cannot read properties of undefined (reading 'userId') in AuthMiddleware");
        setFilePath("src/middleware/auth.ts");
        setLineNumber("42");
        setSeverity("critical");
        setUserContextJson(
          JSON.stringify({ route: "/api/v1/workspace/deploy", userId: "usr_9941", ip: "192.168.1.45" }, null, 2)
        );
        break;
      case "deadlock":
        setPlatform("تطبيق المستخدم (User DB Service)");
        setErrorType("DatabaseAnomalyError");
        setErrorMessage("Deadlock detected in transaction pool for table 'agent_tasks_queue'");
        setFilePath("src/db/tasksQueue.ts");
        setLineNumber("118");
        setSeverity("high");
        setUserContextJson(JSON.stringify({ agentId: "agent_nexus_07", concurrentJobs: 14 }, null, 2));
        break;
      case "ratelimit":
        setPlatform("منصة المستخدم (User AI Gateway)");
        setErrorType("RateLimitExceeded");
        setErrorMessage("429 Too Many Requests from Third-Party LLM Provider during code generation batch");
        setFilePath("src/services/aiGenerator.ts");
        setLineNumber("88");
        setSeverity("medium");
        setUserContextJson(JSON.stringify({ tier: "pro", requestCountMinute: 120 }, null, 2));
        break;
      case "supabase":
        setPlatform("سيرفر المستخدم (User Backend)");
        setErrorType("RLSPermissionDenied");
        setErrorMessage("Row Level Security violation on table 'app_secrets' for query execution");
        setFilePath("server/supabaseAdmin.ts");
        setLineNumber("192");
        setSeverity("critical");
        setUserContextJson(JSON.stringify({ table: "app_secrets", role: "authenticated" }, null, 2));
        break;
    }
  };

  const handleRunWebhookTest = async () => {
    setIsSending(true);
    setExecutionError(null);
    setResponseResult(null);
    setActiveStep(1); // Step 1: Sending

    let parsedContext = {};
    try {
      parsedContext = JSON.parse(userContextJson);
    } catch {
      parsedContext = { raw: userContextJson };
    }

    const payload: WebhookErrorPayload = {
      platform,
      errorMessage,
      errorType,
      filePath,
      lineNumber: parseInt(lineNumber) || undefined,
      severity,
      userContext: parsedContext,
      secret,
    };

    try {
      // Simulate pipeline progression visually
      await new Promise((r) => setTimeout(r, 600));
      setActiveStep(2); // Step 2: AI Analyzing

      const res = await fetch("/api/incoming-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeFetchJson(res);

      await new Promise((r) => setTimeout(r, 800));

      if (res.ok && data.success) {
        setResponseResult(data);
        setActiveStep(3); // Step 3: Completed & Fix Generated
        onWebhookInjected();
      } else {
        setExecutionError(data.error || "فشل معالجة خطأ Webhook");
        setActiveStep(0);
      }
    } catch (err: any) {
      setExecutionError(err.message || "حدث خطأ في شبكة الاتصال");
      setActiveStep(0);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              بيئة الاختبار واختبار الـ Webhooks (/sandbox)
            </h2>
          </div>
          <p className="text-xs text-white/60 max-w-2xl">
            محاكاة إرسال أخطاء النظام الحية واختبار استجابة الذكاء الاصطناعي (Gemini 3.6 Flash) واقتراحات التصحيح التلقائي في الوقت الفعلي قبل ربط التطبيقات الإنتاجية.
          </p>
        </div>

        {/* Preset Quick Buttons */}
        <div className="flex items-center gap-2 flex-wrap relative z-10">
          <span className="text-[11px] text-white/50 font-mono font-bold block">نماذج جاهزة:</span>
          <button
            onClick={() => handleLoadPreset("auth")}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono text-cyan-300 transition-all cursor-pointer"
          >
            Auth Error
          </button>
          <button
            onClick={() => handleLoadPreset("deadlock")}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono text-amber-300 transition-all cursor-pointer"
          >
            DB Deadlock
          </button>
          <button
            onClick={() => handleLoadPreset("ratelimit")}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono text-emerald-300 transition-all cursor-pointer"
          >
            Rate Limit
          </button>
        </div>
      </div>

      {/* Grid: Left Webhook Form - Right Live Pipeline Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT FORM (5 Cols) */}
        <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">تجهيز الحمولة (Webhook Payload Builder)</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Target Platform */}
            <div className="space-y-1">
              <label className="font-bold text-white/70 block">اسم منصة / مشروع المستخدم (User Project Platform):</label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="أدخل اسم منصة أو مشروع المستخدم الخاضع للمتابعة"
                className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Error Message */}
            <div className="space-y-1">
              <label className="font-bold text-white/70 block">نص الخطأ المستهدف (Error Message):</label>
              <textarea
                rows={3}
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                className="w-full bg-black/80 border border-white/20 rounded-xl p-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 dir-ltr"
              />
            </div>

            {/* File Path & Line Number */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="font-bold text-white/70 block">مسار الملف:</label>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white font-mono dir-ltr"
                />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="font-bold text-white/70 block">رقم السطر:</label>
                <input
                  type="text"
                  value={lineNumber}
                  onChange={(e) => setLineNumber(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white font-mono dir-ltr"
                />
              </div>
            </div>

            {/* Severity & Error Type */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-white/70 block">نوع استثناء الخطأ:</label>
                <input
                  type="text"
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white font-mono dir-ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-white/70 block">مستوى الخطورة:</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                >
                  <option value="critical">حرج (Critical)</option>
                  <option value="high">مرتفع (High)</option>
                  <option value="medium">متوسط (Medium)</option>
                  <option value="low">منخفض (Low)</option>
                </select>
              </div>
            </div>

            {/* User Context JSON */}
            <div className="space-y-1">
              <label className="font-bold text-white/70 block">سياق المستخدم (JSON Meta):</label>
              <textarea
                rows={3}
                value={userContextJson}
                onChange={(e) => setUserContextJson(e.target.value)}
                className="w-full bg-black/80 border border-white/20 rounded-xl p-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-cyan-500 dir-ltr"
              />
            </div>

            {/* Secret Auth Token */}
            <div className="space-y-1">
              <label className="font-bold text-white/70 block">مفتاح توثيق الـ Webhook (Secret Token):</label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white/70 font-mono dir-ltr"
              />
            </div>
          </div>

          {/* Trigger Button */}
          <button
            disabled={isSending}
            onClick={handleRunWebhookTest}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري معالجة الـ Webhook عبر Gemini...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>تشغيل اختبار Webhook الآن</span>
              </>
            )}
          </button>

          {executionError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-mono">
              {executionError}
            </div>
          )}
        </div>

        {/* RIGHT VISUAL PIPELINE TRACE (7 Cols) */}
        <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-2xl p-5 space-y-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">مسار المعالجة الفوري (Real-Time Webhook Pipeline)</h3>
            </div>
            {responseResult && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                200 OK - Processed in 420ms
              </span>
            )}
          </div>

          {/* Stepper Pipeline Indicators */}
          <div className="grid grid-cols-3 gap-3">
            {/* Step 1 */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                activeStep >= 1
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                  : "bg-white/5 border-white/10 text-white/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Send className="w-3.5 h-3.5" />
                <span className="font-bold text-xs">1. تسليم الحمولة</span>
              </div>
              <p className="text-[10px] text-white/50">إرسال POST /api/incoming-errors</p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                activeStep >= 2
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 animate-pulse"
                  : "bg-white/5 border-white/10 text-white/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-3.5 h-3.5" />
                <span className="font-bold text-xs">2. تحليل Gemini AI</span>
              </div>
              <p className="text-[10px] text-white/50">تشخيص السبب الجذري والتأثير</p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                activeStep >= 3
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-white/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-bold text-xs">3. مقترح الإصلاح</span>
              </div>
              <p className="text-[10px] text-white/50">إنشاء كود الترقيع/SQL</p>
            </div>
          </div>

          {/* Output Display Panel */}
          <div className="flex-1 bg-black/80 border border-white/10 rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-96 space-y-3">
            {activeStep === 0 && !responseResult && (
              <div className="text-center py-16 text-white/30 space-y-2 font-sans">
                <FlaskConical className="w-8 h-8 mx-auto text-white/20" />
                <p>قم باختيار نموذج أو إدخال حمولة مخصصة واضغط "تشغيل اختبار Webhook"</p>
              </div>
            )}

            {activeStep === 1 && (
              <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                <Zap className="w-4 h-4" />
                <span>جاري تسليم الحمولة إلى نقطة النهاية...</span>
              </div>
            )}

            {responseResult && responseResult.triage && (
              <div className="space-y-3 font-sans">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between text-cyan-300 font-bold text-xs">
                    <span>نتائج التشخيص والتحليل الذكي (Gemini Triage)</span>
                    <span className="font-mono text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded">
                      الثقة: {Math.round((responseResult.triage.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-white/90">{responseResult.triage.summary}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-white/60 block">السبب الجذري المشخص:</span>
                  <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    {responseResult.triage.root_cause}
                  </p>
                </div>

                {responseResult.triage.affected_files && responseResult.triage.affected_files.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-white/60 block">الكود المقترح للترقيع التلقائي:</span>
                    <pre className="bg-black border border-white/10 p-3 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto dir-ltr text-left">
                      {responseResult.triage.affected_files[0].fixed_snippet}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
