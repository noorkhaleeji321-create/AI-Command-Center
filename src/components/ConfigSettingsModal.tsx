import React, { useState } from "react";
import { X, Settings, ShieldCheck, Key, Database, Github, Server, Lock, Save, Check, Mail, UserCheck } from "lucide-react";

interface ConfigSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigSettingsModal: React.FC<ConfigSettingsModalProps> = ({ isOpen, onClose }) => {
  const [emailAuth, setEmailAuth] = useState(() => localStorage.getItem("PLATFORM_AUTH_EMAIL") || "aiwebcraft6@gmail.com");
  const [passwordAuth, setPasswordAuth] = useState(() => localStorage.getItem("PLATFORM_AUTH_PASSWORD") || localStorage.getItem("PLATFORM_SECURITY_PIN") || "admin1234");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveCredentials = () => {
    localStorage.setItem("PLATFORM_AUTH_EMAIL", emailAuth.trim() || "aiwebcraft6@gmail.com");
    localStorage.setItem("PLATFORM_AUTH_PASSWORD", passwordAuth.trim() || "admin1234");
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 dir-rtl">
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">إعدادات النظام وأمان المنصة</h3>
              <p className="text-xs text-slate-400">حماية الوصول بالبريد الإلكتروني وكلمة المرور ومتغيرات البيئة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 font-sans text-xs">
          {/* Security Credentials Change Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>حماية المنصة ببريد Gmail وكلمة المرور</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                مفعّل تلقائياً
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              يمكنك تخصيص بريد Gmail وكلمة المرور لمنع أي شخص آخر من الوصول لمركز التحكم وحماية التعديلات.
            </p>
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">بريد Gmail / Email:</label>
                <input
                  type="email"
                  value={emailAuth}
                  onChange={(e) => setEmailAuth(e.target.value)}
                  placeholder="مثال: aiwebcraft6@gmail.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500 dir-ltr"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">كلمة المرور / Password:</label>
                <input
                  type="text"
                  value={passwordAuth}
                  onChange={(e) => setPasswordAuth(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500 dir-ltr"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveCredentials}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaved ? "تم حفظ البيانات!" : "حفظ البريد وكلمة المرور"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono">
              <Key className="w-4 h-4" />
              <span>GEMINI_API_KEY</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              مفتاح الذكاء الاصطناعي المفعل تلقائياً لتحليل الأخطاء في الخادم باستعمال نموذج <code className="text-cyan-300 font-bold font-mono">gemini-3.6-flash</code>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold font-mono">
              <Database className="w-4 h-4" />
              <span>SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              محددة في ملف <code className="text-purple-300 font-mono">.env.example</code>. عند إدخالها يتم الاتصال بقاعدة بيانات Supabase PostgreSQL وحفظ التنبيهات بصورة دائمة.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold font-mono">
              <Github className="w-4 h-4" />
              <span>GITHUB_TOKEN</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              رمز الوصول الشخصي بصلاحيات <code className="text-indigo-300 font-mono">repo</code>. يستعمله الروبوت لإرسال الإصلاحات التلقائية لمستودعات <code className="text-slate-200 font-mono">aiwibcrafter</code> و <code className="text-slate-200 font-mono">AutoBot WA</code>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
              <Server className="w-4 h-4" />
              <span>WEBHOOK_SECRET</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              مسار استقبال أخطاء الويب هوك: <code className="text-emerald-300 font-bold font-mono">/api/incoming-errors</code>.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end font-sans">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

