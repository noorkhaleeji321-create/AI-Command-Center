import React, { useState, useEffect, useRef } from "react";
import { safeFetchJson } from "../utils/safeFetch";
import {
  Bot,
  Send,
  X,
  Sparkles,
  GitCommit,
  Database,
  Code2,
  Terminal,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { ChatMessage, SystemAlert, PlatformName } from "../types";
import { ModulesMarketplace } from "./ModulesMarketplace";

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeAlert?: SystemAlert | null;
  onTriggerAutoFixCode: (alert: SystemAlert, fileFix?: any) => void;
  onTriggerAutoFixDatabase: (alert: SystemAlert, sqlFix?: string) => void;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  activeAlert,
  onTriggerAutoFixCode,
  onTriggerAutoFixDatabase,
}) => {
  type BotType = "command_center" | "aiwibcrafter" | "AutoBot WA" | "CyberSec" | "SupabaseBot" | "PaymentBot";
  const [selectedBot, setSelectedBot] = useState<BotType>("command_center");
  
  const [chats, setChats] = useState<Record<BotType, ChatMessage[]>>({
    command_center: [
      {
        id: `msg-cc-init`,
        sender: "assistant",
        content: "مرحباً! أنا قائد مركز التحكم الشامل (Command Center Bot). متخصص في إدارة البنية التحتية ومراقبة وتوجيه كافة العمليات السحابية.",
        timestamp: new Date().toLocaleTimeString(),
      }
    ],
    aiwibcrafter: [
      {
        id: `msg-ai-init`,
        sender: "assistant",
        content: "مرحباً بك! أنا مهندس البرمجيات والمواقع الذكي (WebCraft AI Agent). متخصص في بناء وتطوير التطبيقات، كتابة الكود البرمجي، وتصميم الواجهات العصرية. كيف يمكنني مساعدتك برمجياً اليوم؟",
        timestamp: new Date().toLocaleTimeString(),
      }
    ],
    "AutoBot WA": [
      {
        id: `msg-wa-init`,
        sender: "assistant",
        content: "أهلاً بك! أنا وكيل الواتساب والإصلاح الآلي (AutoBot WA). متخصص في إدارة التنبيهات المباشرة، إرسال إشعارات الفشل الفورية، وترميم أخطاء التشغيل تلقائياً. ماذا تحتاج للترميم الآن؟",
        timestamp: new Date().toLocaleTimeString(),
      }
    ],
    CyberSec: [
      {
        id: `msg-sec-init`,
        sender: "assistant",
        content: "أهلاً بك. أنا حارس الأمان السيبراني. متخصص في اكتشاف الثغرات، حماية المنصات، وصد محاولات الاختراق. ما هو هدف الفحص الحالي؟",
        timestamp: new Date().toLocaleTimeString(),
      }
    ],
    SupabaseBot: [
      {
        id: `msg-supa-init`,
        sender: "assistant",
        content: "مرحباً بك. أنا خبير قواعد بيانات Supabase والمساعد المتطور الخاص بك. أمتلك جميع المفاتيح والصلاحيات لإدارة الجداول، أمان RLS، والدوال. كيف يمكنني مساعدتك اليوم؟",
        timestamp: new Date().toLocaleTimeString(),
      }
    ],
    PaymentBot: [
      {
        id: `msg-pay-init`,
        sender: "assistant",
        content: "مرحباً! أنا وكيل الدفع والاشتراكات (Payment Agent). جاهز لإدارة فواتير Stripe، إعداد Webhooks المدفوعات، والتحقق من المعاملات المالية بكل أمان.",
        timestamp: new Date().toLocaleTimeString(),
      }
    ],
  });

  const [inputPrompt, setInputPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when opened or activeAlert changes
  useEffect(() => {
    if (isOpen) {
      if (activeAlert) {
        const triage = activeAlert.ai_triage;
        const initialMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          content: `مرحباً بك! لقد أكملت تحليل المشكلة لمنصة **${activeAlert.platform}**.
الخطأ الأساسي: \`${activeAlert.error_message}\`

${triage ? `تحليل الذكاء الاصطناعي: ${triage.root_cause_analysis}\n\nتوصية الإصلاح: ${triage.suggested_fix}` : "جاري المعالجة... يرجى الانتظار."}

كيف يمكنني مساعدتك أكثر في هذا الشأن؟`,
          timestamp: new Date().toLocaleTimeString(),
          triageData: triage,
        };
        setChats((prev) => ({
          ...prev,
          command_center: [...prev.command_center, initialMsg]
        }));
      }
    }
  }, [isOpen, activeAlert]);

  const messages = chats[selectedBot];


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;

    const userText = inputPrompt;
    setInputPrompt("");

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChats((prev) => ({
      ...prev,
      [selectedBot]: [...prev[selectedBot], userMsg]
    }));
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          alertContext: activeAlert,
          targetBot: selectedBot,
          chatHistory: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.content,
          })),
        }),
      });

      const data = await safeFetchJson(response);

      const botReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        content: data.reply || "لقد قمت بتحليل طلبك وإعداد الحل المطلوب.",
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setChats((prev) => ({
        ...prev,
        [selectedBot]: [...prev[selectedBot], botReply]
      }));
    } catch (err: any) {
      setChats((prev) => ({
        ...prev,
        [selectedBot]: [
          ...prev[selectedBot],
          {
            id: `msg-err-${Date.now()}`,
            sender: "assistant",
            content: "حدث خطأ أثناء التواصل مع واجهة روبوت الذكاء الاصطناعي.",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const triage = activeAlert?.ai_triage;
  const primaryFile = triage?.affected_files?.[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end">
      <div className="w-full bg-[#08080c] border-white/10 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-neon-pulse-glow">
              <Bot className="w-4 h-4 text-black font-black" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 font-sans uppercase tracking-wider">
                <span>وحدة تحكم الروبوت الذكي</span>
                {activeAlert && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {activeAlert.platform}
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-white/40 font-sans">مساعد Gemini للتشخيص والصيانة المستقلة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bot Selection Tabs */}
        <div className="flex border-b border-white/10 bg-[#0c0c12] overflow-x-auto">
          <button
            onClick={() => setSelectedBot("command_center")}
            className={`flex-1 min-w-[120px] py-3 text-xs font-bold uppercase tracking-wider font-sans border-b-2 transition-all whitespace-nowrap ${
              selectedBot === "command_center"
                ? "border-cyan-500 text-cyan-400 bg-cyan-950/20"
                : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            مركز التحكم
          </button>
          <button
            onClick={() => setSelectedBot("aiwibcrafter")}
            className={`flex-1 min-w-[140px] py-3 text-xs font-bold uppercase tracking-wider font-sans border-b-2 transition-all whitespace-nowrap ${
              selectedBot === "aiwibcrafter"
                ? "border-blue-500 text-blue-400 bg-blue-950/20"
                : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            مهندس الويب (WebCraft)
          </button>
          <button
            onClick={() => setSelectedBot("AutoBot WA")}
            className={`flex-1 min-w-[140px] py-3 text-xs font-bold uppercase tracking-wider font-sans border-b-2 transition-all whitespace-nowrap ${
              selectedBot === "AutoBot WA"
                ? "border-purple-500 text-purple-400 bg-purple-950/20"
                : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            وكيل الواتساب (AutoBot)
          </button>
          <button
            onClick={() => setSelectedBot("CyberSec")}
            className={`flex-1 min-w-[100px] py-3 text-xs font-bold uppercase tracking-wider font-sans border-b-2 transition-all whitespace-nowrap ${
              selectedBot === "CyberSec"
                ? "border-red-500 text-red-400 bg-red-950/20"
                : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            حارس الأمان
          </button>
          <button
            onClick={() => setSelectedBot("SupabaseBot")}
            className={`flex-1 min-w-[100px] py-3 text-xs font-bold uppercase tracking-wider font-sans border-b-2 transition-all whitespace-nowrap ${
              selectedBot === "SupabaseBot"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            Supabase (DB)
          </button>
          <button
            onClick={() => setSelectedBot("PaymentBot")}
            className={`flex-1 min-w-[100px] py-3 text-xs font-bold uppercase tracking-wider font-sans border-b-2 transition-all whitespace-nowrap ${
              selectedBot === "PaymentBot"
                ? "border-amber-500 text-amber-400 bg-amber-950/20"
                : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            وكيل الدفع
          </button>
        </div>

        {/* Action Highlights Banner if activeAlert is present */}
        {activeAlert && (
          <div className="bg-black/60 border-b border-white/5 p-3 flex flex-wrap items-center justify-between gap-2 font-sans">
            <div className="text-[11px] text-white/60 font-mono">
              <span className="text-white/30 uppercase text-[10px]">الهدف:</span>{" "}
              <span className="text-cyan-400 font-semibold">{activeAlert.file_path || activeAlert.platform}</span>
            </div>

            <div className="flex items-center gap-2">
              {triage?.sql_remediation?.sql && (
                <button
                  onClick={() => onTriggerAutoFixDatabase(activeAlert, triage.sql_remediation?.sql)}
                  className="px-3 py-1 rounded-full text-[10px] bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/30 font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 font-sans"
                >
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                  <span>تطبيق SQL</span>
                </button>
              )}

              <button
                onClick={() => onTriggerAutoFixCode(activeAlert, primaryFile)}
                className="px-4 py-1.5 rounded-full text-[10px] bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>إرسال إصلاح GitHub</span>
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ModulesMarketplace filterBot={selectedBot} hideHeader={true} />
          
          {messages.map((msg) => {
            const isBot = msg.sender === "assistant";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-lg bg-black/60 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs font-sans leading-relaxed ${
                    isBot
                      ? "bg-black/60 border border-white/10 text-white/90"
                      : "bg-cyan-950/60 border border-cyan-500/30 text-cyan-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Code Patch Preview inside Bot Message */}
                  {msg.triageData?.affected_files?.[0]?.fixed_snippet && (
                    <div className="mt-3 p-3 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                      <div className="text-[10px] text-white/40 mb-1 flex items-center gap-1 uppercase tracking-wider font-sans">
                        <Code2 className="w-3 h-3 text-cyan-400" />
                        <span>التعديل البرمجي ({msg.triageData.affected_files[0].path})</span>
                      </div>
                      <code>{msg.triageData.affected_files[0].fixed_snippet}</code>
                    </div>
                  )}

                  <span className="text-[10px] font-mono text-white/30 block mt-2 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري المعالجة والتحليل بواسطة ذكاء Gemini...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="اسأل الروبوت عن تفاصيل الخطأ أو كيفية إضافة اختبارات أو تعديل الكود..."
            className="flex-1 bg-black/60 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGenerating}
            className="px-5 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 font-sans"
          >
            <Send className="w-3.5 h-3.5" />
            <span>إرسال</span>
          </button>
        </form>
      </div>
    </div>
  );
};
