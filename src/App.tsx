import React, { useState, useEffect } from "react";
import { Navbar, NavTab } from "./components/Navbar";

// Pages
import { LandingPage } from "./components/LandingPage";
import { MasonryDashboard } from "./components/MasonryDashboard";
import { SandboxPage } from "./components/SandboxPage";
import { SystemStatusPage } from "./components/SystemStatusPage";
import { ProjectIntegrationPage } from "./components/ProjectIntegrationPage";
import { HistoryRollbackPage } from "./components/HistoryRollbackPage";
import { FullAuditReportPage } from "./components/FullAuditReportPage";

// Modals
import { WebhookTesterModal } from "./components/WebhookTesterModal";
import { SchemaDocModal } from "./components/SchemaDocModal";
import { ConfigSettingsModal } from "./components/ConfigSettingsModal";
import { ModelSelectorModal } from "./components/ModelSelectorModal";
import { AgentChatDrawer } from "./components/AgentChatDrawer";
import { LiveSystemLogsDrawer } from "./components/LiveSystemLogsDrawer";
import { MultiTenancyBillingModal } from "./components/MultiTenancyBillingModal";
import { SuperAdminModal } from "./components/SuperAdminModal";
import { AuthModal } from "./components/AuthModal";
import { AutoFixModal } from "./components/AutoFixModal";

import { SystemAlert, AIAction, PlatformMetrics, AuthUser, SaaSPlanConfig, Tenant, TenantMember, TenantInvoice, SubscriptionTier } from "./types";

const initialTenantsList: Tenant[] = [
  {
    id: "tenant-1",
    name: "aiwebcrafter.com Production",
    slug: "aiwebcrafter-prod",
    plan: "enterprise",
    planStatus: "active",
    renewsAt: "2027-01-01",
    apiKey: "aiwc_tenant_sec_prod_991823",
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
  }
];

// Clean initial state (populates dynamically from API endpoints)
const initialPlatforms: PlatformMetrics[] = [];
const initialAlerts: SystemAlert[] = [];
const initialActions: AIAction[] = [];

