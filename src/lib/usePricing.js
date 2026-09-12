// Live prices from the Supabase `pricing` table (row id = 1).
// Shows the last known prices instantly (cached in the browser), then updates.
// If Supabase is unreachable, pricing-core's DEFAULT_PRICING is used.
import { useEffect, useState } from 'react'
import { normalisePricing } from './pricing-core.js'
import { publicSelect } from './supabasePublic.js'
import { readJson, writeJson, removeKey } from './util.js'

const CACHE_KEY = 'acadmify.pricing.v2'
let request = null // one network request per page load, shared by every component

export function usePricing() {
  const [pricing, setPricing] = useState(() => normalisePricing(readJson('localStorage', CACHE_KEY) || {}))

  useEffect(() => {
    let alive = true
    request = request || publicSelect('pricing?id=eq.1&select=*').then((rows) => (Array.isArray(rows) && rows[0]) || null)
    request.then((row) => {
      if (!row) return
      writeJson('localStorage', CACHE_KEY, row)
      if (alive) setPricing(normalisePricing(row))
    })
    return () => {
      alive = false
    }
  }, [])

  return pricing
}

export function forgetPricingCache() {
  request = null
  removeKey('localStorage', CACHE_KEY)
}
