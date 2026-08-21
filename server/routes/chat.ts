import { Router } from "express";
import { generateAgentChatResponse } from "../gemini.js";
import { sendRealWhatsAppNotification } from "../whatsapp.js";

const router = Router();
const chatTimeouts = new Map<string, NodeJS.Timeout>();

// POST /api/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, alertContext, chatHistory, targetBot } = req.body;
    const botName = targetBot || "command_center";
    
    const aiReply = await generateAgentChatResponse(message, alertContext, chatHistory, botName);
    
    if (chatTimeouts.has(botName)) {
      clearTimeout(chatTimeouts.get(botName)!);
    }
    
    const timeout = setTimeout(async () => {
       try {
         const botArName =
           botName === "command_center"
             ? "قائد مركز التحكم"
             : botName === "aiwibcrafter"
             ? "مهندس الويب (WebCraft)"
             : botName === "AutoBot WA"
             ? "وكيل الواتساب (AutoBot)"
             : botName === "CyberSec"
             ? "حارس الأمان"
             : botName === "SupabaseBot"
             ? "خبير Supabase"
             : botName;
         await sendRealWhatsAppNotification(
           alertContext?.id || null,
           botName,
           `رسالة جديدة من الروبوت (${botArName}) على المنصة:\n\n"${aiReply.slice(0, 100)}..."\n\nلم يتم استلام أي رد منك في المنصة، يرجى الدخول للمتابعة.`,
           "رد غير مقروء في محادثة الذكاء الاصطناعي"
         );
       } catch (e) {
         console.error("[WhatsApp Chat Timeout Error]", e);
       }
    }, 20000);
    
    chatTimeouts.set(botName, timeout);
    
    res.json({ reply: aiReply });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
