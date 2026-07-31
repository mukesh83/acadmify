// ============================================================================
// src/lib/supabase.js
// One shared Supabase connection for the whole app.
//
// This uses the ANON key, which is safe to put in the browser -- but ONLY
// because sql/005_security_lockdown.sql restricts what the anon key can do.
// Never put the service_role key anywhere in the src folder.
// ============================================================================

import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  // Shows up in the browser console (F12) if the Vercel env vars are missing.
  console.error(
    'Supabase env vars are missing. Add VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY in Vercel -> Settings -> Environment Variables, ' +
    'then REDEPLOY.'
  )
}

export const supabase = createClient(url || '', anon || '', {
  auth: {
    persistSession: true,     // stay logged in after a refresh
    autoRefreshToken: true,   // renew the session quietly in the background
  },
})

// Convenience helper used by the admin panel.
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session || null
}

export async function signOut() {
  await supabase.auth.signOut()
}
