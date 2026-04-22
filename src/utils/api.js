/**
 * Acadmify API client
 * All communication with the Express/Supabase backend goes through here.
 * Set VITE_API_URL in your .env file.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data
}

// ─── Pricing & Quotation ──────────────────────────────────────────────────────

/** Fetch live pricing config from DB */
export async function fetchPricing() {
  return request('/api/pricing')
}

/**
 * Get instant quotation from the backend.
 * @param {{ pages, colorPages, binding, copies }} params
 */
export async function getQuote(params) {
  return request('/api/quote', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(params),
  })
}

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * Place a new order — sends multipart/form-data with PDF files.
 * @param {FormData} formData
 */
export async function placeOrder(formData) {
  return request('/api/orders', {
    method: 'POST',
    body:   formData,   // browser sets Content-Type: multipart/form-data automatically
  })
}

/**
 * Track an order by its ID.
 * @param {string} orderId  e.g. "ACD-2025-0001"
 */
export async function trackOrder(orderId) {
  return request(`/api/orders/${orderId}`)
}

// ─── Payments ─────────────────────────────────────────────────────────────────

/**
 * Create a Razorpay order on the backend.
 * Returns { razorpayOrderId, amount, currency, keyId }
 */
export async function createPaymentOrder(orderId) {
  return request('/api/payments/create-order', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ orderId }),
  })
}

/**
 * Verify Razorpay payment signature on the backend.
 * Called after Razorpay checkout success callback.
 */
export async function verifyPayment(payload) {
  return request('/api/payments/verify', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
}

// ─── Admin ────────────────────────────────────────────────────────────────────

function adminHeaders(secret) {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${secret}`,
  }
}

export async function adminLogin(secret) {
  // Validate the secret by hitting a protected endpoint
  return request('/api/admin/stats', {
    headers: adminHeaders(secret),
  })
}

export async function fetchAdminStats(secret) {
  return request('/api/admin/stats', { headers: adminHeaders(secret) })
}

export async function fetchAllOrders(secret, { status = 'all', page = 1 } = {}) {
  const qs = new URLSearchParams({ status, page }).toString()
  return request(`/api/orders?${qs}`, { headers: adminHeaders(secret) })
}

export async function updateOrderStatus(secret, orderId, status, note = '') {
  return request(`/api/orders/${orderId}/status`, {
    method:  'PATCH',
    headers: adminHeaders(secret),
    body:    JSON.stringify({ status, note }),
  })
}

export async function fetchPricingAdmin(secret) {
  return request('/api/admin/pricing', { headers: adminHeaders(secret) })
}

export async function updatePricing(secret, updates) {
  return request('/api/admin/pricing', {
    method:  'PUT',
    headers: adminHeaders(secret),
    body:    JSON.stringify(updates),
  })
}

export async function getDownloadUrls(secret, orderId) {
  return request(`/api/orders/${orderId}/download`, { headers: adminHeaders(secret) })
}

export async function fetchOrderHistory(secret, orderId) {
  return request(`/api/admin/orders/${orderId}/history`, { headers: adminHeaders(secret) })
}
