// Calls to the Acadmify backend on Render.
// Render's free plan sleeps after 15 minutes, so the first call can take up to
// a minute: requests wait up to 75 seconds, and pages "wake" the server early.
import { timeoutSignal } from './util.js'

export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, network) {
    super(message)
    this.status = status
    this.network = network // true = never reached the server (offline, timeout)
  }
}

async function request(path, { method = 'GET', body, headers, timeoutMs = 75000 } = {}) {
  let res
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json', ...headers } : headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: timeoutSignal(timeoutMs),
    })
  } catch (e) {
    const timedOut = e && (e.name === 'TimeoutError' || e.name === 'AbortError')
    throw new ApiError(
      timedOut ? 'Our server took too long to answer.' : 'Could not reach our server. Please check your internet connection.',
      0,
      true
    )
  }
  let data = null
  try {
    data = await res.json()
  } catch {
    // no JSON body
  }
  if (!res.ok) throw new ApiError((data && data.error) || 'Something went wrong (error ' + res.status + ').', res.status, false)
  return data
}

let lastWake = 0
export function wakeServer() {
  if (Date.now() - lastWake < 60000) return
  lastWake = Date.now()
  fetch(API_BASE + '/health', { signal: timeoutSignal(70000) }).catch(() => {})
}

export const createOrder = (payload) => request('/api/orders', { method: 'POST', body: payload })

export const confirmUpload = (orderId, clientToken) =>
  request('/api/orders/' + encodeURIComponent(orderId) + '/uploaded', { method: 'POST', body: { clientToken } })

export const freshUploadUrls = (orderId, body) =>
  request('/api/orders/' + encodeURIComponent(orderId) + '/upload-urls', { method: 'POST', body })

export const getConfig = () => request('/api/config', { timeoutMs: 15000 })

// body: { orderId, clientToken } or { orderId, phone } (last 4 digits)
export const createPayment = (body) => request('/api/payments/create-order', { method: 'POST', body })

export const verifyPayment = (details) => request('/api/payments/verify', { method: 'POST', body: details })

// Admin only: refund an online payment in full (needs the admin's login token)
export const refundOrder = (orderId, accessToken) =>
  request('/api/admin/orders/' + encodeURIComponent(orderId) + '/refund', {
    method: 'POST',
    body: {},
    headers: { Authorization: 'Bearer ' + accessToken },
  })

export const trackOrder = (orderId, last4) =>
  request('/api/track?order=' + encodeURIComponent(orderId) + '&phone=' + encodeURIComponent(last4))
