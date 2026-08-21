import React, { useState } from "react";
import {
  ShieldAlert,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Sparkles,
  Zap,
  Globe,
  Building,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Key,
  Layers,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  RefreshCw,
  Tag,
  CreditCard,
  Lock,
  ChevronDown
} from "lucide-react";
import { SaaSPlanConfig, Tenant, TenantInvoice } from "../types";
import { GeminiKeysManager } from "./GeminiKeysManager";

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans?: SaaSPlanConfig[];
  onSavePlans?: (updatedPlans: SaaSPlanConfig[]) => void;
  tenants?: Tenant[];
  onUpdateTenantPlan?: (tenantId: string, plan: string) => void;
  invoices?: TenantInvoice[];
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  plans = [],
  onSavePlans = (_updatedPlans) => {},
  tenants = [],
  onUpdateTenantPlan = (_tenantId, _plan) => {},
  invoices = [],
}) => {
  const [activeTab, setActiveTab] = useState<"plans" | "tenants" | "gateways" | "coupons" | "gemini_keys">("gemini_keys");

  // State for Editing/Creating Plan
  const [editingPlan, setEditingPlan] = useState<SaaSPlanConfig | null>(null);
  const [isCreatingNewPlan, setIsCreatingNewPlan] = useState(false);

  // Form State for Plan
  const [planForm, setPlanForm] = useState<Partial<SaaSPlanConfig>>({
    id: "",
    slug: "",
    name: "",
    badge: "",
    description: "",
    priceMonthlyUSD: 49,
    priceYearlyUSD: 39,
    popular: false,
    colorTheme: "cyan",
    limits: {
      maxPlatforms: 5,
      maxMicroAgents: 10,
      maxMonthlyErrors: 50000,
      maxTeamSeats: 5,
    },
    features: [
      "دعم فني مباشر 24/7",
      "ربط مع بوابات الدفع CMI & Paddle",
      "تحليلات الذكاء الاصطناعي المتقدمة",
    ],
    isActive: true,
  });

  const [newFeatureInput, setNewFeatureInput] = useState("");

  // Coupons state
  const [coupons, setCoupons] = useState([
    { code: "MAROC2026", discountPercent: 50, usageCount: 42, active: true },
    { code: "SAAS50", discountPercent: 50, usageCount: 128, active: true },
    { code: "WELCOME20", discountPercent: 20, usageCount: 15, active: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(25);

  if (!isOpen) return null;

  // Handler for opening Edit Modal
  const handleStartEditPlan = (plan: SaaSPlanConfig) => {
    setEditingPlan(plan);
    setPlanForm({ ...plan });
    setIsCreatingNewPlan(false);
  };

  const handleStartCreatePlan = () => {
    const newId = `custom_${Date.now()}`;
    setEditingPlan(null);
    setPlanForm({
      id: newId,
      slug: `plan-${Date.now().toString().slice(-4)}`,
      name: "باقتك الجديدة",
      badge: "جديد",
      description: "باقة مخصصة للمؤسسات والشركات الناشئة",
      priceMonthlyUSD: 149,
      priceYearlyUSD: 119,
      popular: false,
      colorTheme: "emerald",
      limits: {
        maxPlatforms: 10,
        maxMicroAgents: 20,
        maxMonthlyErrors: 100000,
        maxTeamSeats: 10,
      },
      features: [
        "دعم فني خاص وتدريب فريق العمل",
        "ربط مخصص المزامنة الفورية",
        "نسخ احتياطي يومي آلي",
      ],
      isActive: true,
    });
    setIsCreatingNewPlan(true);
  };

  const handleAddFeatureToForm = () => {
    if (!newFeatureInput.trim()) return;
    setPlanForm((prev) => ({
      ...prev,
      features: [...(prev.features || []), newFeatureInput.trim()],
    }));
    setNewFeatureInput("");
  };

  const handleRemoveFeatureFromForm = (index: number) => {
    setPlanForm((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  const handleSavePlanForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.id) return;

    if (isCreatingNewPlan) {
      const fullPlan: SaaSPlanConfig = {
        id: planForm.id,
        slug: planForm.slug || planForm.id,
        name: planForm.name,
        badge: planForm.badge || "",
        description: planForm.description || "",
        priceMonthlyUSD: Number(planForm.priceMonthlyUSD) || 0,
        priceYearlyUSD: Number(planForm.priceYearlyUSD) || 0,
        popular: Boolean(planForm.popular),
        colorTheme: planForm.colorTheme || "cyan",
        limits: planForm.limits || {
          maxPlatforms: 3,
          maxMicroAgents: 5,
          maxMonthlyErrors: 10000,
          maxTeamSeats: 3,
        },
        features: planForm.features || [],
        isActive: planForm.isActive ?? true,
      };
      onSavePlans([...plans, fullPlan]);
    } else if (editingPlan) {
      const updated = plans.map((p) =>
        p.id === editingPlan.id
          ? ({
              ...p,
              ...planForm,
              limits: planForm.limits || p.limits,
              features: planForm.features || p.features,
            } as SaaSPlanConfig)
          : p
      );
      onSavePlans(updated);
    }

    setEditingPlan(null);
    setIsCreatingNewPlan(false);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("هل أنت تأكد من رغبتك في حذف أو أرشفة هذه الباقة؟")) {
      const updated = plans.filter((p) => p.id !== planId);
      onSavePlans(updated);
    }
  };

  const handleTogglePlanActive = (planId: string) => {
    const updated = plans.map((p) =>
      p.id === planId ? { ...p, isActive: !p.isActive } : p
    );
    onSavePlans(updated);
  };

  // Coupon Handlers
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    setCoupons((prev) => [
      ...prev,
      {
        code: newCouponCode.trim().toUpperCase(),
        discountPercent: newCouponDiscount,
        usageCount: 0,
        active: true,
      },
    ]);
    setNewCouponCode("");
  };

  const handleToggleCoupon = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
  };

  // Financial Metrics Calculation
  const totalInvoicesPaid = (invoices || []).filter((i) => i.status === "paid").reduce((acc, curr) => acc + curr.amount, 0);
  const estimatedMRR = (tenants || []).reduce((acc, tenant) => {
    const planObj = (plans || []).find((p) => p.id === tenant.plan);
    return acc + (planObj ? planObj.priceMonthlyUSD : 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-1 sm:p-2 md:p-3 overflow-y-auto" dir="rtl">
      <div className="w-full max-w-[98vw] 2xl:max-w-[96vw] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto h-[97vh] max-h-[97vh] flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>لوحة التحكم المركزية للأسعار والباقات (SaaS Super Admin)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Super Admin
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                التحكم الكامل في الأسعار، إضافة وتعديل باقات الاشتراكات، وإدارة بوابات الدفع CMI & Paddle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Analytics Metrics Bar */}
        <div className="bg-slate-900/50 border-b border-slate-800 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans shrink-0">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">الإيرادات الشهرية المتوقعة (MRR)</p>
              <p className="text-base font-black text-white font-mono">${estimatedMRR} USD</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">إجمالي المشتركين (Tenants)</p>
              <p className="text-base font-black text-white font-mono">{(tenants || []).length} حساب نشط</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">الباقات المتاحة حالياً</p>
              <p className="text-base font-black text-white font-mono">{(plans || []).filter(p => p.isActive).length} / {(plans || []).length} باقة</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">إجمالي الفواتير المحصلة</p>
              <p className="text-base font-black text-white font-mono">${totalInvoicesPaid} USD</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 bg-slate-900/30 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("gemini_keys")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === "gemini_keys"
                  ? "bg-slate-900 text-cyan-400 border-cyan-500"
                  : "text-slate-400 hover:text-white border-transparent"
              }`}
            >
              <Key className="w-4 h-4 text-cyan-400" />
              <span>مفاتيح Gemini API (5 خانات)</span>
            </button>

            <button
              onClick={() => setActiveTab("plans")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === "plans"
                  ? "bg-slate-900 text-cyan-400 border-cyan-500"
                  : "text-slate-400 hover:text-white border-transparent"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>إدارة وتعديل الباقات والاشتراكات ({plans.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("tenants")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === "tenants"
                  ? "bg-slate-900 text-cyan-400 border-cyan-500"
                  : "text-slate-400 hover:text-white border-transparent"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>المشتركون وترقية الحسابات اليدوية ({tenants.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("gateways")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === "gateways"
                  ? "bg-slate-900 text-cyan-400 border-cyan-500"
                  : "text-slate-400 hover:text-white border-transparent"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>إعدادات CMI المغربية و Paddle</span>
            </button>

            <button
              onClick={() => setActiveTab("coupons")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === "coupons"
                  ? "bg-slate-900 text-cyan-400 border-cyan-500"
                  : "text-slate-400 hover:text-white border-transparent"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>كوبونات الخصم والإنقاص ({coupons.length})</span>
            </button>
          </div>

          {activeTab === "plans" && (
            <button
              onClick={handleStartCreatePlan}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/40 mb-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة باقة جديدة</span>
            </button>
          )}
        </div>

        {/* TAB 1: PLANS MANAGEMENT */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          
          {activeTab === "plans" && (
            <div className="space-y-6">
              
              {/* PLAN EDIT/CREATE FORM OVERLAY MODAL */}
              {(editingPlan || isCreatingNewPlan) && (
                <div className="p-5 bg-slate-900 border border-cyan-500/40 rounded-3xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>{isCreatingNewPlan ? "إنشاء باقة اشتراك جديدة" : `تعديل باقة: ${editingPlan?.name}`}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => { setEditingPlan(null); setIsCreatingNewPlan(false); }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePlanForm} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">اسم الباقة (Plan Title)</label>
                        <input
                          type="text"
                          required
                          value={planForm.name}
                          onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                          placeholder="مثال: Starter Plus, Pro Ultra"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">المعرف الفريد (ID Slug)</label>
                        <input
                          type="text"
                          required
                          value={planForm.id}
                          disabled={!isCreatingNewPlan}
                          onChange={(e) => setPlanForm({ ...planForm, id: e.target.value, slug: e.target.value })}
                          placeholder="starter, pro, enterprise"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">شارة الباقة (Badge Tag)</label>
                        <input
                          type="text"
                          value={planForm.badge || ""}
                          onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                          placeholder="الأكثر شعبية، الأفضل للشركات"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* PRICING & THEME */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">السعر الشهري ($ USD)</label>
                        <input
                          type="number"
                          required
                          value={planForm.priceMonthlyUSD}
                          onChange={(e) => setPlanForm({ ...planForm, priceMonthlyUSD: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-emerald-400 font-bold focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">السعر السنوي المحسوب شهرياً ($ USD)</label>
                        <input
                          type="number"
                          required
                          value={planForm.priceYearlyUSD}
                          onChange={(e) => setPlanForm({ ...planForm, priceYearlyUSD: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-cyan-400 font-bold focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">نسق الألوان (Theme)</label>
                        <select
                          value={planForm.colorTheme}
                          onChange={(e) => setPlanForm({ ...planForm, colorTheme: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                        >
                          <option value="slate">رمادي هادئ (Slate)</option>
                          <option value="cyan">سماوي نيون (Cyan)</option>
                          <option value="purple">بنفسجي ملكي (Purple)</option>
                          <option value="emerald">زمردي مغربي (Emerald)</option>
                          <option value="amber">ذهبي فاخر (Amber)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={planForm.popular}
                            onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                            className="w-4 h-4 rounded text-cyan-500"
                          />
                          <span className="font-bold text-white">تمييز كـ "الأكثر مبيعاً"</span>
                        </label>
                      </div>
                    </div>

                    {/* LIMITS CONFIGURATION */}
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                      <h5 className="font-bold text-slate-300 text-[11px]">حدود الاستخدام والمنصات (Plan Limits)</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-500 text-[10px]">المنصات المسموحة</label>
                          <input
                            type="number"
                            value={planForm.limits?.maxPlatforms}
                            onChange={(e) => setPlanForm({ ...planForm, limits: { ...planForm.limits!, maxPlatforms: Number(e.target.value) } })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px]">عملاء Micro-Agents</label>
                          <input
                            type="number"
                            value={planForm.limits?.maxMicroAgents}
                            onChange={(e) => setPlanForm({ ...planForm, limits: { ...planForm.limits!, maxMicroAgents: Number(e.target.value) } })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px]">سجل الأخطاء الشهري</label>
                          <input
                            type="number"
                            value={planForm.limits?.maxMonthlyErrors}
                            onChange={(e) => setPlanForm({ ...planForm, limits: { ...planForm.limits!, maxMonthlyErrors: Number(e.target.value) } })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px]">مقاعد الفريق (Team Seats)</label>
                          <input
                            type="number"
                            value={planForm.limits?.maxTeamSeats}
                            onChange={(e) => setPlanForm({ ...planForm, limits: { ...planForm.limits!, maxTeamSeats: Number(e.target.value) } })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FEATURES LIST EDITOR */}
                    <div className="space-y-2">
                      <label className="block text-slate-400 font-bold">مميزات الخطة (Features List)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFeatureInput}
                          onChange={(e) => setNewFeatureInput(e.target.value)}
                          placeholder="أدخل ميزة جديدة..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeatureToForm}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer shrink-0"
                        >
                          إضافة ميزة
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {(planForm.features || []).map((feat, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>{feat}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeatureFromForm(idx)}
                              className="text-slate-500 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => { setEditingPlan(null); setIsCreatingNewPlan(false); }}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>حفظ وتحديث الباقة فوراً</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* LIST OF PLANS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map((plan) => {
                  const isPopular = plan.popular;
                  const priceMAD = Math.round(plan.priceMonthlyUSD * 10.1);

                  return (
                    <div
                      key={plan.id}
                      className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                        !plan.isActive
                          ? "bg-slate-950/40 border-slate-800/50 opacity-60"
                          : isPopular
                          ? "bg-gradient-to-b from-cyan-950/30 to-slate-950 border-cyan-500/50 ring-1 ring-cyan-500/30"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          plan.isActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-500"
                        }`}>
                          {plan.isActive ? "نشط ومتاح للعملاء" : "معطل / مؤرشف"}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTogglePlanActive(plan.id)}
                            title={plan.isActive ? "تعطيل الباقة" : "تفعيل الباقة"}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          >
                            {plan.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                          </button>
                          <button
                            onClick={() => handleStartEditPlan(plan)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {plan.id !== "starter" && plan.id !== "pro" && plan.id !== "enterprise" && (
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-white">{plan.name}</h4>
                            {plan.badge && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-[11px] mt-1">{plan.description}</p>
                        </div>

                        {/* Pricing */}
                        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 font-mono space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-slate-400 text-[10px]">شهرياً:</span>
                            <span className="text-base font-black text-white">${plan.priceMonthlyUSD} USD</span>
                          </div>
                          <div className="flex justify-between items-baseline text-[10px]">
                            <span className="text-slate-500">سنوياً (شهرياً):</span>
                            <span className="text-cyan-400 font-bold">${plan.priceYearlyUSD} USD</span>
                          </div>
                          <div className="flex justify-between items-baseline text-[10px]">
                            <span className="text-slate-500">المكافئ بالمغربي:</span>
                            <span className="text-emerald-400 font-bold">≈ {priceMAD} MAD</span>
                          </div>
                        </div>

                        {/* Limits Summary */}
                        <div className="space-y-1 text-[11px] text-slate-300">
                          <div className="flex justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">المنصات:</span>
                            <span className="font-bold text-white font-mono">{plan.limits.maxPlatforms}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Micro-Agents:</span>
                            <span className="font-bold text-white font-mono">{plan.limits.maxMicroAgents}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">الأخطاء الشهرية:</span>
                            <span className="font-bold text-white font-mono">{plan.limits.maxMonthlyErrors.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-400">مقاعد الفريق:</span>
                            <span className="font-bold text-white font-mono">{plan.limits.maxTeamSeats}</span>
                          </div>
                        </div>

                        {/* Features bullet list */}
                        <div className="space-y-1 pt-2 border-t border-slate-800/80">
                          {plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-800">
                        <button
                          onClick={() => handleStartEditPlan(plan)}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل تفاصيل هذه الباقة</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: TENANTS & MANUAL UPGRADES */}
          {activeTab === "tenants" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">قائمة المشتركين وتحديد الباقة يدوياً (Manual Plan Override)</h4>
                <p className="text-xs text-slate-400">يمكنك ترقية أو تخفيض حساب أي مشترك مباشرة من هنا</p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-right text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">اسم المستأجر (Tenant)</th>
                      <th className="p-3">المالك (Owner)</th>
                      <th className="p-3">الخطة الحالية</th>
                      <th className="p-3">تاريخ التجديد</th>
                      <th className="p-3">تحديث الخطة فوراً</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <Building className="w-4 h-4 text-cyan-400" />
                          <span>{t.name}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-400">{t.ownerEmail}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full font-bold uppercase text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            {t.plan}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-400">{t.renewsAt}</td>
                        <td className="p-3">
                          <select
                            value={t.plan}
                            onChange={(e) => onUpdateTenantPlan(t.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 font-bold cursor-pointer focus:border-cyan-500 focus:outline-none"
                          >
                            {plans.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (${p.priceMonthlyUSD}/mo)
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT GATEWAYS CONFIG */}
          {activeTab === "gateways" && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Paddle Global Gateway (دولية)</h4>
                    <p className="text-xs text-slate-400">معالجة دفع بطاقات Visa, Mastercard, PayPal للعملاء الدوليين</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Paddle Vendor ID / Client Token</label>
                    <input
                      type="text"
                      readOnly
                      value="live_token_pdl_8920198201982"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">حالة البوابة</label>
                    <span className="p-2.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 font-bold rounded-xl block text-center">
                      ✓ متصلة ومفعّلة بنجاح (Paddle Live API)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">CMI Maroc - البنك التجاري للوفاء والبنك الشعبي (المغرب 🇲🇦)</h4>
                    <p className="text-xs text-slate-400">معالجة البطاقات البنكية المغربية بالدرهم (MAD) مع التوثيق المزدوج 3D Secure</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">CMI Merchant ID (مُعرّف التاجر CMI)</label>
                    <input
                      type="text"
                      readOnly
                      value="600001892019"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">حالة البوابة</label>
                    <span className="p-2.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 font-bold rounded-xl block text-center">
                      ✓ جاهز ومربوط مع العقد التجاري CMI Maroc
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === "coupons" && (
            <div className="space-y-4">
              <form onSubmit={handleAddCoupon} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="font-bold text-white text-xs">إضافة كوبون خصم جديد</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="رمز الكوبون (مثال: SAAS2026)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white uppercase font-mono"
                  />
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    placeholder="نسبة الخصم %"
                    className="w-32 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center font-mono text-emerald-400 font-bold"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer shrink-0"
                  >
                    إنشاء الكوبون
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {coupons.map((c) => (
                  <div key={c.code} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono font-bold text-white">{c.code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        خصم {c.discountPercent}%
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">استخدم: {c.usageCount} مرة</span>
                      <button
                        onClick={() => handleToggleCoupon(c.code)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                      >
                        {c.active ? "تعطيل الكوبون" : "تفعيل الكوبون"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "gemini_keys" && (
            <div className="p-6">
              <GeminiKeysManager />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام إدارة الباقات المتطور - التعديلات تتحدّث فوراً لجميع العملاء والمستأجرين</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
          >
            إغلاق لوحة الأدمن
          </button>
        </div>

      </div>
    </div>
  );
};
