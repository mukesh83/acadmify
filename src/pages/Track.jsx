import { useEffect, useState } from 'react'
import { useLocation } from '../lib/router.jsx'
import { usePageMeta } from '../lib/seo.js'
import { trackOrder, wakeServer } from '../lib/api.js'
import { useWaLink } from '../lib/whatsapp.js'
import { rupees, formatDate } from '../lib/format.js'
import Field from '../components/Field.jsx'
import { IconCheck, IconWhatsApp } from '../components/Icons.jsx'

const DOOR_FLOW = ['received', 'printing', 'binding', 'ready', 'dispatched', 'delivered']
const PICKUP_FLOW = ['received', 'printing', 'binding', 'ready', 'delivered']

function labelFor(status, pickup) {
  if (pickup && status === 'ready') return 'Ready for pickup'
  if (pickup && status === 'delivered') return 'Collected'
  return {
    received: 'Order received',
    printing: 'Printing',
    binding: 'Binding',
    ready: 'Ready',
    dispatched: 'Out for delivery',
    delivered: 'Delivered',
  }[status]
}

export default function Track() {
  usePageMeta({
    title: 'Track your order — Acadmify',
    description: 'Check the status of your Acadmify thesis printing order with your order number and the last 4 digits of your phone.',
    path: '/track',
  })

  const { query } = useLocation()
  const wa = useWaLink()
  const [orderId, setOrderId] = useState(() => query.get('id') || '')
  const [last4, setLast4] = useState('')
  const [busy, setBusy] = useState(false)
  const [slow, setSlow] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    wakeServer()
  }, [])

  async function lookup(e) {
    e.preventDefault()
    setError('')
    setOrder(null)
    const id = orderId.trim().toUpperCase()
    if (!id) return setError('Please enter your order number, for example ACD-2026-0012.')
    if (last4.length !== 4) return setError('Please enter the last 4 digits of the phone number you ordered with.')
    setBusy(true)
    const slowTimer = setTimeout(() => setSlow(true), 5000)
    try {
      setOrder(await trackOrder(id, last4))
    } catch (err) {
      setError(err.message)
    } finally {
      clearTimeout(slowTimer)
      setSlow(false)
      setBusy(false)
    }
  }

  const pickup = order && order.deliveryMethod === 'pickup'
  const flow = pickup ? PICKUP_FLOW : DOOR_FLOW
  let current = order ? flow.indexOf(order.status) : -1
  if (order && current === -1 && order.status === 'dispatched') current = flow.indexOf('ready')
  const dateOf = (status) => {
    const hits = ((order && order.history) || []).filter((h) => h.status === status)
    return hits.length ? hits[hits.length - 1].at : null
  }

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1>Track your order</h1>
        <p>Enter your order number and the last 4 digits of the phone number you ordered with.</p>
      </header>

      <form className="form-card" onSubmit={lookup} noValidate>
        <div className="field-row cols-2">
          <Field id="t-id" label="Order number">
            <input id="t-id" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="ACD-2026-0012"
              autoCapitalize="characters" autoComplete="off" spellCheck="false" />
          </Field>
          <Field id="t-phone" label="Last 4 digits of your phone">
            <input id="t-phone" value={last4} inputMode="numeric" maxLength={4} placeholder="6565" autoComplete="off"
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          </Field>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Checking…' : 'Track order'}
        </button>
        {slow && <p className="note-warn">Waking up our server. This can take up to a minute the first time.</p>}
        {error && <p className="alert-inline" role="alert">{error}</p>}
      </form>

      {order && (
        <section className="track-result" aria-labelledby="track-title">
          <h2 id="track-title" className="num">{order.orderId}</h2>
          <p className="hint">Placed {formatDate(order.createdAt)} · Total {rupees(order.total)}</p>

          {order.status === 'cancelled' ? (
            <p className="alert-inline">This order was cancelled. Questions? Message us on WhatsApp.</p>
          ) : (
            <ol className="timeline">
              {flow.map((status, i) => {
                const state = i < current ? 'is-done' : i === current ? 'is-current' : ''
                const at = i <= current ? dateOf(status) : null
                return (
                  <li key={status} className={state} aria-current={i === current ? 'step' : undefined}>
                    <span className="timeline-dot" aria-hidden="true">{i < current || (i === current && status === 'delivered') ? <IconCheck size={14} /> : null}</span>
                    <span className="timeline-label">{labelFor(status, pickup)}</span>
                    {at && <span className="timeline-date">{formatDate(at, true)}</span>}
                  </li>
                )
              })}
            </ol>
          )}

          <p className="track-payment">
            Payment: {order.paymentStatus === 'paid' ? <strong>Paid</strong> : 'Not paid yet. We share payment details on WhatsApp.'}
          </p>
          <a className="btn btn-wa" href={wa('Hello Acadmify! I have a question about order ' + order.orderId + '.')} target="_blank" rel="noopener noreferrer">
            <IconWhatsApp size={18} /> Ask about this order
          </a>
        </section>
      )}
    </div>
  )
}
