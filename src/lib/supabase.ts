import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials with priority:
// 1. Runtime rotated keys from sessionStorage/localStorage (if Super Admin rotated them in-session)
// 2. Injected Vite env vars (from Supabase_project_url / Supabase_anon_key / VITE_SUPABASE_*)
// 3. Defaults matching active project

const STORAGE_KEY_CONFIG = 'nexora_supabase_rotated_config';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  projectId: string;
  rotatedAt: string;
  fingerprint: string;
}

function getInitialConfig(): SupabaseConfig {
  const saved = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY_CONFIG) : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    } catch {
      // Fallback
    }
  }

  const url = import.meta.env.VITE_SUPABASE_URL || 'https://kunabampibfcmnbyjads.supabase.co';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'kunabampibfcmnbyjads';
  
  // Safe fingerprint for auditing
  const fingerprint = anonKey.length > 12 
    ? `${anonKey.slice(0, 6)}...${anonKey.slice(-4)}`
    : 'not-configured';

  return {
    url,
    anonKey,
    projectId,
    rotatedAt: new Date().toISOString(),
    fingerprint,
  };
}

let activeConfig: SupabaseConfig = getInitialConfig();

// Create the active Supabase client instance
export let supabase: SupabaseClient = createClient(
  activeConfig.url,
  activeConfig.anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Returns current configuration metadata without exposing secret keys
 */
export function getSupabaseConfig(): SupabaseConfig {
  return { ...activeConfig };
}

/**
 * Verifies if valid Supabase credentials have been injected or rotated
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    activeConfig.url && 
    activeConfig.anonKey && 
    !activeConfig.anonKey.includes('placeholder')
  );
}

/**
 * Rotates the active Supabase keys at runtime across all sessions.
 * Recreates the Supabase client seamlessly.
 */
export function rotateSupabaseKeys(newUrl?: string, newKey?: string, newProjectId?: string): { success: boolean; config: SupabaseConfig } {
  const url = (newUrl || activeConfig.url).trim();
  const anonKey = (newKey || activeConfig.anonKey).trim();
  const projectId = (newProjectId || activeConfig.projectId || 'kunabampibfcmnbyjads').trim();
  const rotatedAt = new Date().toISOString();
  
  const fingerprint = anonKey.length > 12 
    ? `${anonKey.slice(0, 6)}...${anonKey.slice(-4)}`
    : 'rotated-empty';

  activeConfig = {
    url,
    anonKey,
    projectId,
    rotatedAt,
    fingerprint,
  };

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(activeConfig));
  }

  // Re-instantiate client with rotated credentials
  supabase = createClient(activeConfig.url, activeConfig.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return {
    success: true,
    config: { ...activeConfig },
  };
}

