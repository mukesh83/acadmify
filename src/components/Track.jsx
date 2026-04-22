import { useState } from 'react'
import { C, STATUSES, STATUS_LABELS, STATUS_COLORS } from '../constants'
import { trackOrder } from '../utils/api.js'
import { inr }        from '../utils/pricing.js'
import { mono, serif, inputStyle, btn } from '../utils/styles'

export default function Track({ orders: localOrders }) {
  const [query,    setQuery]    = useState('')
  const [order,    setOrder]    = useState(null)
  const [searched, setSearched] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      // Try the live backend first
      const res = await trackOrder(query.trim())
      if (res.success && res.data) {
        setOrder(normaliseBackendOrder(res.data))
      } else {
        setOrder(null)
      }
    } catch {
      // Fallback: check local in-memory orders (demo mode / backend offline)
      const local = localOrders?.find(o => o.id.toUpperCase() === query.trim().toUpperCase())
      if (local) {
        setOrder(normaliseLocalOrder(local))
      } else {
        setOrder(null)
        setError(null)
      }
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  // Normalise backend response shape to match UI expectations
  function normaliseBackendOrder(d) {
    return {
      id:          d.id,
      thesis:      d.thesis_title,
      customer:    d.customers?.name || '—',
      phone:       d.customers?.phone,
      pages:       d.total_pages,
      amount:      d.total_amount,
      status:      d.status,
      date:        d.created_at?.slice(0, 10),
      history:     d.history || [],
    }
  }

  function normaliseLocalOrder(o) {
    return {
      id:       o.id,
      thesis:   o.thesis,
      customer: o.customer,
      phone:    o.phone,
      pages:    o.pages,
      amount:   o.amount,
      status:   o.status,
      date:     o.date,
      history:  [],
    }
  }

  const statusIndex = order ? STATUSES.indexOf(order.status) : -1

  return (
    <div style={{ minHeight: '100vh', background: C.dark, padding: '3.5rem 1rem' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <h1 style={{ ...serif, fontSize: '2.2rem', color: C.cream, textAlign: 'center', marginBottom: '0.5rem' }}>
          Track Your Order
        </h1>
        <p style={{ ...serif, color: C.muted, textAlign: 'center', marginBottom: '2rem' }}>
          Enter your order ID for live status
        </p>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="e.g. ACD-2025-0001"
            style={{ ...inputStyle, flex: 1, ...mono }}
          />
          <button onClick={search} disabled={loading} style={btn(loading ? 'rgba(201,168,76,0.4)' : C.gold)}>
            {loading ? '…' : 'Track'}
          </button>
        </div>

        {/* Not found */}
        {searched && !loading && !order && (
          <div style={{ textAlign: 'center', padding: '2.5rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: '0.75rem' }}>🔍</div>
            <p style={{ ...serif, color: C.muted }}>Order not found. Please check the ID and try again.</p>
          </div>
        )}

        {/* Found */}
        {order && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.75rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ ...mono, fontSize: '0.78rem', color: C.gold }}>{order.id}</div>
                <div style={{ ...serif, fontSize: '1.2rem', color: C.cream, marginTop: 4 }}>{order.thesis}</div>
                <div style={{ ...serif, fontSize: '0.85rem', color: C.muted }}>
                  {order.customer} · {order.date}
                </div>
              </div>
              <div style={{ ...mono, fontSize: '1.1rem', color: C.gold }}>{inr(order.amount)}</div>
            </div>

            {/* Status timeline */}
            {STATUSES.map((status, i) => (
              <div key={status} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start', paddingBottom: i < STATUSES.length - 1 ? '0.9rem' : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 22 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: i <= statusIndex ? STATUS_COLORS[status] : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    ...mono, fontSize: '0.65rem',
                    color: i <= statusIndex ? '#0F0507' : C.muted,
                    flexShrink: 0,
                  }}>
                    {i < statusIndex ? '✓' : i === statusIndex ? '●' : '○'}
                  </div>
                  {i < STATUSES.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 16, background: i < statusIndex ? STATUS_COLORS[status] : 'rgba(255,255,255,0.08)', marginTop: 3 }} />
                  )}
                </div>
                <div style={{ paddingBottom: '0.25rem' }}>
                  <div style={{ ...serif, fontSize: '0.95rem', color: i <= statusIndex ? C.cream : C.muted }}>
                    {STATUS_LABELS[status]}
                  </div>
                  {/* Show timestamp from history if available */}
                  {order.history?.find(h => h.new_status === status) && (
                    <div style={{ ...mono, fontSize: '0.6rem', color: C.muted, marginTop: 2 }}>
                      {new Date(order.history.find(h => h.new_status === status).changed_at).toLocaleString('en-IN')}
                    </div>
                  )}
                  {i === statusIndex && (
                    <div style={{ ...mono, fontSize: '0.62rem', color: STATUS_COLORS[status], marginTop: 2 }}>
                      CURRENT STATUS
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div style={{ marginTop: '1.25rem', background: 'rgba(201,168,76,0.05)', borderRadius: 6, padding: '0.7rem 1rem', ...mono, fontSize: '0.68rem', color: C.muted }}>
              📞 Queries? WhatsApp us with order ID: {order.id}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
