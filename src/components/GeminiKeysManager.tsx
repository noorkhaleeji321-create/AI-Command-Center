import React, { useState, useEffect } from "react";
import {
  Key,
  Shield,
  Activity,
  Lock,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  X,
  ExternalLink,
  Cpu,
  RefreshCw,
  Zap,
} from "lucide-react";

interface EnvSecret {
  id: string;
  key_name: string;
  key_value: string;
  updated_at?: string;
  platform_name?: string;
}

export const GeminiKeysManager: React.FC = () => {
  const [fiveKeys, setFiveKeys] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem("vault_gemini_5_keys");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          return {
            GEMINI_API_KEY_1: parsed.GEMINI_API_KEY_1 || "",
            GEMINI_API_KEY_2: parsed.GEMINI_API_KEY_2 || "",
            GEMINI_API_KEY_3: parsed.GEMINI_API_KEY_3 || "",
            GEMINI_API_KEY_4: parsed.GEMINI_API_KEY_4 || "",
            GEMINI_API_KEY_5: parsed.GEMINI_API_KEY_5 || "",
          };
        }
      }
    } catch (e) {
      // Ignore parse error
    }
    return {
      GEMINI_API_KEY_1: "",
      GEMINI_API_KEY_2: "",
      GEMINI_API_KEY_3: "",
      GEMINI_API_KEY_4: "",
      GEMINI_API_KEY_5: "",
    };
  });

  const [savedSecrets, setSavedSecrets] = useState<EnvSecret[]>([]);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState<Record<string, boolean>>({});
  const [keyValidationResults, setKeyValidationResults] = useState<
    Record<
      string,
      {
        success: boolean;
        message: string;
        quotaExceeded?: boolean;
        details?: string;
        latencyMs?: number;
        keyFormat?: string;
        maskedKey?: string;
        persistedInDB?: boolean;
      }
    >
  >({});

  const saveKeysToCache = (keys: Record<string, string>) => {
    try {
      localStorage.setItem("vault_gemini_5_keys", JSON.stringify(keys));
    } catch (e) {
      console.warn("[GeminiKeysManager] Failed to update localStorage cache", e);
    }
  };

  const fetchSecrets = async () => {
    setLoadingSecrets(true);
    try {
      const res = await fetch("/api/env/secret-manager/list");
      if (res.ok) {
        const data = await res.json();
        const secrets: EnvSecret[] = data.secrets || [];
        setSavedSecrets(secrets);

        const getKey = (name: string) =>
          secrets.find((s) => s.key_name.toUpperCase() === name.toUpperCase())?.key_value || "";

        setFiveKeys((prev) => {
          const updated = {
            GEMINI_API_KEY_1: getKey("GEMINI_API_KEY_1") || getKey("GEMINI_API_KEY") || prev.GEMINI_API_KEY_1,
            GEMINI_API_KEY_2: getKey("GEMINI_API_KEY_2") || getKey("GEMINI_PRO_KEY") || prev.GEMINI_API_KEY_2,
            GEMINI_API_KEY_3: getKey("GEMINI_API_KEY_3") || prev.GEMINI_API_KEY_3,
            GEMINI_API_KEY_4: getKey("GEMINI_API_KEY_4") || prev.GEMINI_API_KEY_4,
            GEMINI_API_KEY_5: getKey("GEMINI_API_KEY_5") || prev.GEMINI_API_KEY_5,
          };
          saveKeysToCache(updated);
          return updated;
        });
      }
    } catch (err) {
      console.error("[GeminiKeysManager] Failed to fetch secrets:", err);
    } finally {
      setLoadingSecrets(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

  const handleValidateAndSaveGeminiKey = async (
    targetKeyName: string,
    inputValue: string,
    shouldSave: boolean
  ) => {
    const cleanedKey = inputValue.trim().replace(/^["']|["']$/g, "").trim();

    if (shouldSave && !cleanedKey) {
      setKeyValidationResults((prev) => ({
        ...prev,
        [targetKeyName]: {
          success: false,
          message: `يرجى كتابة أو لصق المفتاح أولاً.`,
        },
      }));
      return;
    }

    setIsTestingKey((prev) => ({ ...prev, [targetKeyName]: true }));
    setKeyValidationResults((prev) => ({ ...prev, [targetKeyName]: undefined as any }));

    try {
      const res = await fetch("/api/env/gemini-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiKey: cleanedKey || undefined,
          targetKeyName,
          save: shouldSave,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setKeyValidationResults((prev) => ({
          ...prev,
          [targetKeyName]: {
            success: true,
            message: shouldSave
              ? `تم التشفير والحفظ بنجاح في قاعدة البيانات!`
              : `المفتاح صالح ومستجيب (${data.keyFormat || "OK"})!`,
            latencyMs: data.latencyMs,
            keyFormat: data.keyFormat,
            maskedKey: data.maskedKey,
          },
        }));

        if (shouldSave) {
          await fetchSecrets();
        }
      } else if (data.quotaExceeded) {
        setKeyValidationResults((prev) => ({
          ...prev,
          [targetKeyName]: {
            success: false,
            quotaExceeded: true,
            message: data.error || `تجاوز المفتاح الحصة المتاحة (Error 429)`,
            details: data.details || "المفتاح استهلك الحصة المتاحة على Google AI Studio.",
            latencyMs: data.latencyMs,
            keyFormat: data.keyFormat,
            persistedInDB: data.persistedInDB,
          },
        }));

        if (shouldSave && data.persistedInDB) {
          await fetchSecrets();
        }
      } else {
        setKeyValidationResults((prev) => ({
          ...prev,
          [targetKeyName]: {
            success: false,
            message: data.error || "خطأ أثناء اختبار المفتاح.",
          },
        }));
      }
    } catch (err: any) {
      setKeyValidationResults((prev) => ({
        ...prev,
        [targetKeyName]: {
          success: false,
          message: err.message || "عذراً، تعذر الاتصال بالخادم.",
        },
      }));
    } finally {
      setIsTestingKey((prev) => ({ ...prev, [targetKeyName]: false }));
    }
  };

  const handleSaveAllFiveKeys = async () => {
    for (let i = 1; i <= 5; i++) {
      const kName = `GEMINI_API_KEY_${i}`;
      const val = fiveKeys[kName];
      if (val && val.trim()) {
        await handleValidateAndSaveGeminiKey(kName, val, true);
      }
    }
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Banner / Info Header */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-cyan-500/30 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shrink-0">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>إدارة خزانة مفاتيح Gemini API (5 الخانات التلقائية)</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  Active Failover Pool
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                جميع البوتات والخدمات في المنصة (aiwibcrafter, AutoBot WA, Triage, Chat) تستمد طاقتها تلقائياً من هذه المفاتيح الخمسة. في حال نفذ رصيد أي مفتاح (429 Quota Limit)، ينقل المحرك الحمل تلقائياً للمفتاح التالي دون توقف!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchSecrets}
              disabled={loadingSecrets}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="تحديث الحالة"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSecrets ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <button
              onClick={handleSaveAllFiveKeys}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>حفظ واختبار الخانات الخمس</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 5 Key Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5].map((index) => {
          const keyName = `GEMINI_API_KEY_${index}`;
          const val = fiveKeys[keyName] || "";
          const currentSavedSecret = savedSecrets.find(
            (s) =>
              s.key_name.toUpperCase() === keyName ||
              (index === 1 && s.key_name.toUpperCase() === "GEMINI_API_KEY") ||
              (index === 2 && s.key_name.toUpperCase() === "GEMINI_PRO_KEY")
          )?.key_value;

          const slotTitles: Record<
            number,
            { title: string; subtitle: string; color: string; border: string; bg: string }
          > = {
            1: {
              title: "المفتاح #1 (الرئيسي - Primary)",
              subtitle: "المفتاح الأول المستهلك في النظام",
              color: "text-cyan-400",
              border: "border-cyan-500/40",
              bg: "bg-cyan-500/20",
            },
            2: {
              title: "المفتاح #2 (الاحتياطي الأول - Fallback 1)",
              subtitle: "يحل محل المفتاح #1 فور استنفاده",
              color: "text-blue-400",
              border: "border-blue-500/40",
              bg: "bg-blue-500/20",
            },
            3: {
              title: "المفتاح #3 (الاحتياطي الثاني - Fallback 2)",
              subtitle: "يعمل تلقائياً عند نفاذ المفتاحين السابقين",
              color: "text-purple-400",
              border: "border-purple-500/40",
              bg: "bg-purple-500/20",
            },
            4: {
              title: "المفتاح #4 (الاحتياطي الثالث - Fallback 3)",
              subtitle: "مفتاح طوارئ إضافي للضغط العالي",
              color: "text-pink-400",
              border: "border-pink-500/40",
              bg: "bg-pink-500/20",
            },
            5: {
              title: "المفتاح #5 (الاحتياطي الأخير - Failover 5)",
              subtitle: "حائط الصد الأخير لاستمرار الخدمات",
              color: "text-amber-400",
              border: "border-amber-500/40",
              bg: "bg-amber-500/20",
            },
          };

          const meta = slotTitles[index];

          return (
            <div
              key={keyName}
              className={`p-4 rounded-2xl border ${meta.border} bg-slate-950/90 space-y-3.5 relative flex flex-col justify-between shadow-lg`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${meta.bg} ${meta.color} border ${meta.border}`}>
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-black font-mono ${meta.color}`}>{keyName}</h4>
                      <p className="text-[10px] text-slate-400">{meta.title}</p>
                    </div>
                  </div>

                  {currentSavedSecret ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      جاهز: {currentSavedSecret.slice(0, 4)}...{currentSavedSecret.slice(-3)}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/10 text-slate-400">
                      فارغ
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-300 block">
                    أدخل المفتاح (AQ.... أو AIza...):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const newText = e.target.value;
                        setFiveKeys((prev) => {
                          const updated = { ...prev, [keyName]: newText };
                          saveKeysToCache(updated);
                          return updated;
                        });
                      }}
                      placeholder="ضع المفتاح هنا..."
                      className={`w-full bg-slate-900 border ${meta.border} rounded-xl px-3 py-2 text-xs ${meta.color} placeholder-slate-500 font-mono focus:outline-none focus:ring-1 transition-all`}
                    />
                    {val && (
                      <button
                        onClick={() => {
                          setFiveKeys((prev) => {
                            const updated = { ...prev, [keyName]: "" };
                            saveKeysToCache(updated);
                            return updated;
                          });
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleValidateAndSaveGeminiKey(keyName, val, false)}
                    disabled={isTestingKey[keyName]}
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Activity className={`w-3 h-3 text-amber-400 ${isTestingKey[keyName] ? "animate-spin" : ""}`} />
                    <span>{isTestingKey[keyName] ? "اختبار..." : "اختبار"}</span>
                  </button>

                  <button
                    onClick={() => handleValidateAndSaveGeminiKey(keyName, val, true)}
                    disabled={isTestingKey[keyName]}
                    className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black ${meta.bg} ${meta.color} border ${meta.border} hover:brightness-125 transition-all cursor-pointer disabled:opacity-50`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>تحقق وحفظ</span>
                  </button>
                </div>

                {/* Test Result Message */}
                {keyValidationResults[keyName] && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] flex items-start gap-2 border animate-fade-in ${
                      keyValidationResults[keyName].success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : keyValidationResults[keyName].quotaExceeded
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {keyValidationResults[keyName].success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : keyValidationResults[keyName].quotaExceeded ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 font-sans w-full">
                      <p className="font-bold leading-tight">{keyValidationResults[keyName].message}</p>
                      {keyValidationResults[keyName].success && keyValidationResults[keyName].latencyMs && (
                        <p className="text-[10px] font-mono text-emerald-400/90">
                          زمن الاستجابة: {keyValidationResults[keyName].latencyMs}ms
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