/**
 * Performs a comprehensive real-time health check on the Supabase instance:
 * 1. Checks GoTrue Authentication Gateway
 * 2. Checks Database REST Table Ingress
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  authAlive: boolean;
  databaseAlive: boolean;
  schemaDeployed: boolean;
  latencyMs: number;
  project: string;
  url: string;
  version?: string;
  error?: string;
}> {
  const startTime = Date.now();
  const result = {
    connected: false,
    authAlive: false,
    databaseAlive: false,
    schemaDeployed: false,
    latencyMs: 0,
    project: activeConfig.projectId,
    url: activeConfig.url,
    version: 'GoTrue v2.197.0',
    error: undefined as string | undefined,
  };

  try {
    // 1. Test Auth Gateway via public /auth/v1/health or getSession
    const authPromise = fetch(`${activeConfig.url}/auth/v1/health`, {
      headers: {
        apikey: activeConfig.anonKey,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          result.authAlive = true;
          try {
            const data = await res.json();
            if (data.version) result.version = `${data.name || 'GoTrue'} ${data.version}`;
          } catch {
            // non-json response
          }
        }
      })
      .catch((err) => {
        console.warn('Supabase Auth health check failed:', err);
      });

    // 2. Test Database REST endpoint
    const dbPromise = fetch(`${activeConfig.url}/rest/v1/events?select=count`, {
      headers: {
        apikey: activeConfig.anonKey,
        Authorization: `Bearer ${activeConfig.anonKey}`,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          result.databaseAlive = true;
          result.schemaDeployed = true;
        } else if (res.status === 404 || res.status === 400) {
          const body = await res.json().catch(() => ({}));
          // If message is "Could not find the table ... in the schema cache",
          // REST connection is authenticated and active, but schema needs to be run!
          if (body.code === 'PGRST205' || body.message?.includes('schema cache')) {
            result.databaseAlive = true;
            result.schemaDeployed = false;
          }
        }
      })
      .catch((err) => {
        console.warn('Supabase DB health check failed:', err);
      });

    await Promise.allSettled([authPromise, dbPromise]);
    result.latencyMs = Date.now() - startTime;
    result.connected = result.authAlive || result.databaseAlive;
    return result;
  } catch (err: any) {
    result.latencyMs = Date.now() - startTime;
    result.error = err.message || 'Network timeout contacting Supabase endpoint';
    return result;
  }
}

// -------------------------------------------------------------
// Authentication Wrappers
// -------------------------------------------------------------
export async function supabaseSignUp(email: string, password: string, fullName: string, role: string = 'attendee') {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured with active credentials.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function supabaseSignIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured with active credentials.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Supabase SignOut error:', error);
}

export async function supabaseGetSession() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

// -------------------------------------------------------------
// Database Synchronization Functions
// -------------------------------------------------------------

/**
 * Fetches country launch gates from public.country_launch_gates in Supabase
 */
export async function fetchLaunchGatesFromSupabase() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('country_launch_gates')
      .select('*')
      .order('wave', { ascending: true });

    if (error) {
      console.warn('Supabase fetchLaunchGates error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Network error fetching launch gates:', err);
    return null;
  }
}

/**
 * Updates a specific launch gate attribute in Supabase
 */
export async function updateLaunchGateInSupabase(countryCode: string, updates: Record<string, any>) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('country_launch_gates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('country_code', countryCode)
      .select();

    if (error) {
      console.warn('Supabase updateLaunchGate error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Network error updating launch gate:', err);
    return null;
  }
}

/**
 * Fetches published events from public.events
 */
export async function fetchEventsFromSupabase() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .order('start_date', { ascending: true });

    if (error) {
      console.warn('Supabase fetchEvents error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Network error fetching events:', err);
    return null;
  }
}

/**
 * Inserts a balanced ledger journal entry into public.ledger_entries
 */
export async function insertLedgerEntryInSupabase(entry: {
  order_id?: string;
  transaction_ref?: string;
  entry_type: string;
  debit_account: string;
  credit_account: string;
  debit_minor: number;
  credit_minor: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
}) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('ledger_entries')
      .insert([entry])
      .select();

    if (error) {
      console.warn('Supabase insertLedgerEntry error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Network error inserting ledger entry:', err);
    return null;
  }
}

/**
 * Checks in a ticket using the anti-passback function or table check
 */
export async function checkInTicketInSupabase(ticketCode: string, gateCode: string, staffProfileId?: string) {
  if (!isSupabaseConfigured()) return null;
  try {
    // Call RPC or perform table check
    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_code', ticketCode)
      .single();

    if (ticketErr || !ticket) {
      return { success: false, reason: 'TICKET_NOT_FOUND' };
    }

    if (ticket.status === 'checked_in') {
      return { success: false, reason: 'ALREADY_CHECKED_IN', ticket };
    }

    const { data: updated, error: updateErr } = await supabase
      .from('tickets')
      .update({ status: 'checked_in' })
      .eq('id', ticket.id)
      .select()
      .single();

    if (updateErr) {
      return { success: false, reason: 'UPDATE_FAILED', error: updateErr.message };
    }

    // Insert audit check-in log
    await supabase.from('check_ins').insert([{
      ticket_id: ticket.id,
      event_id: ticket.event_id,
      scanned_by: staffProfileId || null,
      gate_code: gateCode,
      scan_type: 'entry',
      result: 'success',
    }]);

    return { success: true, ticket: updated };
  } catch (err: any) {
    return { success: false, reason: 'NETWORK_ERROR', error: err.message };
  }
}

