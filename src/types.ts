export type EnvPlatform = 'aiwibcrafter' | 'aiwebcrafter.com' | 'AutoBot WA' | 'command_center';

export interface EnvVariable {
  id: string;
  platform: EnvPlatform;
  key_name: string;
  key_value: string;
  comment?: string;
  updated_at: string;
  created_at?: string;
}

export type PlatformName = string;

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type AlertStatus = 'active' | 'triaged' | 'fixing' | 'resolved' | 'dismissed';

export type ActionType = 'github_commit' | 'supabase_query' | 'triage_analysis' | 'chat_response' | 'rollback';

export interface SystemAlert {
  id: string;
  platform: PlatformName;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  file_path?: string;
  line_number?: number;
  severity: SeverityLevel;
  status: AlertStatus;
  user_context?: Record<string, any>;
  environment?: string;
  created_at: string;
  updated_at: string;
  ai_triage?: AITriageResult;
}

export interface AITriageResult {
  summary: string;
  root_cause: string;
  confidence: number; // 0 to 1
  suggested_fix: string;
  fix_type: 'code_commit' | 'database_query' | 'config_change' | 'manual_review';
  affected_files?: {
    path: string;
    original_snippet?: string;
    fixed_snippet?: string;
    explanation: string;
  }[];
  sql_remediation?: {
    description: string;
    sql: string;
    is_safe: boolean;
  };
  recommended_action_title: string;
}

export interface AIAction {
  id: string;
  alert_id?: string;
  platform: PlatformName;
  action_type: ActionType;
  target_ref: string; // repository path or SQL table
  description: string;
  code_diff?: string;
  sql_executed?: string;
  commit_sha?: string;
  commit_url?: string;
  status: 'pending' | 'success' | 'failed' | 'rolled_back';
  error_details?: string;
  executed_by: string; // 'Gemini 3.6 Flash Bot' or user email
  created_at: string;
}

export interface PlatformMetrics {
  name: PlatformName;
  status: 'healthy' | 'degraded' | 'critical';
  activeAlertsCount: number;
  criticalCount: number;
  resolvedToday: number;
  uptime: string;
  lastErrorTime?: string;
  latencyMs: number;
  repoName: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  relatedAlertId?: string;
  triageData?: AITriageResult;
  proposedFix?: {
    platform: PlatformName;
    filePath: string;
    codeFix: string;
    commitMessage: string;
    sqlFix?: string;
  };
  actionExecuted?: AIAction;
}

export interface WebhookErrorPayload {
  platform: PlatformName;
  errorMessage: string;
  errorType?: string;
  stackTrace?: string;
  filePath?: string;
  lineNumber?: number;
  userContext?: Record<string, any>;
  environment?: string;
  severity?: SeverityLevel;
  secret?: string;
}

export interface GitHubCommitPayload {
  alertId: string;
  platform: PlatformName;
  repo: string; // e.g., "org/aiwebcraft" or "owner/aiegent"
  filePath: string;
  fileContent: string;
  commitMessage: string;
  branch?: string;
}

export interface SupabaseFixPayload {
  alertId: string;
  platform: PlatformName;
  sqlQuery: string;
  reason: string;
}

export type SubscriptionTier = 'starter' | 'pro' | 'enterprise' | string;

export interface SaaSPlanConfig {
  id: string;
  slug: string;
  name: string;
  badge?: string;
  description: string;
  priceMonthlyUSD: number;
  priceYearlyUSD: number;
  popular?: boolean;
  colorTheme: 'slate' | 'cyan' | 'purple' | 'emerald' | 'amber';
  limits: TenantPlanLimits;
  features: string[];
  isActive: boolean;
}

export interface TenantPlanLimits {
  maxPlatforms: number;
  maxMicroAgents: number;
  maxMonthlyErrors: number;
  maxTeamSeats: number;
}

export interface TenantUsage {
  usedPlatforms: number;
  usedMicroAgents: number;
  usedMonthlyErrors: number;
  usedTeamSeats: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: SubscriptionTier;
  planStatus: 'active' | 'trialing' | 'past_due' | 'canceled';
  renewsAt: string;
  apiKey: string;
  limits: TenantPlanLimits;
  usage: TenantUsage;
  createdAt: string;
  ownerEmail: string;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  avatarUrl?: string;
  status: 'active' | 'invited';
  joinedAt: string;
}

export interface TenantInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void';
  date: string;
  pdfUrl?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'super_admin' | 'tenant_owner' | 'developer';
  registeredAt: string;
  lastLoginAt: string;
  provider: 'email' | 'google';
}

export interface ProjectFilePayload {
  path: string;
  content: string;
}

export interface GitHubPushRequest {
  repoOwner: string;
  repoName: string;
  githubToken: string;
  targetBranch?: string;
  commitMessage: string;
  files: ProjectFilePayload[];
}

export interface GitHubPushResponse {
  success: boolean;
  message: string;
  commitSha?: string;
  commitUrl?: string;
  repoUrl?: string;
  pushedFiles?: string[];
  error?: string;
  details?: string[];
}



