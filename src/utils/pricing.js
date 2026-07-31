// ============================================================================
// src/utils/pricing.js
// One pricing calculation, used by both QuoteCalculator and Upload.
//
// CHANGES FROM THE OLD VERSION
//   1. GST is now split into CGST + SGST (required on a valid tax invoice
//      for a sale inside Rajasthan). Interstate orders get a single IGST.
//   2. GST is charged on the delivery fee too. Delivery is part of the same
//      supply, so it forms part of the taxable value.
//   3. FREE_DELIVERY_ABOVE lowered from 500 to 300. At 500 the fee almost
//      never applied, because every order already includes Rs.250 binding.
//      Change it back on the line below if you prefer.
// ============================================================================

export const RATES = {
  bw:                 2,     // Rs per B&W page
  colourStandard:     10,    // Rs per colour page
  colourBulk:         6,     // Rs per colour page when the bulk rule applies
  ohp:                5,     // Rs per OHP sheet
  hardbound:          250,   // Rs per copy
  deliveryFee:        50,    // Rs, within Jodhpur
  freeDeliveryAbove:  300,   // Rs subtotal at which delivery becomes free
  gstRate:            0.18,  // 18%
}

// Bulk colour rate applies only when BOTH are true.
const bulkColourApplies = (colourPages, copies) => colourPages > 10 && copies > 2

const round2 = (n) => Math.round(n * 100) / 100

export function calcQuote(input = {}) {
  const totalPages  = Math.max(0, Number(input.totalPages)  || 0)
  const colourPages = Math.max(0, Number(input.colourPages) || 0)
  const copies      = Math.max(1, Number(input.copies)      || 1)
  const ohp         = Math.max(0, Number(input.ohp)         || 0)
  const interState  = Boolean(input.interState)

  // Colour pages can never exceed total pages.
  const colour  = Math.min(colourPages, totalPages)
  const bwPages = Math.max(0, totalPages - colour)

  const colourRate = bulkColourApplies(colour, copies)
    ? RATES.colourBulk
    : RATES.colourStandard

  // Per-copy costs
  const bwPerCopy     = bwPages * RATES.bw
  const colourPerCopy = colour  * colourRate
  const ohpPerCopy    = ohp     * RATES.ohp
  const bindPerCopy   = RATES.hardbound

  // Order totals
  const bwCost      = bwPerCopy     * copies
  const colourCost  = colourPerCopy * copies
  const ohpCost     = ohpPerCopy    * copies
  const bindingCost = bindPerCopy   * copies

  const subtotal = bwCost + colourCost + ohpCost + bindingCost
  const delivery = subtotal >= RATES.freeDeliveryAbove ? 0 : RATES.deliveryFee

  const taxable  = subtotal + delivery
  const gstTotal = round2(taxable * RATES.gstRate)

  const cgst = interState ? 0 : round2(gstTotal / 2)
  const sgst = interState ? 0 : round2(gstTotal - cgst)
  const igst = interState ? gstTotal : 0

  const total = round2(taxable + gstTotal)

  return {
    // page breakdown
    totalPages, bwPages, colourPages: colour, copies, ohp,
    colourRate,
    bulkDiscountApplied: colourRate === RATES.colourBulk,

    // money
    bwCost, colourCost, ohpCost, bindingCost,
    subtotal, delivery,
    cgst, sgst, igst,
    gst: gstTotal,
    total,

    freeDelivery: delivery === 0,
  }
}

// Formats a number the Indian way: 1,23,456
export function rupees(n) {
  const v = Number(n) || 0
  return 'Rs. ' + v.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

// Kept so any file still importing the old name keeps working.
export const calcTotal = calcQuote
export default calcQuote
