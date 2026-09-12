// pricing-core.js — IDENTICAL copy in acadmify/src/lib/ and acadmify-backend/src/lib/
// Single source of truth for every price shown or charged. Rates come from the
// `pricing` table (row id = 1); DEFAULT_PRICING is only a fallback.
export const DEFAULT_PRICING = {
  bw_per_page: 2, color_per_page: 10, colour_bulk_rate: 6, colour_bulk_above: 40,
  ohp_per_sheet: 5, hard_binding: 250, soft_binding: 150, softbound_enabled: true,
  formatting_fee: 200,
  delivery_charge: 0, free_delivery_above: 0, gst_rate: 18,
}

const int = (v, min, max) => Math.min(max, Math.max(min, Math.floor(Number(v) || 0)))
const num = (v, d) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? d : Number(v))

export function normalisePricing(row = {}) {
  const p = {}
  for (const k of Object.keys(DEFAULT_PRICING)) {
    p[k] = typeof DEFAULT_PRICING[k] === 'boolean'
      ? (row[k] === undefined || row[k] === null ? DEFAULT_PRICING[k] : Boolean(row[k]))
      : num(row[k], DEFAULT_PRICING[k])
  }
  return p
}

// input: { totalPages, colourPages, copies, ohp, binding: 'hardbound'|'softbound',
//          deliveryMethod: 'pickup'|'doorstep'|'courier', formatting: true|false }
export function calcQuote(input = {}, pricingRow = {}) {
  const p = normalisePricing(pricingRow)
  const totalPages  = int(input.totalPages, 0, 5000)
  const colourPages = Math.min(int(input.colourPages, 0, 5000), totalPages)
  const copies      = int(input.copies, 1, 100) || 1
  const ohp         = int(input.ohp, 0, 100)                // sheets per copy
  const binding     = input.binding === 'softbound' && p.softbound_enabled ? 'softbound' : 'hardbound'
  const deliveryMethod = ['pickup', 'doorstep', 'courier'].includes(input.deliveryMethod)
    ? input.deliveryMethod : 'pickup'
  // Thesis formatting: one flat fee per order (not per copy), thesis orders only
  const formatting  = input.formatting === true && binding === 'hardbound'

  const bwPages     = totalPages - colourPages
  const bulkApplied = colourPages > 0 && colourPages * copies > p.colour_bulk_above
  const colourRate  = bulkApplied ? p.colour_bulk_rate : p.color_per_page
  const bindRate    = binding === 'softbound' ? p.soft_binding : p.hard_binding

  const bwCost         = bwPages * p.bw_per_page * copies
  const colourCost     = colourPages * colourRate * copies
  const ohpCost        = ohp * p.ohp_per_sheet * copies
  const bindingCost    = bindRate * copies
  const formattingCost = formatting ? p.formatting_fee : 0
  const subtotal       = bwCost + colourCost + ohpCost + bindingCost + formattingCost

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

  return {
    totalPages, colourPages, bwPages, copies, ohp, binding, deliveryMethod, formatting,
    colourRate, bindRate, bulkApplied,
    bwCost, colourCost, ohpCost, bindingCost, formattingCost, subtotal,
    delivery, deliveryNote, gstRate: p.gst_rate, gst, total,
    valid: totalPages > 0,
  }
}
