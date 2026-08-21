import React, { useState, useEffect } from "react";
import {
  Shield,
  CreditCard,
  Database,
  Bot,
  Server,
  DollarSign,
  CheckCircle2,
  XCircle,
  Settings,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Zap,
} from "lucide-react";
import { safeFetchJson } from "../utils/safeFetch";

interface ModuleItem {
  id: string;
  name: string;
  title: string;
  description: string;
  iconName: string;
  enabled: boolean;
  config: {
    webhookEndpoint?: string;
    stripeKey?: string;
    stripeWebhookSecret?: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    supabaseDbUrl?: string;
    supabaseInitSql?: string;
    [key: string]: any;
  };
  updated_at: string;
}

interface ModulesMarketplaceProps {
  filterBot?: string;
  hideHeader?: boolean;
}

export const ModulesMarketplace: React.FC<ModulesMarketplaceProps> = ({
  filterBot,
  hideHeader = false,
}) => {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeConfigModule, setActiveConfigModule] = useState<ModuleItem | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/modules");
      const data = await safeFetchJson(res);
      if (data && data.success && data.modules) {
        setModules(data.modules);
      }
    } catch (err) {
      console.error("[ModulesMarketplace] Error fetching modules:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic UI update
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: newStatus } : m))
    );

    try {
      const res = await fetch("/api/modules/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: newStatus }),
      });
      const data = await safeFetchJson(res);
      if (data && data.success && data.modules) {
        setModules(data.modules);
      }
    } catch (err) {
      console.error("[ModulesMarketplace] Error toggling module:", err);
      // Revert on error
      setModules((prev) =>
        prev.map((m) => (m.id === id ? { ...m, enabled: currentStatus } : m))
      );
    }
  };

  const openConfigModal = (mod: ModuleItem) => {
    setActiveConfigModule(mod);
    setConfigForm(mod.config || {});
    setSaveMessage(null);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConfigModule) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/modules/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeConfigModule.id,
          config: configForm,
        }),
      });
      const data = await safeFetchJson(res);
      if (data && data.success) {
        setModules(data.modules);
        setSaveMessage("تم حفظ الإعدادات بنجاح!");
        setTimeout(() => {
          setActiveConfigModule(null);
          setSaveMessage(null);
        }, 1200);
      } else {
        setSaveMessage("فشل حفظ الإعدادات، يرجى المحاولة لاحقاً.");
      }
    } catch (err: any) {
      console.error("[ModulesMarketplace] Error saving config:", err);
      setSaveMessage(`خطأ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Shield":
        return <Shield className="w-6 h-6 text-cyan-400" />;
      case "Database":
        return <Database className="w-6 h-6 text-purple-400" />;
      case "Bot":
        return <Bot className="w-6 h-6 text-blue-400" />;
      case "DollarSign":
        return <DollarSign className="w-6 h-6 text-emerald-400" />;
      case "Server":
        return <Server className="w-6 h-6 text-amber-400" />;
      default:
        return <Bot className="w-6 h-6 text-blue-400" />;
    }
  };

  const filteredModules = React.useMemo(() => {
    if (!filterBot) return modules;
    return modules.filter((mod) => {
      if (filterBot === "command_center") return mod.id === "control_link_agent";
      if (filterBot === "AutoBot WA") return mod.id === "autobot_agent" || mod.id === "whatsapp_agent";
      if (filterBot === "CyberSec") return mod.id === "security_agent";
      if (filterBot === "SupabaseBot") return mod.id === "supabase_agent";
      if (filterBot === "PaymentBot") return mod.id === "payment_agent";
      return false; // aiwibcrafter has no modules
    });
  }, [modules, filterBot]);

  if (filterBot && filteredModules.length === 0) return null;

  return (
    <div className="space-y-4 font-sans">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1 relative z-10 text-right">
            <div className="flex items-center gap-2 justify-start">
              <Zap className="w-6 h-6 text-cyan-400 animate-pulse ml-2" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                متجر الوظائف الإضافية والوكلاء الذكيين (Marketplace & Add-ons)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/60">
              تفعيل وإدارة وحدات النظام المسبقة الصنع والعملاء المستقلين (Micro-Agents) لتوسيع قدرات منصتك بمرونة فائقة.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-white/40 text-xs">جاري تحميل الوظائف الإضافية...</div>
      ) : (
        <div className={`grid grid-cols-1 ${filterBot ? 'md:grid-cols-1 lg:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {filteredModules.map((mod) => (
            <div
              key={mod.id}
              className={`glass-panel p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                mod.enabled
                  ? "border-cyan-500/40 bg-cyan-950/10 shadow-lg shadow-cyan-950/20"
                  : "border-white/10 bg-black/30 hover:border-white/20"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    {renderIcon(mod.iconName)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        mod.enabled
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                          : "bg-slate-900 text-white/40 border border-slate-800"
                      }`}
                    >
                      {mod.enabled ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>نشط (Active)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>متوقف (Inactive)</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <h3 className="text-base font-bold text-white">{mod.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{mod.description}</p>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openConfigModal(mod)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  <span>الإعدادات</span>
                </button>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mod.enabled}
                    onChange={() => handleToggle(mod.id, mod.enabled)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configuration Modal */}
      {activeConfigModule && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto" dir="rtl">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                  {renderIcon(activeConfigModule.iconName)}
                </div>
                <div className="text-right">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">إعدادات {activeConfigModule.title}</h3>
                  <p className="text-[11px] text-slate-400">تكوين المفاتيح ونقاط النهاية والربط للوحدة الإضافية</p>
                </div>
              </div>
              <button
                onClick={() => setActiveConfigModule(null)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-4 sm:p-5 space-y-3 text-xs font-sans overflow-y-auto">
              {activeConfigModule.id === "security_agent" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">رابط نقطة النهاية للـ Webhook (Webhook Endpoint)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={configForm.webhookEndpoint || "https://.../api/incoming-errors"}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-cyan-300 font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(configForm.webhookEndpoint || "", "webhook")}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1 cursor-pointer shrink-0 text-xs"
                      >
                        {copiedKey === "webhook" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "webhook" ? "تم النسخ" : "نسخ"}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      قم بتوجيه رسائل الخطأ والتنبيهات الخارجية إلى هذا الرابط ليعمل حارس الأمان تلقائياً.
                    </p>
                  </div>
                </div>
              )}

              {activeConfigModule.id === "supabase_agent" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">رابط مشروع Supabase (Supabase URL)</label>
                    <input
                      type="text"
                      value={configForm.supabaseUrl || ""}
                      onChange={(e) => setConfigForm({ ...configForm, supabaseUrl: e.target.value })}
                      placeholder="https://xyz.supabase.co"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">مفتاح Anon / Service Role Key</label>
                    <input
                      type="password"
                      value={configForm.supabaseAnonKey || ""}
                      onChange={(e) => setConfigForm({ ...configForm, supabaseAnonKey: e.target.value })}
                      placeholder="eyJhbGciOi..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">رابط الاتصال المباشر بـ SQL (PostgreSQL Connection String)</label>
                    <input
                      type="password"
                      value={configForm.supabaseDbUrl || ""}
                      onChange={(e) => setConfigForm({ ...configForm, supabaseDbUrl: e.target.value })}
                      placeholder="postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-emerald-300 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">استعلامات وتهيئة SQL داخل Supabase (SQL Schema & Queries)</label>
                    <textarea
                      rows={2}
                      value={configForm.supabaseInitSql || ""}
                      onChange={(e) => setConfigForm({ ...configForm, supabaseInitSql: e.target.value })}
                      placeholder="CREATE TABLE IF NOT EXISTS system_alerts (...); SELECT * FROM system_alerts;"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-cyan-300 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {activeConfigModule.id === "autobot_agent" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">رمز مصادقة AutoBot API (AutoBot API Token)</label>
                    <input
                      type="password"
                      value={configForm.autobotToken || ""}
                      onChange={(e) => setConfigForm({ ...configForm, autobotToken: e.target.value })}
                      placeholder="ab_token_..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">فترة الفحص والتشغيل التلقائي (Trigger Interval)</label>
                    <input
                      type="text"
                      value={configForm.triggerInterval || "30s"}
                      onChange={(e) => setConfigForm({ ...configForm, triggerInterval: e.target.value })}
                      placeholder="30s"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeConfigModule.id === "whatsapp_agent" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">رمز وصول واتساب API (WhatsApp Token)</label>
                    <input
                      type="password"
                      value={configForm.whatsappToken || ""}
                      onChange={(e) => setConfigForm({ ...configForm, whatsappToken: e.target.value })}
                      placeholder="EAA..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">معرف رقم الهاتف (Phone Number ID)</label>
                    <input
                      type="text"
                      value={configForm.phoneNumberId || ""}
                      onChange={(e) => setConfigForm({ ...configForm, phoneNumberId: e.target.value })}
                      placeholder="109283746..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeConfigModule.id === "payment_agent" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">مفتاح Stripe السري (Stripe Secret Key)</label>
                    <input
                      type="password"
                      value={configForm.stripeKey || ""}
                      onChange={(e) => setConfigForm({ ...configForm, stripeKey: e.target.value })}
                      placeholder="sk_live_..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">رمز سري للـ Webhook (Webhook Signing Secret)</label>
                    <input
                      type="password"
                      value={configForm.stripeWebhookSecret || ""}
                      onChange={(e) => setConfigForm({ ...configForm, stripeWebhookSecret: e.target.value })}
                      placeholder="whsec_..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeConfigModule.id === "control_link_agent" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">رابط بوابة التحكم المركزية (Gateway URL)</label>
                    <input
                      type="text"
                      value={configForm.gatewayUrl || ""}
                      onChange={(e) => setConfigForm({ ...configForm, gatewayUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">وضع المزامنة (Sync Mode)</label>
                    <input
                      type="text"
                      value={configForm.syncMode || "realtime"}
                      onChange={(e) => setConfigForm({ ...configForm, syncMode: e.target.value })}
                      placeholder="realtime"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Integration Setup Section */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs sm:text-sm font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>ربط منصتك بهذا الوكيل (Integration Setup)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  انسخ كود الربط التالي وقم بإدراجه في الواجهة الخلفية (Backend) أو مسارات الـ API لمنصتك لتمكين التخاطب بين منصتك وهذا الوكيل مباشرة.
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">مفتاح الربط السري للعميل (Client Secret Key)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`aiwc_sec_${activeConfigModule.id}_${activeConfigModule.updated_at?.substring(0, 10)?.replace(/-/g, '') || '9482'}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-purple-300 font-mono text-[11px]"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`aiwc_sec_${activeConfigModule.id}_${activeConfigModule.updated_at?.substring(0, 10)?.replace(/-/g, '') || '9482'}`, "secret_key")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1 cursor-pointer shrink-0 border border-slate-700 text-xs"
                      >
                        {copiedKey === "secret_key" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">كود الإدراج السريع (Integration Snippet)</label>
                    <div className="relative">
                      <pre className="w-full bg-[#0a0a0f] border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-mono text-[10px] max-h-28 overflow-y-auto whitespace-pre-wrap leading-tight text-left" dir="ltr">
{`// Example Integration Snippet for ${activeConfigModule.name}
const sendToAIWebCraftBot = async (payload) => {
  try {
    const response = await fetch("\${window.location.origin}/api/incoming-errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer aiwc_sec_${activeConfigModule.id}_${activeConfigModule.updated_at?.substring(0, 10)?.replace(/-/g, '') || '9482'}"
      },
      body: JSON.stringify({
        agent_target: "${activeConfigModule.id}",
        source: "client_platform",
        data: payload
      })
    });
    return await response.json();
  } catch(e) {
    console.error("Bot integration error:", e);
  }
};`}
                      </pre>
                      <button
                        type="button"
                        onClick={() => {
                          const snippet = `const sendToAIWebCraftBot = async (payload) => {
  try {
    const response = await fetch("${window.location.origin}/api/incoming-errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer aiwc_sec_${activeConfigModule.id}_${activeConfigModule.updated_at?.substring(0, 10)?.replace(/-/g, '') || '9482'}"
      },
      body: JSON.stringify({
        agent_target: "${activeConfigModule.id}",
        source: "client_platform",
        data: payload
      })
    });
    return await response.json();
  } catch(e) {
    console.error("Bot integration error:", e);
  }
};`;
                          copyToClipboard(snippet, "snippet");
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-white/60 hover:text-white transition-all cursor-pointer backdrop-blur-sm"
                      >
                        {copiedKey === "snippet" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {saveMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-center font-bold text-xs">
                  {saveMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveConfigModule(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold transition-all cursor-pointer text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs"
                >
                  {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
