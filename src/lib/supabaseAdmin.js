// The full Supabase library, used ONLY by the admin panel (it is loaded lazily,
// so ordinary visitors never download it). Uses the public anon/publishable key;
// what the admin can do is decided by the database rules in migration 010.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const adminConfigured = Boolean(url && key)

export const supabase = adminConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'acadmify-admin-auth' },
    })
  : null
