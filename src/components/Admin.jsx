import { useState, useEffect, useCallback } from 'react'
import {
  fetchAdminStats, fetchAllOrders, updateOrderStatus,
  fetchPricingAdmin, updatePricing, getDownloadUrls,
} from '../utils/api.js'
import { C, STATUSES, STATUS_LABELS, STATUS_COLORS } from '../constants'
import { inr } from '../utils/pricing.js'
import { mono, serif, inputStyle, btn } from '../utils/styles'

export default function Admin({ adminSecret, onLogout, setPage }) {
  const [tab,      setTab]      = useState('orders')
  const [orders,   setOrders]   = useState([])
  const [stats,    setStats]    = useState(null)
  const [pricing,  setPricing]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [saving,   setSaving]   = useState(false)
  const [saveMsg,  setSaveMsg]  = useState(null)

  const secret = adminSecret

  // ── Load stats + orders ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetchAdminStats(secret),
        fetchAllOrders(secret, { status: filter }),
      ])
      setStats(statsRes.data)
      setOrders(ordersRes.data || [])
    } catch (err) {
      console.error('Admin load error:', err)
    } finally {
      setLoading(false)
    }
  }, [secret, filter])

  useEffect(() => { loadData() }, [loadData])

  // ── Load pricing when tab switches ────────────────────────────────────────
  useEffect(() => {
    if (tab !== 'pricing' || pricing) return
    fetchPricingAdmin(secret).then(r => setPricing(r.data)).catch(console.error)
  }, [tab, secret, pricing])

  // ── Update a single order status ─────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(secret, orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      alert(`Failed to update status: ${err.message}`)
    }
  }

  // ── Save pricing ──────────────────────────────────────────────────────────
  const handleSavePricing = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      await updatePricing(secret, pricing)
      setSaveMsg('Pricing saved ✓')
      setTimeout(() => setSaveMsg(null), 3000)
    } catch (err) {
      setSaveMsg(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // ── Download thesis PDF ───────────────────────────────────────────────────
  const handleDownload = async (orderId) => {
    try {
      const res = await getDownloadUrls(secret, orderId)
      if (res.data.thesisUrl) window.open(res.data.thesisUrl, '_blank')
    } catch (err) {
      alert(`Download failed: ${err.message}`)
    }
  }

  // ── Filter + search (client-side) ─────────────────────────────────────────
  const visible = orders.filter(o =>
    !search ||
    (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.thesis_title || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: C.dark }}>

      {/* Header */}
      <div style={{ background: C.dark2, borderBottom: `1px solid ${C.border}`, padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ ...serif, fontSize: '1.3rem', color: C.cream }}>Admin Panel</div>
          <div style={{ ...mono, fontSize: '0.6rem', color: C.muted }}>ACADMIFY OPERATIONS</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={loadData} style={{ ...btn('transparent', C.muted), border: `1px solid rgba(255,255,255,0.1)`, fontSize: '0.75rem', padding: '5px 12px' }}>
            ↻ Refresh
          </button>
          <button onClick={() => setPage('home')} style={{ ...btn('transparent', C.muted), border: `1px solid rgba(255,255,255,0.1)`, fontSize: '0.78rem', padding: '5px 14px' }}>
            ← Public Site
          </button>
          <button onClick={onLogout} style={{ ...btn('transparent', '#E74C3C'), border: '1px solid rgba(231,76,60,0.3)', fontSize: '0.78rem', padding: '5px 14px' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '1.75rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem', marginBottom: '1.75rem' }}>
          {[
            ['Total Orders',    stats?.totalOrders  ?? '…'],
            ["Today's Orders",  stats?.todayOrders  ?? '…'],
            ['Revenue',         stats ? inr(stats.totalRevenue) : '…'],
            ['Pending',         stats?.pending       ?? '…'],
          ].map(([label, value]) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem' }}>
              <div style={{ ...mono, fontSize: '0.62rem', color: C.muted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              <div style={{ ...mono, fontSize: '1.6rem', color: C.gold }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginBottom: '1.25rem' }}>
          {[['orders', 'Orders'], ['pricing', 'Pricing']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px', background: 'transparent', border: 'none',
              borderBottom: tab === t ? `2px solid ${C.gold}` : '2px solid transparent',
              color: tab === t ? C.gold : C.muted,
              ...mono, fontSize: '0.75rem', cursor: 'pointer', marginBottom: -1,
            }}>{l}</button>
          ))}
        </div>

        {/* ── Orders Tab ───────────────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID, thesis…"
                style={{ ...inputStyle, flex: 1, minWidth: 200, ...mono, fontSize: '0.85rem' }} />
              <select value={filter} onChange={e => { setFilter(e.target.value); setOrders([]) }}
                style={{ ...inputStyle, width: 'auto', cursor: 'pointer', ...mono, fontSize: '0.78rem' }}>
                <option value="all">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', ...mono, fontSize: '0.75rem', color: C.muted }}>Loading orders…</div>
            ) : (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflowX: 'auto' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 70px 90px 145px 130px 50px', padding: '8px 12px', background: 'rgba(201,168,76,0.06)', ...mono, fontSize: '0.6rem', color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', minWidth: 700 }}>
                  {['Order ID', 'Customer / Thesis', 'Pages', 'Amount', 'Status', 'Update', 'PDF'].map(h => <div key={h}>{h}</div>)}
                </div>

                {visible.map((o, i) => (
                  <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 70px 90px 145px 130px 50px', padding: '10px 12px', borderTop: `1px solid rgba(201,168,76,0.07)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', alignItems: 'center', minWidth: 700 }}>
                    <div style={{ ...mono, fontSize: '0.72rem', color: C.gold }}>{o.id}</div>
                    <div>
                      <div style={{ ...serif, fontSize: '0.9rem', color: C.cream }}>{o.customer_name || o.customer}</div>
                      <div style={{ ...serif, fontSize: '0.75rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                        {o.thesis_title || o.thesis}
                      </div>
                    </div>
                    <div style={{ ...mono, fontSize: '0.75rem', color: C.muted }}>{o.total_pages || o.pages}</div>
                    <div style={{ ...mono, fontSize: '0.8rem', color: C.cream }}>{inr(o.total_amount || o.amount)}</div>
                    <span style={{ background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status], padding: '3px 7px', borderRadius: 4, ...mono, fontSize: '0.6rem', border: `1px solid ${STATUS_COLORS[o.status]}40`, display: 'inline-block' }}>
                      {STATUS_LABELS[o.status]}
                    </span>
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                      style={{ ...inputStyle, padding: '4px 7px', width: '100%', ...mono, fontSize: '0.68rem', cursor: 'pointer' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <button onClick={() => handleDownload(o.id)}
                      title="Download thesis PDF"
                      style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 6px', color: C.gold, cursor: 'pointer', ...mono, fontSize: '0.7rem' }}>
                      ↓
                    </button>
                  </div>
                ))}

                {visible.length === 0 && !loading && (
                  <div style={{ padding: '2rem', textAlign: 'center', ...serif, color: C.muted }}>No orders found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Pricing Tab ──────────────────────────────────────────────────── */}
        {tab === 'pricing' && (
          <div style={{ maxWidth: 460 }}>
            <h3 style={{ ...serif, fontSize: '1.4rem', color: C.cream, marginBottom: '1.25rem' }}>Pricing Configuration</h3>
            {!pricing ? (
              <div style={{ ...mono, fontSize: '0.75rem', color: C.muted }}>Loading pricing…</div>
            ) : (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1.25rem' }}>
                {[
                  ['bw_per_page',          'B&W per page (₹)'],
                  ['color_per_page',        'Color per page (₹)'],
                  ['hard_binding',          'Hard Binding (₹)'],
                  ['soft_binding',          'Soft Binding (₹)'],
                  ['spiral_binding',        'Spiral Binding (₹)'],
                  ['delivery_charge',       'Delivery Charge (₹)'],
                  ['free_delivery_above',   'Free delivery above (₹)'],
                  ['gst_rate',              'GST Rate (%)'],
                ].map(([k, label]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: `1px solid rgba(201,168,76,0.07)` }}>
                    <label style={{ ...serif, fontSize: '0.95rem', color: C.cream }}>{label}</label>
                    <input type="number" value={pricing[k] ?? ''} onChange={e => setPricing(p => ({ ...p, [k]: parseFloat(e.target.value) || 0 }))}
                      style={{ ...inputStyle, width: 85, textAlign: 'right', ...mono, color: C.gold, padding: '5px 9px' }} />
                  </div>
                ))}

                {saveMsg && (
                  <div style={{ marginTop: '0.75rem', ...mono, fontSize: '0.68rem', color: saveMsg.startsWith('Error') ? '#E74C3C' : '#2ECC71' }}>
                    {saveMsg}
                  </div>
                )}

                <button onClick={handleSavePricing} disabled={saving}
                  style={{ ...btn(saving ? 'rgba(201,168,76,0.4)' : C.gold), width: '100%', marginTop: '1rem' }}>
                  {saving ? 'Saving…' : 'Save Pricing →'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
