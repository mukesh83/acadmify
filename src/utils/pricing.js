import { BINDINGS } from '../constants'

/**
 * Calculate quotation for a thesis print order.
 * @param {Object} params
 * @param {number} params.pages       - Total page count
 * @param {number} params.colorPages  - Number of color pages
 * @param {string} params.binding     - Binding type id
 * @param {number} params.copies      - Number of copies
 * @returns {Object} Detailed cost breakdown
 */
export function calcQuote({ pages = 0, colorPages = 0, binding = 'hardbound', copies = 1 }) {
  const bwPages   = Math.max(0, pages - colorPages)
  const bwCost    = bwPages * 2
  const colorCost = colorPages * 10
  const bindCost  = BINDINGS.find(b => b.id === binding)?.price ?? 0

  const bw       = bwCost * copies
  const col      = colorCost * copies
  const bind     = bindCost * copies
  const subtotal = bw + col + bind
  const delivery = subtotal >= 500 ? 0 : 50
  const gst      = Math.round(subtotal * 0.18)
  const total    = subtotal + delivery + gst

  return { bw, col, bind, subtotal, delivery, gst, total }
}

/**
 * Format a number as Indian currency string.
 * @param {number} n
 * @returns {string}
 */
export function inr(n) {
  return `₹${n.toLocaleString('en-IN')}`
}
