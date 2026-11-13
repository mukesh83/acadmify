// "Pay online" button (Razorpay Standard Checkout). Online payment is required
// for every order. `auth` proves the order is yours: { clientToken } right after
// ordering, or { phone } (last 4 digits) from the Track page.
import { useEffect, useState } from 'react'
import { getConfig, createPayment, verifyPayment } from '../lib/api.js'
import { rupees } from '../lib/format.js'
import { trackEvent } from '../lib/analytics.js'

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function PayOnline({ orderId, auth, total, customer = {}, onPaid, fallback = null }) {
  const [enabled, setEnabled] = useState(null) // null = still asking the server
  const [busy, setBusy] = useState(false)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    getConfig()
      .then((cfg) => alive && setEnabled(Boolean(cfg && cfg.paymentsEnabled)))
      .catch(() => alive && setEnabled(false))
    return () => {
      alive = false
    }
  }, [])

  function succeeded() {
    setPaid(true)
    if (onPaid) onPaid()
  }

  if (paid) return <p className="note-ok" role="status">Payment received. Thank you! Your order is confirmed and we will start on it.</p>
  if (enabled === false) return fallback

  async function pay() {
    setError('')
    setBusy(true)
    try {
      if (!(await loadCheckout())) throw new Error('Could not load the payment window. Please check your internet connection and try again.')
      let o
      try {
        o = await createPayment({ orderId, ...auth })
      } catch (err) {
        if (err.status === 409 && /already paid/i.test(err.message)) return succeeded()
        throw err
      }
      const rzp = new window.Razorpay({
        key: o.keyId,
        order_id: o.razorpayOrderId,
        amount: o.amount,
        currency: o.currency,
        name: 'Acadmify',
        description: 'Thesis order ' + orderId,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        notes: { acadmify_order_id: orderId },
        theme: { color: '#7b1f1f' },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (r) => {
          try {
            await verifyPayment({
              razorpay_order_id: r.razorpay_order_id,
              razorpay_payment_id: r.razorpay_payment_id,
              razorpay_signature: r.razorpay_signature,
            })
            trackEvent('purchase', { value: total, currency: 'INR', transaction_id: orderId })
            succeeded()
          } catch {
            setError(
              'We could not confirm your payment yet. If money was deducted, please do not pay again: message us on WhatsApp with order ' +
                orderId + ' and we will check it.'
            )
          } finally {
            setBusy(false)
          }
        },
      })
      rzp.on('payment.failed', (resp) => {
        setError(((resp && resp.error && resp.error.description) || 'The payment did not go through.') + ' You can try again.')
        setBusy(false)
      })
      rzp.open()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className="btn btn-primary btn-lg btn-block" onClick={pay} disabled={busy || enabled === null}>
        {enabled === null ? 'Preparing secure payment…' : busy ? 'Opening payment…' : 'Pay ' + rupees(total) + ' now'}
      </button>
      <p className="hint center">Secure payment by Razorpay: UPI, cards, net banking or wallets.</p>
      {error && <p className="alert-inline" role="alert">{error}</p>}
    </>
  )
}