const initialPlans: SaaSPlanConfig[] = [
  {
    id: "starter",
    slug: "starter",
    name: "Starter Bundle",
    description: "Basic error tracking and manual fixes",
    priceMonthlyUSD: 29,
    priceYearlyUSD: 290,
    colorTheme: "slate",
    limits: { maxPlatforms: 1, maxMicroAgents: 2, maxMonthlyErrors: 1000, maxTeamSeats: 1 },
    features: ["1 Platform Integration", "Basic Error Logs"],
    isActive: true,
  },
  {
    id: "pro",
    slug: "pro",
    name: "Pro AI Bundle",
    badge: "Most Popular",
    description: "Auto-fixing, Github integrations, and Supabase sync",
    priceMonthlyUSD: 99,
    priceYearlyUSD: 990,
    colorTheme: "cyan",
    popular: true,
    limits: { maxPlatforms: 5, maxMicroAgents: 10, maxMonthlyErrors: 10000, maxTeamSeats: 5 },
    features: ["Auto Github Commits", "Database Auto-Fix", "Slack Notifications"],
    isActive: true,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab | "audit">("landing");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Data State
  const [alerts, setAlerts] = useState<SystemAlert[]>(initialAlerts);
  const [actions, setActions] = useState<AIAction[]>(initialActions);
  const [platforms, setPlatforms] = useState<PlatformMetrics[]>(initialPlatforms);
  const [plans, setPlans] = useState<SaaSPlanConfig[]>(initialPlans);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const fetchLiveData = async () => {
    try {
      const [alertsRes, actionsRes, projectsRes] = await Promise.allSettled([
        fetch("/api/alerts").then(res => res.json()),
        fetch("/api/actions").then(res => res.json()),
        fetch("/api/v2/projects").then(res => res.json()),
      ]);

      if (alertsRes.status === "fulfilled" && Array.isArray(alertsRes.value?.alerts) && alertsRes.value.alerts.length > 0) {
        setAlerts(alertsRes.value.alerts);
      }
      if (actionsRes.status === "fulfilled" && Array.isArray(actionsRes.value?.actions) && actionsRes.value.actions.length > 0) {
        setActions(actionsRes.value.actions);
      }
      if (projectsRes.status === "fulfilled" && Array.isArray(projectsRes.value?.projects) && projectsRes.value.projects.length > 0) {
        const fetchedPlatforms = projectsRes.value.projects.map((p: any) => ({
          name: p.name || p.title || p.id,
          status: p.status || "healthy",
          activeAlertsCount: p.activeAlertsCount || 0,
          criticalCount: p.criticalCount || 0,
          resolvedToday: p.resolvedToday || 0,
          uptime: p.uptime || "99.9%",
          latencyMs: p.latencyMs || 100,
          repoName: p.repoName || "aiwibcrafter-org/repo",
        }));
        setPlatforms(fetchedPlatforms);
      }
    } catch {
      // Keep existing state fallback on network issues
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLiveData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Tenant State
  const [tenants, setTenants] = useState<Tenant[]>(initialTenantsList);
  const [activeTenant, setActiveTenant] = useState<Tenant>(initialTenantsList[0]);
  const [tenantMembers, setTenantMembers] = useState<TenantMember[]>([
    {
      id: "mem-1",
      tenantId: "tenant-1",
      name: "Admin User",
      email: "admin@aiwebcrafter.com",
      role: "owner",
      joinedAt: "2026-01-01",
      status: "active"
    }
  ]);
  const [tenantInvoices, setTenantInvoices] = useState<TenantInvoice[]>([]);

  const handleCreateTenant = (newTenantData: Omit<Tenant, "id" | "createdAt" | "usage">) => {
    const created: Tenant = {
      ...newTenantData,
      id: `tenant-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      usage: {
        usedMonthlyErrors: 0,
        usedMicroAgents: 0,
        usedPlatforms: 1,
        usedTeamSeats: 1
      }
    };
    setTenants(prev => [...prev, created]);
    setActiveTenant(created);
  };

  const handleUpdateTenantPlan = (tenantId: string, plan: SubscriptionTier) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, plan } : t));
    if (activeTenant.id === tenantId) {
      setActiveTenant(prev => ({ ...prev, plan }));
    }
  };

  const handleInviteMember = (email: string, role: TenantMember["role"]) => {
    const newMember: TenantMember = {
      id: `mem-${Date.now()}`,
      tenantId: activeTenant.id,
      name: email.split("@")[0],
      email,
      role,
      joinedAt: new Date().toISOString().split("T")[0],
      status: "active"
    };
    setTenantMembers(prev => [...prev, newMember]);
  };

  const handleAddInvoice = (newInvoice: TenantInvoice) => {
    setTenantInvoices(prev => [newInvoice, ...prev]);
  };

  // Modal States
  const [isWebhookTesterOpen, setIsWebhookTesterOpen] = useState(false);
  const [isSchemaDocOpen, setIsSchemaDocOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isAgentChatOpen, setIsAgentChatOpen] = useState(false);
  const [agentChatAlert, setAgentChatAlert] = useState<SystemAlert | null>(null);
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);
  const [isMultiTenancyOpen, setIsMultiTenancyOpen] = useState(false);
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);

  const handleTabChange = (tab: NavTab | "audit") => {
    if (tab !== "landing" && !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };
  
  const [isAutoFixOpen, setIsAutoFixOpen] = useState(false);
  const [autoFixAlert, setAutoFixAlert] = useState<SystemAlert | null>(null);
  const [autoFixMode, setAutoFixMode] = useState<"code" | "database">("code");

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  };

  const handleOpenAutoFix = (alert: SystemAlert, mode: "code" | "database" = "code") => {
    setAutoFixAlert(alert);
    setAutoFixMode(mode);
    setIsAutoFixOpen(true);
  };

  const handleOpenAgentChat = (alertContext?: any) => {
    setAgentChatAlert(alertContext || null);
    setIsAgentChatOpen(true);
  };

  const activeAlertsCount = alerts.filter(a => a.status === "active").length;
  const criticalAlertsCount = alerts.filter(a => a.severity === "critical" && a.status === "active").length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200" dir="rtl">
      
      {/* Dynamic Navbar / Sidebar wrapper - hidden on landing page */}
      {activeTab !== "landing" && (
        <Navbar
          platforms={platforms}
          activeAlertsCount={activeAlertsCount}
          criticalAlertsCount={criticalAlertsCount}
          activeTab={activeTab as NavTab}
          onTabChange={handleTabChange}
          onRefresh={handleRefresh}
          onOpenWebhookTester={() => setIsWebhookTesterOpen(true)}
          onOpenSchemaDoc={() => setIsSchemaDocOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenModelSelector={() => setIsModelSelectorOpen(true)}
          onOpenAgentChat={handleOpenAgentChat}
          onOpenLogsDrawer={() => setIsLogsDrawerOpen(true)}
          activeTenant={activeTenant}
          onOpenMultiTenancyModal={() => setIsMultiTenancyOpen(true)}
          onOpenSuperAdminModal={() => setIsSuperAdminOpen(true)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={() => { setCurrentUser(null); setIsAuthModalOpen(true); }}
          isRefreshing={isRefreshing}
          notificationPermission={notificationPermission}
          onRequestNotificationPermission={requestNotificationPermission}
        />
      )}

      <main className="flex-1 overflow-y-auto w-full">
        {activeTab === "landing" && (
          <LandingPage 
            onNavigateToDashboard={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setActiveTab("dashboard");
              }
            }}
            onOpenMultiTenancyModal={() => setIsMultiTenancyOpen(true)}
            onOpenSuperAdminModal={() => setIsSuperAdminOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            currentUser={currentUser}
            activeTenant={activeTenant}
            plans={plans}
          />
        )}
        {activeTab === "dashboard" && (
          <MasonryDashboard
            alerts={alerts}
            actions={actions}
            platforms={platforms}
            currentUser={currentUser}
            onSelectForAutoFix={handleOpenAutoFix}
            onSelectForAgentChat={handleOpenAgentChat}
            onOpenWebhookTester={() => setIsWebhookTesterOpen(true)}
          />
        )}
        {activeTab === "integration" && (
          <ProjectIntegrationPage onSavedSuccess={() => setActiveTab("dashboard")} />
        )}
        {activeTab === "history" && (
          <HistoryRollbackPage actions={actions} onRefresh={handleRefresh} />
        )}
        {activeTab === "sandbox" && (
          <SandboxPage onWebhookInjected={handleRefresh} />
        )}
        {activeTab === "status" && (
          <SystemStatusPage />
        )}
        {activeTab === "audit" && (
          <FullAuditReportPage />
        )}
      </main>

      {/* GLOBAL MODALS */}
      <WebhookTesterModal isOpen={isWebhookTesterOpen} onClose={() => setIsWebhookTesterOpen(false)} onWebhookInjected={handleRefresh} />
      <SchemaDocModal isOpen={isSchemaDocOpen} onClose={() => setIsSchemaDocOpen(false)} />
      <ConfigSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ModelSelectorModal isOpen={isModelSelectorOpen} onClose={() => setIsModelSelectorOpen(false)} />
      <AgentChatDrawer isOpen={isAgentChatOpen} onClose={() => setIsAgentChatOpen(false)} activeAlert={agentChatAlert} onTriggerAutoFixCode={(a) => handleOpenAutoFix(a, 'code')} onTriggerAutoFixDatabase={(a) => handleOpenAutoFix(a, 'database')} />
      <LiveSystemLogsDrawer isOpen={isLogsDrawerOpen} onClose={() => setIsLogsDrawerOpen(false)} actions={actions} alerts={alerts} />
      <MultiTenancyBillingModal 
        isOpen={isMultiTenancyOpen} 
        onClose={() => setIsMultiTenancyOpen(false)} 
        plans={plans} 
        tenants={tenants}
        activeTenant={activeTenant}
        onSelectTenant={setActiveTenant}
        onCreateTenant={handleCreateTenant}
        onUpdateTenantPlan={handleUpdateTenantPlan}
        onAddInvoice={handleAddInvoice}
        members={tenantMembers}
        onInviteMember={handleInviteMember}
        invoices={tenantInvoices}
      />
      <SuperAdminModal isOpen={isSuperAdminOpen} onClose={() => setIsSuperAdminOpen(false)} plans={plans} onSavePlans={setPlans} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          if (currentUser) {
            setIsAuthModalOpen(false);
          }
        }} 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }} 
      />
      
      <AutoFixModal 
        isOpen={isAutoFixOpen} 
        onClose={() => setIsAutoFixOpen(false)} 
        alert={autoFixAlert} 
        mode={autoFixMode} 
        onSuccess={() => { setIsAutoFixOpen(false); handleRefresh(); }} 
      />
    </div>
  );
}
