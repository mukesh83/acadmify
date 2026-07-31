// ============================================================================
// src/components/Track.jsx
// Order tracking, now requiring the last 4 digits of the phone number.
//
// WHY: your order IDs run in sequence (ACD-2026-001, -002, -003...). Without
// a second check, anyone can walk the sequence and read other customers'
// names, phone numbers and addresses.
//
// Needs the backend change in backend/routes/orders-track-secure.js.
// ============================================================================

import { useState } from 'react'
import { C, STATUS_FLOW, STATUS_COLOURS } from '../constants'

const API = import.meta.env.VITE_API_URL || ''

const input = {
  width: '100%',
  padding: '11px 12px',
  fontSize: 16,
  fontFamily: 'inherit',
  border: '1px solid ' + C.gray3,
  borderRadius: 2,
  marginBottom: 16,
}

const label = {
  display: 'block',
  fontSize: 13,
  color: C.textMuted,
  marginBottom: 6,
}

export default function Track() {
  const [orderId, setOrderId] = useState('')
  const [phone4, setPhone4]   = useState('')
  const [order, setOrder]     = useState(null)
  const [error, setError]     = useState('')
  const [busy, setBusy]       = useState(false)

  async function lookup() {
    setError('')
    setOrder(null)

    if (!orderId.trim()) { setError('Enter your order number.'); return }
    if (phone4.length !== 4) {
      setError('Enter the last 4 digits of your phone number.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch(
        API + '/api/orders/' + encodeURIComponent(orderId.trim().toUpperCase()) +
        '?phone=' + encodeURIComponent(phone4)
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Order not found. Check both details and try again.')
      } else {
        setOrder(data)
      }
    } catch {
      setError('Could not reach the server. Please try again in a moment.')
    }
    setBusy(false)
  }

  const stageIndex = order ? STATUS_FLOW.indexOf(order.status) : -1

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px 80px' }}>
      <h1 style={{ color: C.maroon, fontSize: 30, margin: '0 0 8px' }}>
        Track your order
      </h1>
      <p style={{ color: C.textMuted, fontSize: 15, margin: '0 0 30px' }}>
        Enter your order number and the last 4 digits of the phone number you
        ordered with.
      </p>

      <label style={label} htmlFor="track-id">Order number</label>
      <input
        id="track-id"
        style={input}
        placeholder="ACD-2026-001"
        value={orderId}
        autoCapitalize="characters"
        onChange={(e) => setOrderId(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && lookup()}
      />

      <label style={label} htmlFor="track-phone">
        Last 4 digits of your phone number
      </label>
      <input
        id="track-phone"
        style={input}
        placeholder="6565"
        inputMode="numeric"
        maxLength={4}
        value={phone4}
        onChange={(e) => setPhone4(e.target.value.replace(/\D/g, '').slice(0, 4))}
        onKeyDown={(e) => e.key === 'Enter' && lookup()}
      />

      <button
        onClick={lookup}
        disabled={busy}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 16,
          fontFamily: 'inherit',
          background: C.maroon,
          color: C.white,
          border: 'none',
          borderRadius: 2,
          cursor: 'pointer',
          opacity: busy ? 0.65 : 1,
        }}
      >
        {busy ? 'Checking...' : 'Track Order'}
      </button>

      {error && (
        <p style={{
          background: '#FDF4F4',
          color: '#B02020',
          padding: '11px 14px',
          marginTop: 18,
          fontSize: 14,
        }}>
          {error}
        </p>
      )}

      {order && (
        <div style={{
          marginTop: 28,
          border: '1px solid ' + C.gray3,
          borderTop: '3px solid ' + (STATUS_COLOURS[order.status] || C.maroon),
          padding: '22px 22px 24px',
        }}>
          <div style={{ fontSize: 13, color: C.textMuted }}>Order</div>
          <div style={{ fontSize: 20, color: C.maroon, marginBottom: 20 }}>
            {order.order_id}
          </div>

          {STATUS_FLOW.map((stage, i) => {
            const done    = i <= stageIndex
            const current = i === stageIndex
            return (
              <div key={stage} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  flexShrink: 0,
                  background: done ? (STATUS_COLOURS[stage] || C.maroon) : C.gray2,
                  border: '1px solid ' + (done ? 'transparent' : C.gray3),
                }} />
                <span style={{
                  fontSize: 15,
                  textTransform: 'capitalize',
                  color: done ? C.textBody : C.textMuted,
                  fontWeight: current ? 600 : 400,
                }}>
                  {stage}
                </span>
              </div>
            )
          })}

          {order.total != null && (
            <div style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid ' + C.gray1,
              fontSize: 15,
              color: C.textBody,
            }}>
              Total: Rs. {order.total}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
