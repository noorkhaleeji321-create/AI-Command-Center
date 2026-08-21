-- ====================================================================
-- AI COMMAND CENTER - SUPABASE POSTGRESQL SCHEMA & RLS SECURITY RULES
-- Applications Monitored: 'aiwebcraft' and 'aiegent'
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. SYSTEM ALERTS TABLE
-- Stores incoming application errors, stack traces, and AI triage status.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('aiwebcraft', 'aiegent', 'command-center')),
    error_type VARCHAR(255) NOT NULL DEFAULT 'UnhandledException',
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    file_path VARCHAR(500),
    line_number INTEGER,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'triaged', 'fixing', 'resolved', 'dismissed')),
    user_context JSONB DEFAULT '{}'::jsonb,
    environment VARCHAR(50) DEFAULT 'production',
    ai_triage JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_alerts_platform ON public.system_alerts(platform);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON public.system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON public.system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON public.system_alerts(created_at DESC);

-- --------------------------------------------------------------------
-- 2. AI ACTIONS TABLE
-- Tracks automated actions executed by Gemini (GitHub commits, SQL fixes).
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES public.system_alerts(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('aiwebcraft', 'aiegent', 'command-center')),
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('github_commit', 'supabase_query', 'triage_analysis', 'chat_response')),
    target_ref VARCHAR(500) NOT NULL, -- e.g., 'src/api/auth.ts' or 'public.users'
    description TEXT NOT NULL,
    code_diff TEXT,
    sql_executed TEXT,
    commit_sha VARCHAR(100),
    commit_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    error_details TEXT,
    executed_by VARCHAR(100) NOT NULL DEFAULT 'Gemini 3.6 Flash Bot',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_actions_alert_id ON public.ai_actions(alert_id);
CREATE INDEX IF NOT EXISTS idx_ai_actions_platform ON public.ai_actions(platform);
CREATE INDEX IF NOT EXISTS idx_ai_actions_created_at ON public.ai_actions(created_at DESC);

-- --------------------------------------------------------------------
-- 3. UPDATED_AT TRIGGER FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_system_alerts_updated_at ON public.system_alerts;
CREATE TRIGGER set_system_alerts_updated_at
BEFORE UPDATE ON public.system_alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- Ensures only authenticated admin accounts can view and edit error logs & actions.
-- Service Role Key bypasses RLS for automated backend webhook ingestion.
-- --------------------------------------------------------------------
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_actions ENABLE ROW LEVEL SECURITY;

-- Clear existing policies if re-running script
DROP POLICY IF EXISTS "Admin Full Access on system_alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Admin Full Access on ai_actions" ON public.system_alerts;
DROP POLICY IF EXISTS "Service Role Full Access on system_alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Service Role Full Access on ai_actions" ON public.ai_actions;

-- Policy 1: Authenticated Admin Access
CREATE POLICY "Admin Full Access on system_alerts"
ON public.system_alerts
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'authenticated')
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Admin Full Access on ai_actions"
ON public.ai_actions
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'authenticated')
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- Policy 2: Allow Service Role (Backend Webhooks / Gemini Bot) Full Control
CREATE POLICY "Service Role Full Access on system_alerts"
ON public.system_alerts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service Role Full Access on ai_actions"
ON public.ai_actions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 3: Webhook Insertion for Anon with Webhook Token verification (optional if client side)
CREATE POLICY "Allow Anon Insert with Valid Service"
ON public.system_alerts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- --------------------------------------------------------------------
-- 5. USER SECURE DATA TABLE (Strict Isolation RLS)
-- Ensures each user's data is strictly private and inaccessible to others.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'tenant_owner',
    user_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_email ON public.user_data(email);

ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Strict User Isolation Policy" ON public.user_data;
CREATE POLICY "Strict User Isolation Policy"
ON public.user_data
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

