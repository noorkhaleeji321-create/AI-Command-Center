import React, { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  User,
  ShieldAlert,
  Clock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sparkles,
  Bot,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  KeyRound,
  RefreshCw,
  Info,
} from "lucide-react";
import { AuthUser } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  initialMode?: "login" | "register";
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "register",
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Rate-limiting / anti-brute force states
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("AIWC_AUTH_FAILED_ATTEMPTS");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem("AIWC_AUTH_LOCKED_UNTIL");
      if (saved) {
        const timestamp = parseInt(saved, 10);
        if (timestamp > Date.now()) {
          return timestamp;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Sync lockout countdown
  useEffect(() => {
    if (!lockedUntil) {
      setRemainingSeconds(0);
      return;
    }

    const checkLockout = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        setLockedUntil(null);
        setFailedAttempts(0);
        localStorage.removeItem("AIWC_AUTH_LOCKED_UNTIL");
        localStorage.setItem("AIWC_AUTH_FAILED_ATTEMPTS", "0");
        setErrorMessage(null);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  if (!isOpen) return null;

  const isLockedOut = Boolean(lockedUntil && Date.now() < lockedUntil);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const recordFailedAttempt = (reason: string) => {
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);
    localStorage.setItem("AIWC_AUTH_FAILED_ATTEMPTS", newCount.toString());

    if (newCount >= MAX_FAILED_ATTEMPTS) {
      const lockTime = Date.now() + LOCKOUT_DURATION_MS;
      setLockedUntil(lockTime);
      localStorage.setItem("AIWC_AUTH_LOCKED_UNTIL", lockTime.toString());
      setErrorMessage(
        "🚨 تم حظر إجراءات تسجيل الدخول لمدة 15 دقيقة بسبب إدخال محاولات خاطئة 5 مرات متتالية."
      );
    } else {
      const remaining = MAX_FAILED_ATTEMPTS - newCount;
      setErrorMessage(
        `${reason} (بقي لديك ${remaining} محاولات قبل الحظر لمدة 15 دقيقة)`
      );
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isLockedOut) return;

    if (!email || !email.includes("@")) {
      setErrorMessage("يرجى إدخال بريد إلكتروني صحّيح (Gmail أو بريد عمل).");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("كلمة السر / الكود يجب أن تتكون من 6 أحرف أو أرقام على الأقل.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setErrorMessage("يرجى كتابة الاسم الكامل لتسجيل الحساب.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Simulation of validation
      // If user inputs a known bad pattern e.g., password "wrong" or password containing "error" or password length exact 6 with '123456'
      if (password === "wrong" || password === "123456" || password === "error") {
        recordFailedAttempt("كلمة السر أو البريد الإلكتروني غير صحيح.");
        return;
      }

      // Success Login or Register
      setFailedAttempts(0);
      localStorage.setItem("AIWC_AUTH_FAILED_ATTEMPTS", "0");
      localStorage.removeItem("AIWC_AUTH_LOCKED_UNTIL");

      const user: AuthUser = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        name: mode === "register" ? name : email.split("@")[0].toUpperCase(),
        email: email,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        role: "tenant_owner",
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        provider: "email",
      };

      setSuccessMessage(
        mode === "register"
          ? "🎉 تم إنشاء الحساب بنجاح! جاري التوجيه للوحة التحكم..."
          : "🎉 مرحباً بعودتك! تم تسجيل الدخول بنجاح."
      );

      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 1000);
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    if (isLockedOut) return;

    if (!email || !email.includes("@")) {
      setErrorMessage("يرجى إدخال بريد Gmail أو البريد الإلكتروني في حقل البريد أولاً قبل المتابعة عبر Google.");
      return;
    }

    setIsGoogleLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsGoogleLoading(false);

      setFailedAttempts(0);
      localStorage.setItem("AIWC_AUTH_FAILED_ATTEMPTS", "0");
      localStorage.removeItem("AIWC_AUTH_LOCKED_UNTIL");

      const googleUser: AuthUser = {
        id: `usr_google_${Math.random().toString(36).substring(2, 9)}`,
        name: email.split("@")[0].toUpperCase(),
        email: email,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        role: "tenant_owner",
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        provider: "google",
      };

      setSuccessMessage("✅ تم التحقق وتسجيل الدخول بنجاح عبر حساب Google المعتمد!");

      setTimeout(() => {
        onLoginSuccess(googleUser);
        onClose();
      }, 900);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans" dir="rtl">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative my-auto">
        
        {/* Top Glow Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {mode === "register" ? "إنشاء حساب جديد بالمنصة" : "تسجيل الدخول إلى حسابك"}
              </h2>
              <p className="text-xs text-slate-400">
                منظومة تأمين البوتات والتعافي الآلي الذكية v3.6
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Switch */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex gap-2">
          <button
            onClick={() => {
              setMode("register");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === "register"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            إنشاء حساب جديد (Sign Up)
          </button>
          <button
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === "login"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            تسجيل الدخول (Sign In)
          </button>
        </div>

        {/* SECURITY LOCKOUT BANNER (WHEN LOCKED OUT FOR 15 MINS) */}
        {isLockedOut ? (
          <div className="p-6 m-4 rounded-2xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 space-y-4 text-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-rose-600/30 text-rose-400 flex items-center justify-center mx-auto border border-rose-500">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white">
                🚨 الحساب محظور مؤقتاً (Security Lockout)
              </h3>
              <p className="text-xs text-rose-300 leading-relaxed max-w-sm mx-auto">
                تم تجاوز عدد محاولات إدخال كلمة السر الخاطئة (5 محاولات متتالية). لحماية بياناتك تم تفعيل الحظر الآلي لمدة 15 دقيقة.
              </p>
            </div>

            {/* Countdown Timer Display */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/40 font-mono text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold block">
                الوقت المتبقي لفك الحظر
              </span>
              <span className="text-3xl font-black text-rose-400 tracking-wider">
                {formatTime(remainingSeconds)}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              يرجى الانتظار حتى انتهاء العد التنازلي لإعادة المحاولة مرة أخرى.
            </p>
          </div>
        ) : (
          /* REGULAR FORM CONTENT */
          <form onSubmit={handleAuthSubmit} className="p-6 space-y-5">
            
            {/* Google Fast Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white font-bold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>تسجيل الدخول بـ Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-950 px-3 text-[11px] font-bold text-slate-500 uppercase shrink-0">
                أو باستخدام البريد والكود
              </span>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Full Name Field (Register Mode Only) */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>الاسم الكامل (Full Name)</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: يوسف العبدلاوي"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white text-xs outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            )}

            {/* Email / Gmail Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>البريد الإلكتروني (Gmail / Email)</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white text-xs outline-none transition-all placeholder:text-slate-600 dir-ltr text-right"
              />
            </div>

            {/* Password / Code Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>كلمة السر / الكود (Code / Password)</span>
                </label>
                {failedAttempts > 0 && (
                  <span className="text-[10px] text-rose-400 font-mono font-bold">
                    محاولات خاطئة: {failedAttempts}/{MAX_FAILED_ATTEMPTS}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white text-xs outline-none transition-all placeholder:text-slate-600 pl-10 dir-ltr text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute left-3 top-3.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-start gap-2 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                ملاحظة أمان: النظام مجهز ببروتوكول حماية ضد التخمين (Anti-Brute Force). أي 5 محاولات خاطئة ستقوم بحظر الدخول تلقائياً لمدة 15 دقيقة.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{mode === "register" ? "إنشاء وتفعيل الحساب" : "تسجيل الدخول الآن"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
