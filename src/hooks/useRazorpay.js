/**
 * useRazorpay — handles the full Razorpay checkout lifecycle.
 *
 * Usage:
 *   const { openCheckout, loading, error } = useRazorpay()
 *   await openCheckout({ orderId, customerName, customerPhone, onSuccess, onFailure })
 *
 * Dynamically loads the Razorpay JS SDK from their CDN (only once).
 */

import { useState, useCallback } from 'react'
import { createPaymentOrder, verifyPayment } from '../utils/api.js'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script    = document.createElement('script')
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload   = () => resolve(true)
    script.onerror  = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const openCheckout = useCallback(async ({
    orderId,          // Acadmify order ID e.g. ACD-2025-0001
    customerName,
    customerPhone,
    customerEmail = '',
    thesisTitle   = '',
    onSuccess,        // ({ orderId, paymentId }) => void
    onFailure,        // (reason) => void
  }) => {
    setLoading(true)
    setError(null)

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load Razorpay SDK. Check your internet connection.')

      // 2. Create Razorpay order via our backend
      const { data: rzpData } = await createPaymentOrder(orderId)

      // 3. Open Razorpay checkout modal
      await new Promise((resolve, reject) => {
        const options = {
          key:         rzpData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:      rzpData.amount,          // paise
          currency:    rzpData.currency || 'INR',
          name:        'Acadmify',
          description: thesisTitle || 'Thesis Printing & Binding',
          image:       '/favicon.svg',
          order_id:    rzpData.razorpayOrderId,

          // Prefill customer info
          prefill: {
            name:    customerName,
            contact: customerPhone,
            email:   customerEmail,
          },

          // Acadmify brand colors
          theme: { color: '#7B2437' },

          // ── Success handler ──────────────────────────────────────────────
          handler: async (response) => {
            try {
              // 4. Verify signature on our backend
              await verifyPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                acadmify_order_id:   orderId,
              })
              onSuccess?.({ orderId, paymentId: response.razorpay_payment_id })
              resolve()
            } catch (verifyErr) {
              reject(new Error(`Payment verification failed: ${verifyErr.message}`))
            }
          },

          // ── Modal closed / failed ────────────────────────────────────────
          modal: {
            ondismiss: () => {
              onFailure?.('Payment window closed')
              resolve()   // resolve (not reject) — user cancelled, not an error
            },
          },
        }

        const rzp = new window.Razorpay(options)

        rzp.on('payment.failed', (response) => {
          const reason = response.error?.description || 'Payment failed'
          onFailure?.(reason)
          reject(new Error(reason))
        })

        rzp.open()
      })
    } catch (err) {
      setError(err.message)
      onFailure?.(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { openCheckout, loading, error }
}
