// Public, read-only access to Supabase using plain fetch (keeps the big
// supabase-js library out of the public website; only the admin panel loads it).
// Reads only what the database rules allow logged-out visitors to see:
// site_content, gallery and pricing.
import { timeoutSignal } from './util.js'

const URL_BASE = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const publicConfigured = Boolean(URL_BASE && KEY)

function headers() {
  const h = { apikey: KEY }
  // Legacy anon keys are JWTs ("eyJ...") and also go in Authorization.
  // New sb_publishable_... keys must NOT be sent as a Bearer token.
  if (KEY.startsWith('eyJ')) h.Authorization = 'Bearer ' + KEY
  return h
}

// publicSelect('gallery?select=*&active=eq.true') -> array, or null on any failure
export async function publicSelect(pathAndQuery, timeoutMs = 8000) {
  if (!publicConfigured) return null
  try {
    const res = await fetch(URL_BASE + '/rest/v1/' + pathAndQuery, {
      headers: headers(),
      signal: timeoutSignal(timeoutMs),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
