import React, { useState } from "react";
import { X, Copy, Check, Database, ShieldCheck, Terminal } from "lucide-react";

interface SchemaDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaDocModal: React.FC<SchemaDocModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchema = `-- ====================================================================
-- AI COMMAND CENTER - SUPABASE POSTGRESQL SCHEMA & RLS SECURITY RULES
-- ====================================================================

-- 1. SYSTEM ALERTS TABLE
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

-- 2. AI ACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.ai_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES public.system_alerts(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('aiwebcraft', 'aiegent', 'command-center')),
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('github_commit', 'supabase_query', 'triage_analysis', 'chat_response')),
    target_ref VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    code_diff TEXT,
    sql_executed TEXT,
    commit_sha VARCHAR(100),
    commit_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    executed_by VARCHAR(100) NOT NULL DEFAULT 'Gemini 3.6 Flash Bot',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_actions ENABLE ROW LEVEL SECURITY;

-- Admin authenticated users full access
CREATE POLICY "Admin Full Access on system_alerts" ON public.system_alerts FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "Admin Full Access on ai_actions" ON public.ai_actions FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'authenticated');

-- Service Role Key (Backend Webhooks & Gemini Bot) full control
CREATE POLICY "Service Role Full Access on system_alerts" ON public.system_alerts FOR ALL TO service_role USING (true);
CREATE POLICY "Service Role Full Access on ai_actions" ON public.ai_actions FOR ALL TO service_role USING (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">هيكلية قاعدة بيانات Supabase وقواعد الأمان (RLS)</h3>
              <p className="text-xs text-slate-400">جداول system_alerts و ai_actions لمُحرر SQL في Supabase</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 font-sans text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              تتضمن سياسات حماية مستوى الصفوف (RLS) للآدمن
            </span>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-sans text-xs transition-all cursor-pointer flex items-center gap-1.5 font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "تم نسخ كود SQL!" : "نسخ سكربت SQL"}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 overflow-x-auto text-[11px] font-mono leading-relaxed max-h-96">
            {sqlSchema}
          </pre>
        </div>
      </div>
    </div>
  );
};
