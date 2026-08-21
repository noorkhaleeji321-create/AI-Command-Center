import { Router } from "express";
import {
  fetchAIActions,
  updateAlertStatus,
  updateAIActionStatus,
  recordAIAction,
} from "../supabaseAdmin.js";

const router = Router();

// GET /api/actions
router.get("/", async (req, res) => {
  try {
    const actions = await fetchAIActions();
    res.json({ actions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/actions/rollback
router.post("/rollback", async (req, res) => {
  try {
    const { actionId, platform, reason } = req.body;

    const actions = await fetchAIActions();
    const targetAction = actions.find((a) => a.id === actionId);

    const targetPlatform = platform || targetAction?.platform || "aiwibcrafter";
    const targetRef = targetAction?.target_ref || "System State";

    if (targetAction?.alert_id) {
      await updateAlertStatus(targetAction.alert_id, "active");
    }

    if (actionId) {
      await updateAIActionStatus(actionId, "rolled_back");
    }

    const rollbackRecord = await recordAIAction({
      alert_id: targetAction?.alert_id,
      platform: targetPlatform,
      action_type: "rollback",
      target_ref: targetRef,
      description: `تم التراجع عن الإجراء ${actionId ? actionId.slice(0, 10) : ""} - ${reason || "تم التراجع بطلب مهندس DevOps"}`,
      status: "success",
      executed_by: "DevOps Engineer (Manual Rollback)",
    });

    res.json({
      success: true,
      message: `تم التراجع بنجاح واستعادة حالة النظام على منصة ${targetPlatform}`,
      rollbackAction: rollbackRecord,
    });
  } catch (err: any) {
    res.status(500).json({ error: "فشل تنفيذ عملية التراجع", details: err.message });
  }
});

export default router;
