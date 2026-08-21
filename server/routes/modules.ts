import { Router } from "express";
import { getSupabaseClient, fetchEnvSecrets } from "../supabaseAdmin.js";

const router = Router();

interface UserModule {
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
    [key: string]: any;
  };
  updated_at: string;
}

// In-memory fallback for user modules if Supabase table is not provisioned
const memoryModules: UserModule[] = [
  {
    id: "security_agent",
    name: "Security Agent",
    title: "وكيل الأمان (Security Agent)",
    description: "مراقبة أمان الويب ورصد الأخطاء الأمنية تلقائياً، وتوليد نقاط نهاية فريدة لتأمين الطلبات الواردة.",
    iconName: "Shield",
    enabled: true,
    config: {
      webhookEndpoint: "https://ais-dev-7hpu7xf5insfyvh644ynqc-773273384655.europe-west2.run.app/api/incoming-errors",
    },
    updated_at: new Date().toISOString(),
  },
  {
    id: "supabase_agent",
    name: "Supabase DB Agent",
    title: "وكيل قاعدة بيانات Supabase (Supabase DB Agent)",
    description: "مزامنة قاعدة البيانات، إدارة الأسرار والتكوينات، وتنفيذ استعلامات SQL الفورية لتخزين حالة النظام.",
    iconName: "Database",
    enabled: true,
    config: {
      supabaseUrl: process.env.SUPABASE_URL || "https://ecowrkizfpmcpsyzvvze.supabase.co",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "eyJhbGciOi...",
    },
    updated_at: new Date().toISOString(),
  },
  {
    id: "autobot_agent",
    name: "AutoBot Agent",
    title: "وكيل AutoBot (AutoBot Agent)",
    description: "تنفيذ سير العمل الآلي، معالجة الـ Webhooks الواردة، وإرسال التنبيهات الاستباقية للعمليات.",
    iconName: "Bot",
    enabled: true,
    config: {
      autobotToken: process.env.AUTOBOT_WA_API_TOKEN || "ab_token_sec_9942",
      triggerInterval: "30s",
    },
    updated_at: new Date().toISOString(),
  },
  {
    id: "whatsapp_agent",
    name: "WhatsApp Agent",
    title: "وكيل واتساب (WhatsApp WA Agent)",
    description: "تكامل المراسلة والإشعارات عبر واتساب للأخطاء الحرجة وأحداث التشغيل الحية.",
    iconName: "CreditCard",
    enabled: false,
    config: {
      whatsappToken: process.env.WHATSAPP_TOKEN || "",
      phoneNumberId: "",
    },
    updated_at: new Date().toISOString(),
  },
  {
    id: "payment_agent",
    name: "Payment Agent",
    title: "وكيل الدفع والاشتراكات (Payment Agent)",
    description: "إدارة الفوترة عبر Stripe، معالجة اشتراكات المستخدمين، والتحقق الآمن من مفاتيح الويب هوك.",
    iconName: "DollarSign",
    enabled: true,
    config: {
      stripeKey: process.env.STRIPE_SECRET_KEY || "",
      stripeWebhookSecret: "",
    },
    updated_at: new Date().toISOString(),
  },
  {
    id: "control_link_agent",
    name: "Consult Control Wal Link Agent",
    title: "وكيل مركز التحكم والربط (Consult Control Wal Link Agent)",
    description: "مُنسق النظام وموجه ناقل الأحداث بين المنصات المختلفة ومحركات الذكاء الاصطناعي.",
    iconName: "Server",
    enabled: true,
    config: {
      gatewayUrl: "https://ais-dev-7hpu7xf5insfyvh644ynqc-773273384655.europe-west2.run.app/api",
      syncMode: "realtime",
    },
    updated_at: new Date().toISOString(),
  },
];

// GET /api/modules - Get all user modules
router.get("/modules", async (req, res) => {
  try {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.from("user_modules").select("*");
      if (!error && data && data.length > 0) {
        // Map database records to UserModule format
        const formatted: UserModule[] = data.map((m: any) => ({
          id: m.id || m.module_id,
          name: m.name,
          title: m.title,
          description: m.description,
          iconName: m.icon_name || "Bot",
          enabled: Boolean(m.enabled),
          config: m.config || {},
          updated_at: m.updated_at || new Date().toISOString(),
        }));
        return res.json({ success: true, modules: formatted });
      }
    }
    return res.json({ success: true, modules: memoryModules });
  } catch (err: any) {
    console.error("[Modules API] Error fetching modules:", err);
    return res.json({ success: true, modules: memoryModules });
  }
});

// POST /api/modules/toggle - Enable or disable a module
router.post("/modules/toggle", async (req, res) => {
  try {
    const { id, enabled } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Module ID is required" });
    }

    const mod = memoryModules.find((m) => m.id === id);
    if (mod) {
      mod.enabled = Boolean(enabled);
      mod.updated_at = new Date().toISOString();
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from("user_modules").upsert({
          id,
          name: mod?.name || id,
          title: mod?.title || id,
          description: mod?.description || "",
          icon_name: mod?.iconName || "Bot",
          enabled: Boolean(enabled),
          config: mod?.config || {},
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
      } catch (e) {
        console.warn("[Supabase Modules] Upsert warning:", e);
      }
    }

    return res.json({ success: true, modules: memoryModules, message: `Module ${id} status updated to ${enabled}` });
  } catch (err: any) {
    console.error("[Modules API] Error toggling module:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/modules/config - Update configuration for a module
router.post("/api/modules/config", async (req, res) => {
  // handled below or via /modules/config
});

router.post("/modules/config", async (req, res) => {
  try {
    const { id, config } = req.body;
    if (!id || !config) {
      return res.status(400).json({ success: false, message: "Module ID and config are required" });
    }

    const mod = memoryModules.find((m) => m.id === id);
    if (mod) {
      mod.config = { ...mod.config, ...config };
      mod.updated_at = new Date().toISOString();
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from("user_modules").upsert({
          id,
          name: mod?.name || id,
          title: mod?.title || id,
          description: mod?.description || "",
          icon_name: mod?.iconName || "Bot",
          enabled: mod?.enabled ?? false,
          config: mod?.config || {},
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
      } catch (e) {
        console.warn("[Supabase Modules] Config upsert warning:", e);
      }
    }

    return res.json({ success: true, modules: memoryModules, message: `Configuration saved for module ${id}` });
  } catch (err: any) {
    console.error("[Modules API] Error updating module config:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
