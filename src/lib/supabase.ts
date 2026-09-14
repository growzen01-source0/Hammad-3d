import { createClient } from '@supabase/supabase-js';

// Supabase configuration using provided Project ID & API Key
export const SUPABASE_PROJECT_ID = 'xlanwfpwohvkfjepbdlt';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xwFcrSgcf9Tvp9o4RXcsZg_wxQPglEm';

// Initialize the Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface BookingPayload {
  name: string;
  phone: string;
  email: string;
  service: string;
  packageTier?: string;
  message?: string;
  source?: string;
}

export interface SaveBookingResult {
  success: boolean;
  data?: any;
  error?: string;
  savedOffline?: boolean;
  tableNameUsed?: string;
}

/**
 * Extracts a missing column name from PostgREST/Supabase error messages
 * e.g. "Could not find the 'message' column of 'bookings' in the schema cache"
 */
function extractMissingColumn(msg?: string): string | null {
  if (!msg) return null;
  const match1 = msg.match(/Could not find the ['"](.+?)['"] column/i);
  if (match1 && match1[1]) return match1[1];
  const match2 = msg.match(/column ['"](.+?)['"] of relation/i);
  if (match2 && match2[1]) return match2[1];
  const match3 = msg.match(/column ['"](.+?)['"] does not exist/i);
  if (match3 && match3[1]) return match3[1];
  return null;
}

/**
 * Attempts insertion into a target table, iteratively stripping missing columns
 * if PostgREST reports they are missing in the schema cache (e.g. PGRST204).
 */
async function attemptInsertAdaptive(tableName: string, recordObj: Record<string, any>) {
  const currentRecord = { ...recordObj };
  const strippedCols: string[] = [];

  for (let attempt = 0; attempt < 8; attempt++) {
    // 1. Try with .select()
    const { data, error } = await supabase
      .from(tableName)
      .insert([currentRecord])
      .select();

    if (!error) {
      return {
        success: true,
        data: data?.[0] || currentRecord,
        strippedCols,
        tableName,
      };
    }

    // 2. Check for missing column error (PGRST204 or PostgreSQL 42703)
    const missingCol = extractMissingColumn(error.message);
    if (missingCol && missingCol in currentRecord) {
      console.warn(
        `Supabase: Column '${missingCol}' not found in '${tableName}'. Stripping and retrying...`
      );
      delete currentRecord[missingCol];
      strippedCols.push(missingCol);
      continue;
    }

    // 3. If RLS allowed insert but blocked select (or policy restricts select)
    if (error.code === '42501' || error.message?.toLowerCase().includes('policy')) {
      const pureInsert = await supabase.from(tableName).insert([currentRecord]);
      if (!pureInsert.error) {
        return {
          success: true,
          data: currentRecord,
          strippedCols,
          tableName,
        };
      }
    }

    // 4. Relation does not exist
    if (
      error.code === '42P01' ||
      error.message?.toLowerCase().includes('relation') ||
      error.message?.toLowerCase().includes('not found')
    ) {
      return { success: false, relationMissing: true, error };
    }

    // Other non-recoverable error
    return { success: false, error };
  }

  return { success: false, error: new Error('Maximum insert retry attempts reached.') };
}

/**
 * Saves a new appointment / consultation booking directly into Supabase.
 * Features adaptive column matching (handles missing columns like 'message' or 'package_tier' automatically),
 * automatic table fallback ('bookings' -> 'appointments'),
 * and local storage backup guarantee.
 */
export async function saveBookingToSupabase(
  payload: BookingPayload
): Promise<SaveBookingResult> {
  const timestamp = new Date().toISOString();
  const record: Record<string, any> = {
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    service: payload.service,
    package_tier: payload.packageTier || null,
    message: payload.message?.trim() || null,
    status: 'pending',
    source: payload.source || 'Growzen Web Booking Form',
    created_at: timestamp,
  };

  // Always keep an immediate local backup
  try {
    const existingBackup = JSON.parse(
      localStorage.getItem('growzen_bookings_backup') || '[]'
    );
    existingBackup.unshift({ ...record, id: `local-${Date.now()}` });
    localStorage.setItem(
      'growzen_bookings_backup',
      JSON.stringify(existingBackup.slice(0, 50))
    );
  } catch (storageErr) {
    console.warn('LocalStorage backup error:', storageErr);
  }

  // Attempt 1: Insert adaptively into 'bookings'
  try {
    const resultBookings = await attemptInsertAdaptive('bookings', record);
    if (resultBookings.success) {
      return {
        success: true,
        data: resultBookings.data,
        tableNameUsed: 'bookings',
      };
    }

    // If 'bookings' table doesn't exist, try 'appointments'
    if (resultBookings.relationMissing) {
      const resultAppointments = await attemptInsertAdaptive('appointments', record);
      if (resultAppointments.success) {
        return {
          success: true,
          data: resultAppointments.data,
          tableNameUsed: 'appointments',
        };
      }
    }

    const lastError = resultBookings.error;
    console.error('Supabase Insert Error:', lastError);
    return {
      success: false,
      error: lastError?.message || 'Database insert failed. Please check table permissions.',
      savedOffline: true,
    };
  } catch (err: any) {
    console.error('Supabase connection error:', err);
    return {
      success: false,
      error: err?.message || 'Could not reach Supabase. Booking was saved locally.',
      savedOffline: true,
    };
  }
}

/**
 * Checks connection status with Supabase project
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  tableExists: boolean;
  message: string;
}> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('count', { count: 'exact', head: true });

    if (!error) {
      return { connected: true, tableExists: true, message: 'Connected & Table Ready' };
    }

    if (error.code === '42P01') {
      return {
        connected: true,
        tableExists: false,
        message: "Connected to Supabase! Table 'bookings' needs creation.",
      };
    }

    return {
      connected: true,
      tableExists: false,
      message: `Connected (${error.message || 'Ready for table setup'})`,
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      message: err?.message || 'Connection error',
    };
  }
}

/**
 * Fetches recent bookings from Supabase with fallback to local storage
 */
export async function fetchRecentBookings(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Could not query Supabase directly:', err);
  }

  try {
    return JSON.parse(localStorage.getItem('growzen_bookings_backup') || '[]');
  } catch {
    return [];
  }
}

/**
 * Recommended SQL schema for the user to execute in the Supabase SQL editor
 * to ensure table and RLS permissions are active.
 */
export const SUPABASE_SQL_SCHEMA = `-- Growzen Agency Bookings Table Schema
-- Copy and run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql)

create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text not null,
  email text,
  service text,
  package_tier text,
  message text,
  status text default 'pending',
  source text default 'Growzen Web Booking Form'
);

-- If your bookings table was already created without the 'message' or other columns, run these:
alter table public.bookings add column if not exists message text;
alter table public.bookings add column if not exists service text;
alter table public.bookings add column if not exists email text;
alter table public.bookings add column if not exists package_tier text;
alter table public.bookings add column if not exists status text default 'pending';
alter table public.bookings add column if not exists source text default 'Growzen Web Booking Form';

-- Enable Row Level Security (RLS)
alter table public.bookings enable row level security;

-- Policy: Allow any website visitor to submit a booking
drop policy if exists "Enable public insert for bookings" on public.bookings;
create policy "Enable public insert for bookings" 
  on public.bookings 
  for insert 
  with check (true);

-- Policy: Allow reading bookings (for admin / dashboard)
drop policy if exists "Enable read access for all" on public.bookings;
create policy "Enable read access for all" 
  on public.bookings 
  for select 
  using (true);
`;
