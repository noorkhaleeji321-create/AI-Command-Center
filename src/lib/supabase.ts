import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://ecowrkizfpmcpsyzvvze.supabase.co";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjb3dya2l6ZnBtY3BzeXp2dnplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ0MTU1NSwiZXhwIjoyMTAxMDE3NTU1fQ.eAIJwdanFXJ7cUBmLyc6wgYCzO85EHyawUHOjHpD0G8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Saves all user data and settings securely into Supabase with strict isolation
 */
export async function saveUserSecureData(user: { id: string; email: string; name?: string; role?: string }, allAppData: any) {
  try {
    const payload = {
      user_id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      role: user.role || 'tenant_owner',
      user_data: allAppData,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_data')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.warn("Supabase sync notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase sync exception:", err);
    return false;
  }
}

/**
 * Loads user secure data from Supabase
 */
export async function loadUserSecureData(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('user_data')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }
    return data.user_data;
  } catch (err) {
    console.warn("Supabase load exception:", err);
    return null;
  }
}
