// pricing-core.js — IDENTICAL copy in acadmify/src/lib/ and acadmify-backend/src/lib/
// Single source of truth for every price shown or charged. Rates come from the
// `pricing` table (row id = 1); DEFAULT_PRICING is only a fallback.
//
// One flat rate per printed page (colour or black & white, 100 gsm paper).
// Online prices apply to orders of at least `min_copies` copies and `min_pages`
// pages per thesis; anything smaller is quoted on WhatsApp.
export const DEFAULT_PRICING = {
  print_per_page: 5, ohp_per_sheet: 5, hard_binding: 250, soft_binding: 150,
  formatting_fee: 500, min_pages: 100, min_copies: 5,
  delivery_charge: 0, free_delivery_above: 0, gst_rate: 18,
}

const int = (v, min, max) => Math.min(max, Math.max(min, Math.floor(Number(v) || 0)))
const num = (v, d) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? d : Number(v))

export function normalisePricing(row = {}) {
  const p = {}
  for (const k of Object.keys(DEFAULT_PRICING)) p[k] = num(row[k], DEFAULT_PRICING[k])
  return p
}

// input: { totalPages, copies, ohp, binding: 'hardbound'|'softbound',
//          deliveryMethod: 'pickup'|'doorstep'|'courier', formatting: true|false }
export function calcQuote(input = {}, pricingRow = {}) {
  const p = normalisePricing(pricingRow)
  const totalPages = int(input.totalPages, 0, 5000)
  const copies     = int(input.copies, 1, 100) || 1
  const ohp        = int(input.ohp, 0, 100)                  // sheets per copy
  const binding    = input.binding === 'softbound' ? 'softbound' : 'hardbound'
  const deliveryMethod = ['pickup', 'doorstep', 'courier'].includes(input.deliveryMethod)
    ? input.deliveryMethod : 'pickup'
  // Thesis formatting: one flat fee per order (not per copy)
  const formatting = input.formatting === true

  const printCost      = totalPages * p.print_per_page * copies
  const ohpCost        = ohp * p.ohp_per_sheet * copies
  const bindRate       = binding === 'softbound' ? p.soft_binding : p.hard_binding
  const bindingCost    = bindRate * copies
  const formattingCost = formatting ? p.formatting_fee : 0
  const subtotal       = printCost + ohpCost + bindingCost + formattingCost

  // delivery_charge 0 => doorstep is paid to the rider (COD); courier => quoted separately
  let delivery = 0
  if (deliveryMethod === 'doorstep' && p.delivery_charge > 0) {
    const free = p.free_delivery_above > 0 && subtotal >= p.free_delivery_above
    delivery = free ? 0 : p.delivery_charge
  }
  const deliveryNote =
    deliveryMethod === 'pickup'   ? 'Pickup from shop — free' :
    deliveryMethod === 'courier'  ? 'Courier outside Jodhpur — quoted on WhatsApp' :
    p.delivery_charge > 0         ? (delivery === 0 ? 'Doorstep delivery — free' : 'Doorstep delivery') :
                                    'Doorstep delivery — paid to rider on delivery'

  const taxable = subtotal + delivery
  const gst     = Math.round(taxable * p.gst_rate / 100)
  const total   = taxable + gst

  // Is this order big enough to be priced online?
  const pagesOk  = totalPages >= p.min_pages
  const copiesOk = copies >= p.min_copies
  const eligible = pagesOk && copiesOk

  return {
    totalPages, copies, ohp, binding, deliveryMethod, formatting,
    printCost, ohpCost, bindingCost, formattingCost, bindRate, subtotal,
    delivery, deliveryNote, gstRate: p.gst_rate, gst, total,
    valid: totalPages > 0,
    eligible, pagesOk, copiesOk, minPages: p.min_pages, minCopies: p.min_copies,
  }
}
