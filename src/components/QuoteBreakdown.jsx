// Line-by-line price, from calcQuote() output. Used by the calculator and the order page.
import { rupees, plural } from '../lib/format.js'
import { bindingLabel } from '../constants.js'

export default function QuoteBreakdown({ q }) {
  const copies = plural(q.copies, 'copy', 'copies')
  const rows = [
    ['Printing: ' + q.totalPages + ' pages × ' + copies, q.printCost],
    ...(q.ohp > 0 ? [['OHP sheets: ' + q.ohp + ' × ' + copies, q.ohpCost]] : []),
    [bindingLabel(q.binding) + ' binding × ' + copies, q.bindingCost],
    ...(q.formattingCost > 0 ? [['Thesis formatting', q.formattingCost]] : []),
  ]

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
            <dt>GST {q.gstRate}%</dt>
            <dd className="num">{rupees(q.gst)}</dd>
          </div>
        )}
        <div className="quote-total">
          <dt>Total</dt>
          <dd className="num">{rupees(q.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
