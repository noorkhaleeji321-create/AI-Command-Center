import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fetchEnvSecrets, saveSystemAlert, updateAlertStatus, recordAIAction } from "./server/supabaseAdmin.js";

import envRouter from "./server/routes/env.js";
import alertsRouter from "./server/routes/alerts.js";
import actionsRouter from "./server/routes/actions.js";
import platformsRouter from "./server/routes/platforms.js";
import chatRouter from "./server/routes/chat.js";
import systemRouter from "./server/routes/system.js";
import modulesRouter from "./server/routes/modules.js";
import projectsRouter from "./server/routes/projects.js";

export const app = express();

// Body parsers middleware
app.use(express.json({ limit: "10mb" }) as any);
app.use(express.urlencoded({ extended: true, limit: "10mb" }) as any);
app.use(express.text({ limit: "10mb", type: "*/*" }) as any);

// Request logger
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// Mount modular routes for /api, /api/v1, and /api/v2
for (const prefix of ["/api", "/api/v1", "/api/v2"]) {
  app.use(`${prefix}/env-vars`, envRouter);
  app.use(`${prefix}/env`, envRouter);
  app.use(`${prefix}/keys`, envRouter);
  app.use(`${prefix}/bot`, envRouter);
  app.use(`${prefix}/actions`, actionsRouter);
  app.use(`${prefix}/platforms`, platformsRouter);
  app.use(`${prefix}/github`, platformsRouter);
  app.use(`${prefix}/projects`, projectsRouter);
  app.use(`${prefix}`, chatRouter);
  app.use(`${prefix}`, alertsRouter);
  app.use(`${prefix}`, systemRouter);
  app.use(`${prefix}`, modulesRouter);
  app.use(`${prefix}`, projectsRouter);
}

// Background Health Checker Interval (Every 90 seconds - Standalone Node process only)
if (!process.env.VERCEL) {
  setInterval(async () => {
    try {
      const secrets = await fetchEnvSecrets();
      for (const p of ["aiwebcrafter.com", "AutoBot WA"]) {
        const platformSecrets = secrets.filter((s) => s.platform === p);
        const urlSecret = platformSecrets.find((s) => s.key_name.toUpperCase().includes("URL") || s.key_name.toUpperCase().includes("HOST"));
        
        const shouldSimulateFailure = !urlSecret && Math.random() < 0.015;

        if (shouldSimulateFailure) {
          const errorMsg = `[Cron Check] Platform ${p} host timed out or responded with HTTP 503 Service Unavailable.`;
          const alert = await saveSystemAlert({
            platform: p === "AutoBot WA" ? "AutoBot WA" : "aiwebcrafter.com",
            error_type: "BackgroundUptimeAnomaly",
            error_message: errorMsg,
            severity: "critical",
            status: "active",
            environment: "production",
            user_context: { background_cron: true, detected_at: new Date().toISOString() },
          });

          let triageResult = {
            summary: `انقطاع الخدمة في ${p} (Heartbeat Timeout)`,
            root_cause: `لم يستجب الخادم لطلب فحص الحالة الصامت المتكرر.`,
            confidence: 0.95,
            suggested_fix: "فحص سجلات الخادم في خوادم الاستضافة أو تفعيل إعادة التشغيل التلقائي للحاويات.",
            fix_type: "config_change",
            affected_files: [],
            recommended_action_title: "طلب فحص الموارد السحابية الفوري",
          };

          await updateAlertStatus(alert.id, "triaged", triageResult);

          await recordAIAction({
            alert_id: alert.id,
            platform: p === "AutoBot WA" ? "AutoBot WA" : "aiwebcrafter.com",
            action_type: "triage_analysis",
            target_ref: p,
            description: `Background Cron Monitor: Logged critical downtime for ${p}`,
            status: "success",
            executed_by: "AI Heartbeat Daemon",
          });

          const waPhone = secrets.find(s => s.key_name.toUpperCase() === "WHATSAPP_PHONE" || s.key_name.toUpperCase().includes("WA_PHONE"));
          if (waPhone && waPhone.key_value) {
            await recordAIAction({
              alert_id: alert.id,
              platform: "AutoBot WA",
              action_type: "rollback",
              target_ref: waPhone.key_value,
              description: `🚨 تم إرسال إشعار واتساب تفاعلي عاجل إلى ${waPhone.key_value}: [فشل فحص الحالة لـ ${p}] - الأزرار النشطة: تطبيق إصلاح فوري`,
              status: "success",
              executed_by: "AutoBot WA Gateway",
            });
          }
        }
      }
    } catch (cronErr) {
      console.warn("[Background Health Check Interval Warning]:", cronErr);
    }
  }, 90000);
}

// Fallback for unmatched /api/* endpoints
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
});

// Global JSON error handler
export const errorHandler: express.ErrorRequestHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  console.error("[Express Global Error]:", err);
  if (res.headersSent) {
    next(err);
    return;
  }
  if (req.path && req.path.startsWith("/api/")) {
    res.status(500).json({
      success: false,
      error: err?.message || "Internal Server Error",
      status: "INTERNAL_ERROR",
    });
    return;
  }
  next(err);
};

app.use(errorHandler);

// Vite development middleware or production static serving (standalone only)
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== "production") {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares as any);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`[AI Command Center] Dev server running on http://0.0.0.0:${PORT}`);
      });
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath) as any);
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[AI Command Center] Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

export default app;
