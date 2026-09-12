// Line-by-line price, from calcQuote() output. Used by the calculator and the upload page.
import { rupees, plural } from '../lib/format.js'

export default function QuoteBreakdown({ q, p, service = 'thesis' }) {
  const copies = plural(q.copies, 'copy', 'copies')
  const rows = []

  if (service === 'book') {
    rows.push(['Softbound binding × ' + copies, q.bindingCost])
  } else {
    if (q.bwPages > 0) rows.push(['B&W printing: ' + q.bwPages + ' pages × ' + rupees(p.bw_per_page) + ' × ' + copies, q.bwCost])
    if (q.colourPages > 0) rows.push(['Colour printing: ' + q.colourPages + ' pages × ' + rupees(q.colourRate) + ' × ' + copies, q.colourCost])
    if (q.ohp > 0) rows.push(['OHP sheets: ' + q.ohp + ' × ' + rupees(p.ohp_per_sheet) + ' × ' + copies, q.ohpCost])
    rows.push(['Hardbound binding × ' + copies, q.bindingCost])
    if (q.formattingCost > 0) rows.push(['Thesis formatting (once per order)', q.formattingCost])
  }

  const deliveryValue =
    q.delivery > 0 ? rupees(q.delivery) :
    q.deliveryMethod === 'pickup' ? 'Free' :
    q.deliveryMethod === 'courier' ? 'Quoted separately' : 'Paid to rider'

  return (
    <div className="quote-card">
      <dl className="quote-rows">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className="num">{rupees(value)}</dd>
          </div>
        ))}
        <div className="quote-sub">
          <dt>Subtotal</dt>
          <dd className="num">{rupees(q.subtotal)}</dd>
        </div>
        <div>
          <dt>
            Delivery
            <span className="quote-note">{q.deliveryNote}</span>
          </dt>
          <dd>{deliveryValue}</dd>
        </div>
        {q.gstRate > 0 && (
          <div>
            <dt>GST ({q.gstRate}%)</dt>
            <dd className="num">{rupees(q.gst)}</dd>
          </div>
        )}
        <div className="quote-total">
          <dt>Total</dt>
          <dd className="num">{rupees(q.total)}</dd>
        </div>
      </dl>
      {service === 'thesis' && q.bulkApplied && (
        <p className="quote-bulk">
          Bulk colour rate applied: {rupees(q.colourRate)} per colour page (more than {p.colour_bulk_above} colour pages in total).
        </p>
      )}
    </div>
  )
}
