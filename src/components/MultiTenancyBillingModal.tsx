import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  CreditCard,
  Users,
  Plus,
  Copy,
  Check,
  Lock,
  ArrowUpRight,
  Download,
  AlertTriangle,
  UserPlus,
  Crown,
  Sparkles,
  ChevronRight,
  Key,
  Database,
  X,
  Layers,
  BarChart3,
  Server
} from "lucide-react";
import { Tenant, TenantMember, TenantInvoice, SubscriptionTier, SaaSPlanConfig } from "../types";
import { PaymentCheckoutModal } from "./PaymentCheckoutModal";

interface MultiTenancyBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants?: Tenant[];
  activeTenant?: Tenant;
  onSelectTenant?: (tenant: Tenant) => void;
  onCreateTenant?: (newTenant: Omit<Tenant, "id" | "createdAt" | "usage">) => void;
  onUpdateTenantPlan?: (tenantId: string, plan: SubscriptionTier) => void;
  onAddInvoice?: (newInvoice: TenantInvoice) => void;
  members?: TenantMember[];
  onInviteMember?: (email: string, role: TenantMember["role"]) => void;
  invoices?: TenantInvoice[];
  plans?: SaaSPlanConfig[];
}

export const MultiTenancyBillingModal: React.FC<MultiTenancyBillingModalProps> = ({
  isOpen,
  onClose,
  tenants,
  activeTenant,
  onSelectTenant,
  onCreateTenant,
  onUpdateTenantPlan,
  onAddInvoice,
  members,
  onInviteMember,
  invoices,
  plans,
}) => {
  const [activeTab, setActiveTab] = useState<"tenants" | "billing" | "team">("billing");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const defaultTenant: Tenant = {
    id: "tenant-1",
    name: "aiwebcrafter.com Production",
    slug: "aiwebcrafter-prod",
    plan: "enterprise",
    planStatus: "active",
    renewsAt: "2027-01-01",
    apiKey: "aiwc_tenant_sec_default_991823",
    usage: {
      usedMonthlyErrors: 14200,
      usedMicroAgents: 8,
      usedPlatforms: 4,
      usedTeamSeats: 6,
    },
    limits: {
      maxPlatforms: 99,
      maxMicroAgents: 50,
      maxMonthlyErrors: 250000,
      maxTeamSeats: 99,
    },
    createdAt: "2026-01-01",
    ownerEmail: "admin@aiwebcrafter.com",
  };

  const currentTenants = tenants && tenants.length > 0 ? tenants : [defaultTenant];
  const currentTenant = activeTenant || currentTenants[0];
  const currentMembers = members || [];
  const currentInvoices = invoices || [];

  // Active plans list to render
  const activePlansList = plans?.filter((p) => p.isActive) || [];

  // Checkout modal state
  const [checkoutTargetPlan, setCheckoutTargetPlan] = useState<SubscriptionTier | null>(null);

  // New Tenant Form
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSlug, setNewTenantSlug] = useState("");
  const [newTenantPlan, setNewTenantPlan] = useState<SubscriptionTier>("pro");
  const [newTenantEmail, setNewTenantEmail] = useState("");

  // Member Invite Form
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TenantMember["role"]>("developer");

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    const slug = newTenantSlug.trim() || newTenantName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const limits =
      newTenantPlan === "enterprise"
        ? { maxPlatforms: 99, maxMicroAgents: 50, maxMonthlyErrors: 250000, maxTeamSeats: 99 }
        : newTenantPlan === "pro"
        ? { maxPlatforms: 5, maxMicroAgents: 10, maxMonthlyErrors: 25000, maxTeamSeats: 10 }
        : { maxPlatforms: 1, maxMicroAgents: 2, maxMonthlyErrors: 1000, maxTeamSeats: 2 };

    if (onCreateTenant) {
      onCreateTenant({
        name: newTenantName.trim(),
        slug,
        plan: newTenantPlan,
        planStatus: "active",
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        apiKey: `aiwc_tenant_sec_${slug}_${Math.random().toString(36).substring(2, 8)}`,
        limits,
        ownerEmail: newTenantEmail.trim() || "admin@" + slug + ".com",
      });
    }

    setNewTenantName("");
    setNewTenantSlug("");
    setNewTenantEmail("");
    setIsCreatingTenant(false);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    if (onInviteMember) {
      onInviteMember(inviteEmail.trim(), inviteRole);
    }
    setInviteEmail("");
    setIsInviting(false);
  };

  const getPlanBadgeColor = (plan: SubscriptionTier) => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "pro":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getPlanPrice = (planId: SubscriptionTier) => {
    const found = plans?.find((p) => p.id === planId);
    if (found) {
      return billingCycle === "yearly" ? found.priceYearlyUSD : found.priceMonthlyUSD;
    }
    if (billingCycle === "yearly") {
      switch (planId) {
        case "starter": return 24;
        case "pro": return 79;
        case "enterprise": return 239;
        default: return 99;
      }
    } else {
      switch (planId) {
        case "starter": return 29;
        case "pro": return 99;
        case "enterprise": return 299;
        default: return 129;
      }
    }
  };

  const usageData = currentTenant.usage || { usedMonthlyErrors: 0, usedMicroAgents: 0, usedPlatforms: 0, usedTeamSeats: 0 };
  const limitsData = currentTenant.limits || { maxMonthlyErrors: 25000, maxMicroAgents: 10, maxPlatforms: 5, maxTeamSeats: 10 };

  // Percent calculations
  const errorsUsagePct = Math.min(100, Math.round((usageData.usedMonthlyErrors / limitsData.maxMonthlyErrors) * 100));
  const agentsUsagePct = Math.min(100, Math.round((usageData.usedMicroAgents / limitsData.maxMicroAgents) * 100));
  const platformsUsagePct = Math.min(100, Math.round((usageData.usedPlatforms / limitsData.maxPlatforms) * 100));
  const seatsUsagePct = Math.min(100, Math.round((usageData.usedTeamSeats / limitsData.maxTeamSeats) * 100));

  // If user selected a plan to upgrade to, show ONLY the PaymentCheckoutModal on its own screen
  if (checkoutTargetPlan) {
    return (
      <PaymentCheckoutModal
        isOpen={true}
        onClose={() => setCheckoutTargetPlan(null)}
        targetPlan={checkoutTargetPlan}
        billingCycle={billingCycle}
        activeTenant={currentTenant}
        onPaymentSuccess={(plan, newInvoice) => {
          if (onUpdateTenantPlan) {
            onUpdateTenantPlan(currentTenant.id, plan);
          }
          if (onAddInvoice) {
            onAddInvoice(newInvoice);
          }
          setCheckoutTargetPlan(null);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex justify-center p-3 sm:p-5 md:p-6 overflow-y-auto" dir="rtl">
      <div className="w-full max-w-[98vw] 2xl:max-w-[95vw] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col font-sans h-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  تعدد المستأجرين والاشتراكات (Multi-Tenancy & Billing)
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPlanBadgeColor(currentTenant?.plan || 'enterprise')}`}>
                  {currentTenant?.plan || 'enterprise'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مؤسستك الحالية: <span className="text-cyan-300 font-semibold">{currentTenant?.name}</span> ({currentTenant?.slug}) • عزل البيانات ومراقبة الاستهلاك
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/40 border-b border-slate-800 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === "billing"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>الاشتراكات والخطط السعرية (Billing & Plans)</span>
          </button>

          <button
            onClick={() => setActiveTab("tenants")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === "tenants"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>عزل الشركات والمستأجرين ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === "team"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>فريق العمل والصلاحيات ({members.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6 text-xs text-slate-300">

          {/* TAB 1: BILLING & PLANS */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              
              {/* Active Plan Usage Meter Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <h3 className="text-base font-bold text-white">
                        استهلاك الحصة والحدود التشغيلية - {currentTenant.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      يتم إعادة تجديد الحصة الشهرية تلقائياً في <span className="text-slate-200 font-mono">{currentTenant.renewsAt}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">دورة الفوترة:</span>
                    <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                      <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          billingCycle === "monthly" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        شهري
                      </button>
                      <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                          billingCycle === "yearly" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>سنوي</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded border border-emerald-500/30">خصم 20%</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Usage Meters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-800/80">
                  
                  {/* Meter 1: Monthly Errors */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>تحليلات الأخطاء</span>
                      </span>
                      <span className="text-slate-300 font-mono">{errorsUsagePct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          errorsUsagePct > 85 ? "bg-red-500" : errorsUsagePct > 60 ? "bg-amber-500" : "bg-cyan-500"
                        }`}
                        style={{ width: `${errorsUsagePct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{usageData.usedMonthlyErrors.toLocaleString()} تم التحليل</span>
                      <span>الأقصى: {limitsData.maxMonthlyErrors.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Meter 2: Micro-Agents */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>الوكلاء النشطون</span>
                      </span>
                      <span className="text-slate-300 font-mono">{agentsUsagePct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${agentsUsagePct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{usageData.usedMicroAgents} وكلاء مفعّلين</span>
                      <span>الأقصى: {limitsData.maxMicroAgents}</span>
                    </div>
                  </div>

                  {/* Meter 3: Monitored Platforms */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Server className="w-3.5 h-3.5 text-blue-400" />
                        <span>المنصات المراقبة</span>
                      </span>
                      <span className="text-slate-300 font-mono">{platformsUsagePct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${platformsUsagePct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{usageData.usedPlatforms} منصات متصلة</span>
                      <span>الأقصى: {limitsData.maxPlatforms}</span>
                    </div>
                  </div>

                  {/* Meter 4: Team Seats */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>أعضاء الفريق</span>
                      </span>
                      <span className="text-slate-300 font-mono">{seatsUsagePct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${seatsUsagePct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{usageData.usedTeamSeats} مستخدم</span>
                      <span>الأقصى: {limitsData.maxTeamSeats}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Pricing Plans Cards */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span>خطط الاشتراكات المتاحة (Commercial SaaS Plans)</span>
                  </h3>
                  <span className="text-xs text-slate-400">اختر الخطة المناسبة لشركتك مع تفعيل فوري</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {activePlansList.map((plan) => {
                    const isCurrentPlan = (currentTenant.plan || 'enterprise') === plan.id;
                    const price = billingCycle === "yearly" ? plan.priceYearlyUSD : plan.priceMonthlyUSD;

                    return (
                      <div
                        key={plan.id}
                        className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 relative transition-all duration-200 ${
                          isCurrentPlan
                            ? "border-cyan-400 ring-2 ring-cyan-500/50 bg-cyan-950/30 shadow-xl shadow-cyan-950/50"
                            : plan.popular
                            ? "border-cyan-500/60 bg-gradient-to-b from-slate-900 via-slate-900/90 to-cyan-950/20 hover:border-cyan-400 shadow-lg"
                            : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-black shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {plan.badge || "الأكثر شعبية"}
                          </span>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-base font-bold text-white">{plan.name}</h4>
                            {isCurrentPlan && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                                الخطة الحالية
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{plan.description}</p>
                          
                          <div className="flex items-baseline gap-1 py-1">
                            <span className="text-3xl font-black text-white font-mono tracking-tight">${price}</span>
                            <span className="text-xs text-slate-400 font-medium">/ شهر</span>
                          </div>

                          <ul className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                            {plan.features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="leading-tight">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => setCheckoutTargetPlan(plan.id)}
                          disabled={isCurrentPlan}
                          className={`w-full py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs mt-3 ${
                            isCurrentPlan
                              ? "bg-slate-800/90 text-emerald-400 cursor-default border border-emerald-500/30 flex items-center justify-center gap-1.5"
                              : plan.popular
                              ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40"
                              : "bg-slate-800 hover:bg-slate-700 text-white"
                          }`}
                        >
                          {isCurrentPlan ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>خطتك الحالية (مفعّلة)</span>
                            </>
                          ) : (
                            `الترقية إلى ${plan.name}`
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Invoices History */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>سجل الفواتير والدفع الإلكتروني (Invoice & Payment History)</span>
                </h3>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">رقم الفاتورة</th>
                          <th className="p-3">المبلغ</th>
                          <th className="p-3">التاريخ</th>
                          <th className="p-3">الحالة</th>
                          <th className="p-3 text-left">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3 font-mono text-cyan-300 font-bold">{inv.invoiceNumber}</td>
                            <td className="p-3 font-mono font-bold">${inv.amount} {inv.currency}</td>
                            <td className="p-3 text-slate-400">{inv.date}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                مدفوعة (Paid)
                              </span>
                            </td>
                            <td className="p-3 text-left">
                              <button
                                onClick={() => alert(`جاري تحضير PDF للفاتورة رقم ${inv.invoiceNumber}...`)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>تحميل PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TENANTS & DATA ISOLATION */}
          {activeTab === "tenants" && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    مؤسساتك والشركات المسجلة (Tenant Workspaces)
                  </h3>
                  <p className="text-xs text-slate-400">
                    يضمن كل خيار العزل التام للبيانات والمنصات والتنبيهات بين المستأجرين وفق معايير Multi-Tenant Architecture.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingTenant(!isCreatingTenant)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة شركة جديدة</span>
                </button>
              </div>

              {/* Create Tenant Form */}
              {isCreatingTenant && (
                <form onSubmit={handleCreateTenantSubmit} className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>إنشاء بيئة مستأجر جديدة (Create Workspace)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold text-[11px]">اسم الشركة / المؤسسة</label>
                      <input
                        type="text"
                        required
                        value={newTenantName}
                        onChange={(e) => {
                          setNewTenantName(e.target.value);
                          setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                        }}
                        placeholder="مثال: Acme Global Tech"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold text-[11px]">معرف النطاق الفرعي (Workspace Slug)</label>
                      <input
                        type="text"
                        required
                        value={newTenantSlug}
                        onChange={(e) => setNewTenantSlug(e.target.value)}
                        placeholder="acme-global"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold text-[11px]">البريد الإلكتروني لمالك البيئة</label>
                      <input
                        type="email"
                        value={newTenantEmail}
                        onChange={(e) => setNewTenantEmail(e.target.value)}
                        placeholder="owner@acme.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold text-[11px]">خطة الاشتراك الأولى</label>
                      <select
                        value={newTenantPlan}
                        onChange={(e) => setNewTenantPlan(e.target.value as SubscriptionTier)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="starter">Starter - 29$/mo</option>
                        <option value="pro">Pro - 99$/mo</option>
                        <option value="enterprise">Enterprise - 299$/mo</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTenant(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                    >
                      تأكيد وإنشاء البيئة
                    </button>
                  </div>
                </form>
              )}

              {/* Tenants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTenants.map((tenant) => {
                  const isCurrent = tenant.id === currentTenant.id;
                  return (
                    <div
                      key={tenant.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isCurrent
                          ? "bg-cyan-950/20 border-cyan-500 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/40"
                          : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white uppercase font-mono">
                              {tenant.name.substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">{tenant.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono" dir="ltr">@{tenant.slug}</p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPlanBadgeColor(tenant.plan)}`}>
                            {tenant.plan}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                          <p>مالك البيئة: <span className="text-slate-200 font-mono" dir="ltr">{tenant.ownerEmail}</span></p>
                          <p>تاريخ الإنشاء: <span className="text-slate-300">{tenant.createdAt}</span></p>
                          <p className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>عزل بيانات تـام (Isolated Schema & Key)</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        {isCurrent ? (
                          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>المحيط النشط حالياً</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onSelectTenant && onSelectTenant(tenant)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer text-xs"
                          >
                            الانتقال لهذه البيئة
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Tenant Secret Key & Integration */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>مفتاح الربط الخاص بـ {currentTenant.name} (Tenant Webhook & Secret Key)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">مفتاح الربط المعزول (Tenant Secret API Key)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentTenant.apiKey}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-cyan-300 font-mono text-xs"
                        dir="ltr"
                      />
                      <button
                        onClick={() => handleCopy(currentTenant.apiKey, "tenant_key")}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer shrink-0"
                      >
                        {copiedKey === "tenant_key" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[11px]">رابط الـ Webhook المخصص لهذه الشركة</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/api/incoming-errors?tenant_id=${currentTenant.slug}`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-purple-300 font-mono text-xs"
                        dir="ltr"
                      />
                      <button
                        onClick={() => handleCopy(`${window.location.origin}/api/incoming-errors?tenant_id=${currentTenant.slug}`, "tenant_webhook")}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer shrink-0"
                      >
                        {copiedKey === "tenant_webhook" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: TEAM & RBAC */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    أعضاء فريق {currentTenant.name} والصلاحيات (Team & Role Management)
                  </h3>
                  <p className="text-xs text-slate-400">
                    إدارة الأدوار وصلاحيات الوصول للوحة التحكم حسب مبدأ RBAC (Role-Based Access Control).
                  </p>
                </div>

                <button
                  onClick={() => setIsInviting(!isInviting)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>دعوة عضو جديد</span>
                </button>
              </div>

              {/* Invite Form */}
              {isInviting && (
                <form onSubmit={handleInviteSubmit} className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>إرسال دعوة للانضمام إلى {currentTenant.name}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold text-[11px]">البريد الإلكتروني للعضو</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="developer@company.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold text-[11px]">دور الصلاحية (RBAC Role)</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as TenantMember["role"])}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="admin">مسؤول نظام (Admin)</option>
                        <option value="developer">مطور برمجيات (Developer)</option>
                        <option value="viewer">مراقب فقط (Viewer)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsInviting(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                    >
                      إرسال الدعوة
                    </button>
                  </div>
                </form>
              )}

              {/* Members Table */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">العضو</th>
                        <th className="p-3">البريد الإلكتروني</th>
                        <th className="p-3">الدور (Role)</th>
                        <th className="p-3">تاريخ الانضمام</th>
                        <th className="p-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {currentMembers
                        .filter((m) => m.tenantId === currentTenant.id)
                        .map((mem) => (
                          <tr key={mem.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3 font-bold text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-bold">
                                {mem.name.substring(0, 1)}
                              </div>
                              <span>{mem.name}</span>
                            </td>
                            <td className="p-3 text-slate-300 font-mono" dir="ltr">{mem.email}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                                  mem.role === "owner"
                                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                    : mem.role === "admin"
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                                    : mem.role === "developer"
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                    : "bg-slate-800 text-slate-400 border-slate-700"
                                }`}
                              >
                                {mem.role}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400">{mem.joinedAt}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {mem.status === "active" ? "نشط" : "دعوة معلقة"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RBAC Matrix Explainer */}
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>جدول مصفوفة الصلاحيات (RBAC Permissions Matrix)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="font-bold text-purple-300 block mb-0.5">Owner (المالك)</span>
                    <p className="text-[10px]">التحكم الكامل بالفوترة والاشتراكات وإنشاء وحذف البيئات.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="font-bold text-cyan-300 block mb-0.5">Admin (المسؤول)</span>
                    <p className="text-[10px]">إدارة المفاتيح وإضافة الأعضاء وإعدادات الـ Webhooks.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="font-bold text-blue-300 block mb-0.5">Developer (المطور)</span>
                    <p className="text-[10px]">تشخيص الأخطاء وتطبيق الإصلاحات التلقائية على GitHub.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="font-bold text-slate-300 block mb-0.5">Viewer (المراقب)</span>
                    <p className="text-[10px]">قراءة سجلات النظام والتنبيهات المباشرة فقط.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0 font-sans text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام الفوترة وتعدد المستأجرين محمي بـ Paddle SSL & CMI Maroc</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
