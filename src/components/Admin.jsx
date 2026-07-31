// ============================================================================
// src/components/Admin.jsx
// Admin panel: Orders / Edit Website / Gallery.
//
// Orders are now read straight from Supabase by the logged-in admin, using
// the policies in sql/005. No shared password, no backend admin routes.
// ============================================================================

import { useEffect, useState } from 'react'
import { supabase, signOut } from '../lib/supabase'
import { C, STATUS_FLOW, STATUS_COLOURS } from '../constants'
import ContentEditor from './ContentEditor'
import GalleryManager from './GalleryManager'

const TABS = [
  { id: 'orders',  label: 'Orders' },
  { id: 'content', label: 'Edit Website' },
  { id: 'gallery', label: 'Gallery' },
]

export default function Admin({ onSignOut }) {
  const [tab, setTab] = useState('orders')

  async function handleSignOut() {
    await signOut()
    if (typeof onSignOut === 'function') onSignOut()
    else window.location.reload()
  }

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', padding: '28px 18px 60px' }}>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 22,
      }}>
        <h1 style={{ color: C.maroon, margin: 0, fontSize: 26 }}>
          Acadmify Admin
        </h1>
        <button
          onClick={handleSignOut}
          style={{
            fontSize: 14,
            fontFamily: 'inherit',
            padding: '8px 16px',
            background: 'none',
            border: '1px solid ' + C.gray3,
            borderRadius: 2,
            color: C.textMuted,
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid ' + C.gray3,
        marginBottom: 26,
        flexWrap: 'wrap',
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 18px',
              fontSize: 15,
              fontFamily: 'inherit',
              background: 'none',
              border: 'none',
              borderBottom: '2px solid ' + (tab === t.id ? C.maroon : 'transparent'),
              color: tab === t.id ? C.maroon : C.textMuted,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders'  && <OrdersTab />}
      {tab === 'content' && <ContentEditor />}
      {tab === 'gallery' && <GalleryManager />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ORDERS
// ---------------------------------------------------------------------------
function OrdersTab() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [filter, setFilter]   = useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300)

    if (error) setError(error.message)
    else { setOrders(data || []); setError(null) }
    setLoading(false)
  }

  async function updateStatus(order, status) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order.id)

    if (error) { alert('Could not update: ' + error.message); return }
    setOrders((list) =>
      list.map((o) => (o.id === order.id ? { ...o, status } : o))
    )
  }

  // Creates a link that works for 60 seconds, then expires.
  async function downloadThesis(order) {
    const path = order.thesis_path || order.pdf_path || order.file_path
    if (!path) { alert('No file recorded for this order.'); return }

    const { data, error } = await supabase
      .storage
      .from('thesis-pdfs')
      .createSignedUrl(path, 60)

    if (error) { alert('Could not open file: ' + error.message); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  if (loading) return <p style={{ color: C.textMuted }}>Loading orders...</p>

  if (error) {
    return (
      <div style={{ background: '#FDF4F4', padding: '16px 18px', fontSize: 14 }}>
        <b style={{ color: '#B02020' }}>Could not load orders.</b>
        <p style={{ margin: '8px 0 0', color: C.textBody }}>{error}</p>
        <p style={{ margin: '8px 0 0', color: C.textMuted }}>
          If this mentions a policy or permission, run sql/005_security_lockdown.sql,
          then sign out and sign in again.
        </p>
      </div>
    )
  }

  const shown = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter)

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {['all', ...STATUS_FLOW].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              fontSize: 13,
              fontFamily: 'inherit',
              padding: '6px 13px',
              borderRadius: 2,
              cursor: 'pointer',
              border: '1px solid ' + (filter === s ? C.maroon : C.gray3),
              background: filter === s ? C.maroon : C.white,
              color: filter === s ? C.white : C.textMuted,
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
        <button
          onClick={load}
          style={{
            fontSize: 13, fontFamily: 'inherit', padding: '6px 13px',
            marginLeft: 'auto', border: '1px solid ' + C.gray3,
            background: C.white, color: C.textMuted,
            borderRadius: 2, cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      {shown.length === 0 ? (
        <p style={{ color: C.textMuted }}>No orders here yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {shown.map((o) => (
            <div key={o.id} style={{
              border: '1px solid ' + C.gray3,
              borderLeft: '3px solid ' + (STATUS_COLOURS[o.status] || C.maroon),
              background: C.white,
              padding: '15px 17px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14,
              alignItems: 'start',
            }}>
              <div>
                <div style={{ fontWeight: 600, color: C.maroon, fontSize: 15 }}>
                  {o.order_id || o.id}
                </div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>
                  {o.created_at ? new Date(o.created_at).toLocaleString('en-IN') : ''}
                </div>
              </div>

              <div style={{ fontSize: 14, color: C.textBody }}>
                <div>{o.name || o.customer_name}</div>
                <div style={{ color: C.textMuted, fontSize: 13 }}>{o.phone}</div>
              </div>

              <div style={{ fontSize: 14, color: C.textBody }}>
                <div>{o.copies || 1} copy/copies</div>
                <div style={{ color: C.textMuted, fontSize: 13 }}>
                  {o.total ? 'Rs. ' + o.total : ''}
                </div>
              </div>

              <div>
                <select
                  value={o.status || 'received'}
                  onChange={(e) => updateStatus(o, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 9px',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    border: '1px solid ' + C.gray3,
                    borderRadius: 2,
                    textTransform: 'capitalize',
                  }}
                >
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => downloadThesis(o)}
                  style={{
                    marginTop: 7, width: '100%',
                    fontSize: 13, fontFamily: 'inherit',
                    padding: '7px 10px',
                    background: 'none',
                    border: '1px solid ' + C.gray3,
                    borderRadius: 2,
                    color: C.maroon,
                    cursor: 'pointer',
                  }}
                >
                  Open thesis PDF
                </button>
              </div>

              {o.address && (
                <div style={{
                  gridColumn: '1 / -1',
                  fontSize: 13,
                  color: C.textMuted,
                  borderTop: '1px solid ' + C.gray1,
                  paddingTop: 9,
                }}>
                  {o.address}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
