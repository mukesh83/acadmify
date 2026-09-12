// Small browser helpers. Storage access is wrapped because it can throw
// (private windows, blocked cookies) and must never break the page.

export function readJson(storage, key) {
  try {
    const raw = window[storage].getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeJson(storage, key, value) {
  try {
    window[storage].setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function removeKey(storage, key) {
  try {
    window[storage].removeItem(key)
  } catch {
    // ignore
  }
}

// An AbortSignal that fires after `ms` milliseconds (works on older Safari too).
export function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) return AbortSignal.timeout(ms)
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Accepts a YouTube URL or a bare 11-character id; returns the id or ''.
export function youtubeId(value) {
  const v = String(value || '').trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v
  const m = v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : ''
}
