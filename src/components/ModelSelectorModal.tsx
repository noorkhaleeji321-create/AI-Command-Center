import React, { useState, useEffect } from "react";
import { safeFetchJson } from "../utils/safeFetch";
import { X, Brain, Check, RefreshCw } from "lucide-react";

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_MODELS = [
  { id: "gemini-3.6-flash", label: "Default (Gemini 3.6 Flash)" },
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
  { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite" },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview" },
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite" },
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { id: "gemini-pro-latest", label: "Gemini Pro Latest" },
  { id: "gemini-flash-latest", label: "Gemini Flash Latest" },
  { id: "gemini-flash-lite-latest", label: "Gemini Flash-Lite Latest" },
];

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentModel, setCurrentModel] = useState<string>("gemini-3.6-flash");
  const [isLoading, setIsLoading] = useState(false);
  const [secretId, setSecretId] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentModel();
    }
  }, [isOpen]);

  const fetchCurrentModel = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/env-vars");
      const data = await safeFetchJson(res);
      if (res.ok && data.secrets) {
        const modelSecret = data.secrets?.find(
          (s: any) => s.key_name === "GEMINI_MODEL"
        );
        if (modelSecret) {
          setCurrentModel(modelSecret.key_value);
          setSecretId(modelSecret.id);
        } else {
          setCurrentModel("gemini-3.6-flash"); // default fallback if none set
        }
      }
    } catch (err) {
      setErrorMsg("فشل جلب النموذج الحالي");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectModel = async (modelId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/env-vars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: secretId,
          platform: "command_center",
          key_name: "GEMINI_MODEL",
          key_value: modelId,
          comment: "نموذج الذكاء الاصطناعي المختار للتشخيص والمحادثة",
        }),
      });
      if (res.ok) {
        setCurrentModel(modelId);
        // Refresh to get the new ID if it was inserted
        await fetchCurrentModel();
      } else {
        setErrorMsg("فشل تحديث النموذج");
      }
    } catch (err) {
      setErrorMsg("خطأ أثناء الاتصال بالخادم");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                اختيار نموذج الذكاء الاصطناعي
              </h3>
              <p className="text-xs text-slate-400">
                التحكم بالنموذج المستخدم في المحادثة والتشخيص
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 font-sans text-xs space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            {AVAILABLE_MODELS.map((model, index) => {
              // Deduplicate display if id is same for Default and 3.6 Flash
              if (index > 0 && model.id === AVAILABLE_MODELS[0].id && model.label !== "Default (Gemini 3.6 Flash)") {
                 // Actually they wanted both shown, let's keep it as is.
              }
              const isSelected = currentModel === model.id;
              
              return (
                <button
                  key={`${model.id}-${index}`}
                  onClick={() => handleSelectModel(model.id)}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-950/50 border-cyan-700/50 text-cyan-300"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="font-medium text-sm">{model.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between font-sans">
          <div className="flex items-center text-xs text-slate-500">
            {isLoading && (
              <>
                <RefreshCw className="w-3 h-3 animate-spin ml-2" />
                جاري التحديث...
              </>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs cursor-pointer disabled:opacity-50"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
