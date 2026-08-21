import React, { useState } from "react";
import {
  Activity,
  Bell,
  BellOff,
  BellRing,
  Bot,
  Brain,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  FlaskConical,
  GitBranch,
  GitPullRequest,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Menu,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  UploadCloud,
  User,
  X,
  Zap,
} from "lucide-react";
import { AuthUser, PlatformMetrics, Tenant } from "../types";

export type NavTab = "landing" | "dashboard" | "integration" | "history" | "sandbox" | "status" | "upload";

interface NavbarProps {
  platforms: PlatformMetrics[];
  activeAlertsCount: number;
  criticalAlertsCount: number;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onRefresh: () => void;
  onOpenWebhookTester: () => void;
  onOpenSchemaDoc: () => void;
  onOpenSettings: () => void;
  onOpenModelSelector: () => void;
  onOpenAgentChat: (alertContext?: any) => void;
  onOpenLogsDrawer?: () => void;
  activeTenant?: Tenant;
  onOpenMultiTenancyModal?: () => void;
  onOpenSuperAdminModal?: () => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  isRefreshing: boolean;
  notificationPermission: NotificationPermission | "unsupported";
  onRequestNotificationPermission: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  platforms,
  activeAlertsCount,
  criticalAlertsCount,
  activeTab,
  onTabChange,
  onRefresh,
  onOpenWebhookTester,
  onOpenSchemaDoc,
  onOpenSettings,
  onOpenModelSelector,
  onOpenAgentChat,
  onOpenLogsDrawer,
  activeTenant,
  onOpenMultiTenancyModal,
  onOpenSuperAdminModal,
  currentUser,
  onOpenAuthModal,
  onLogout,
  isRefreshing,
  notificationPermission,
  onRequestNotificationPermission,
}) => {

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const mainTabs = [
    { id: "landing", icon: Sparkles, label: "صفحة الواجهة", badge: "الرئيسية" },
    { id: "dashboard", icon: LayoutDashboard, label: "لوحة التحكم", badge: null },
    { id: "integration", icon: GitPullRequest, label: "ربط المشروع & GitHub والدفع", badge: "مهم" },
    { id: "history", icon: RotateCcw, label: "السجل والتراجع", badge: null },
    { id: "sandbox", icon: FlaskConical, label: "Sandbox", badge: null },
    { id: "status", icon: Server, label: "حالة النظام", badge: null },
  ];

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between font-sans shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-400 transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2" onClick={() => onOpenAgentChat()}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-white">مركز التحكم</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTenant && onOpenMultiTenancyModal && (
            <button
              onClick={onOpenMultiTenancyModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-cyan-300"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[80px]">{activeTenant.name}</span>
            </button>
          )}

          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono bg-slate-900 border border-white/10 text-white">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="font-bold text-cyan-300">{activeAlertsCount}</span>
          </div>
        </div>
      </div>

      {/* Backdrop for Mobile Sidebar Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Vertical Sidebar Container (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 right-0 z-50 h-screen bg-slate-950/98 border-l border-white/10 flex flex-col justify-between font-sans transition-all duration-300 shadow-2xl ${
          isMobileOpen
            ? "translate-x-0 w-72"
            : "translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
        dir="rtl"
      >
        {/* TOP BRANDING & TENANT AREA */}
        <div className="p-4 border-b border-white/10 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenAgentChat()}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 border border-slate-950"></span>
                </span>
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col">
                  <h1 className="text-xs font-black text-white tracking-wide truncate bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                    aiwebcrafter.com
                  </h1>
                  <span className="text-[10px] text-cyan-400/80 font-mono">v3.6 Multi-Tenant</span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Tenant / Workspace Pill */}
          {(!isCollapsed || isMobileOpen) && activeTenant && onOpenMultiTenancyModal && (
            <button
              onClick={() => {
                onOpenMultiTenancyModal();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-white text-xs transition-all cursor-pointer group shadow-sm"
              title="تغيير المؤسسة والاشتراكات"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-200 text-xs truncate">{activeTenant.name}</span>
              </div>

              <span
                className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase border shrink-0 ${
                  activeTenant.plan === "enterprise"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : activeTenant.plan === "pro"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                {activeTenant.plan}
              </span>
            </button>
          )}

          {/* User Account Login / Profile Pill */}
          {(!isCollapsed || isMobileOpen) && (
            <div>
              {currentUser ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-200">
                  <div className="flex items-center gap-2 truncate">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full border border-cyan-400 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-white truncate text-[11px]">{currentUser.name}</span>
                      <span className="text-[9px] text-cyan-400 truncate">{currentUser.email}</span>
                    </div>
                  </div>

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors shrink-0"
                      title="تسجيل الخروج"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول / حساب جديد</span>
                </button>
              )}
            </div>
          )}
        </div>


        {/* MIDDLE SCROLLABLE NAVIGATION LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Section 1: Main Navigation Tabs */}
          <div className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">
                التنقل الرئيسي
              </p>
            )}

            {mainTabs
              .filter((tab) => currentUser || tab.id === "landing")
              .map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id as NavTab);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group relative ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10"
                        : "text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent"
                    }`}
                    title={tab.label}
                  >
                    <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-300 group-hover:text-cyan-400"}`} />

                    {(!isCollapsed || isMobileOpen) && (
                      <div className="flex items-center justify-between w-full">
                        <span>{tab.label}</span>
                        {tab.badge ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {tab.badge}
                          </span>
                        ) : null}
                      </div>
                    )}

                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-lg shadow-cyan-400/50" />
                    )}
                  </button>
                );
              })}
          </div>

          {/* Locked State Banner when not logged in */}
          {!currentUser ? (
            (!isCollapsed || isMobileOpen) ? (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3 my-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-white">اللوحات والبوتات مقفولة</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    يرجى تسجيل الدخول أو إنشاء حساب جديد أولاً للوصول إلى لوحات التحكم والتحدث مع البوتات.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal()}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>سجل الآن / ادخل حسابك</span>
                </button>
              </div>
            ) : null
          ) : (
            <>
              {/* Section 2: SaaS & Admin Modules */}
              <div className="space-y-1 pt-2 border-t border-white/5">
                {(!isCollapsed || isMobileOpen) && (
                  <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">
                    إدارة المنصة والباقات
                  </p>
                )}

                {onOpenSuperAdminModal && (
                  <button
                    onClick={() => {
                      onOpenSuperAdminModal();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer group"
                    title="لوحة الأدمن (الباقات)"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                    {(!isCollapsed || isMobileOpen) && <span>لوحة الأدمن (الباقات)</span>}
                  </button>
                )}

                {onOpenMultiTenancyModal && (
                  <button
                    onClick={() => {
                      onOpenMultiTenancyModal();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer group"
                    title="الاشتراكات والشركات (SaaS)"
                  >
                    <CreditCard className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    {(!isCollapsed || isMobileOpen) && <span>الاشتراكات والشركات (SaaS)</span>}
                  </button>
                )}
              </div>

              {/* Section 3: Tools & Utilities */}
              <div className="space-y-1 pt-2 border-t border-white/5">
                {(!isCollapsed || isMobileOpen) && (
                  <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2">
                    أدوات التحكم
                  </p>
                )}

                <button
                  onClick={() => {
                    onOpenAgentChat();
                    setIsMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                  title="محادثة الروبوت"
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-4 h-4 font-black shrink-0" />
                    {(!isCollapsed || isMobileOpen) && <span>محادثة الروبوت</span>}
                  </div>
                  {(!isCollapsed || isMobileOpen) && criticalAlertsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-600 text-white animate-bounce">
                      {criticalAlertsCount}
                    </span>
                  )}
                </button>

                {onOpenLogsDrawer && (
                  <button
                    onClick={() => {
                      onOpenLogsDrawer();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
                    title="سجلات النظام الحية"
                  >
                    <Terminal className="w-4 h-4 shrink-0" />
                    {(!isCollapsed || isMobileOpen) && <span>سجلات النظام</span>}
                  </button>
                )}

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={onOpenWebhookTester}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    title="إرسال خطأ تجريبي"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {(!isCollapsed || isMobileOpen) && <span className="text-[11px]">اختبار</span>}
                  </button>

                  <button
                    onClick={onOpenSchemaDoc}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-purple-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    title="مخطط الهيكلة"
                  >
                    <Database className="w-3.5 h-3.5" />
                    {(!isCollapsed || isMobileOpen) && <span className="text-[11px]">الهيكلة</span>}
                  </button>

                  <button
                    onClick={onOpenModelSelector}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-blue-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    title="نموذج AI"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    {(!isCollapsed || isMobileOpen) && <span className="text-[11px]">النموذج</span>}
                  </button>

                  <button
                    onClick={onOpenSettings}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    title="الإعدادات"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {(!isCollapsed || isMobileOpen) && <span className="text-[11px]">إعدادات</span>}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* BOTTOM FOOTER CONTROLS */}
        <div className="p-3 border-t border-white/10 space-y-2 shrink-0 bg-slate-950/90">
          <div className="flex items-center justify-between gap-1">
            {/* Notifications Button */}
            <button
              onClick={onRequestNotificationPermission}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                notificationPermission === "granted"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : notificationPermission === "denied"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
              title="الإشعارات"
            >
              {notificationPermission === "granted" ? (
                <BellRing className="w-4 h-4" />
              ) : notificationPermission === "denied" ? (
                <BellOff className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </button>

            {/* Refresh Data Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors disabled:opacity-50"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            {/* Collapse/Expand Sidebar Toggle (Desktop Only) */}
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden md:flex p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
              title={isCollapsed ? "توسيع الشريط الجانبي" : "طّي الشريط الجانبي"}
            >
              {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Active Alerts Pill */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-slate-300 font-bold">التنبيهات النشطة</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md font-mono font-black text-xs ${
                  criticalAlertsCount > 0
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                }`}
              >
                {activeAlertsCount}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
