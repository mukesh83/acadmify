import { useState, useEffect, useCallback } from 'react'
import {
  fetchAdminStats, fetchAllOrders, updateOrderStatus,
  fetchPricingAdmin, updatePricing, getDownloadUrls,
} from '../utils/api.js'
import { C, STATUSES, STATUS_LABELS, STATUS_COLORS } from '../constants'
import { inr } from '../utils/pricing.js'
import { mono, serif, inputStyle, btn } from '../utils/styles'
import ContentEditor  from './ContentEditor.jsx'
import GalleryManager from './GalleryManager.jsx'

const DEFAULT_PRICING = {
  bw_per_page:2, color_per_page:10, hard_binding:350,
  soft_binding:150, spiral_binding:100, delivery_charge:50,
  free_delivery_above:500, gst_rate:18,
}

export default function Admin({ adminSecret, onLogout, setPage }) {
  const [tab,     setTab]     = useState('orders')
  const [orders,  setOrders]  = useState([])
  const [stats,   setStats]   = useState(null)
  const [pricing, setPricing] = useState(DEFAULT_PRICING)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [saving,  setSaving]  = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetchAdminStats(adminSecret),
        fetchAllOrders(adminSecret, { status: filter }),
      ])
      setStats(statsRes.data)
      setOrders(ordersRes.data || [])
    } catch (err) { console.error('Admin load error:', err) }
    finally { setLoading(false) }
  }, [adminSecret, filter])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (tab !== 'pricing') return
    fetchPricingAdmin(adminSecret)
      .then(r => setPricing(r.data || DEFAULT_PRICING))
      .catch(() => setPricing(DEFAULT_PRICING))
  }, [tab, adminSecret])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(adminSecret, orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) { alert(`Failed: ${err.message}`) }
  }

  const handleSavePricing = async () => {
    setSaving(true); setSaveMsg(null)
    try { await updatePricing(adminSecret, pricing); setSaveMsg('Pricing saved ✓') }
    catch (err) { setSaveMsg(`Error: ${err.message}`) }
    finally { setSaving(false); setTimeout(() => setSaveMsg(null), 3000) }
  }

  const handleDownload = async (orderId) => {
    try {
      const res = await getDownloadUrls(adminSecret, orderId)
      if (res.data?.thesisUrl) window.open(res.data.thesisUrl, '_blank')
    } catch (err) { alert(`Download failed: ${err.message}`) }
  }

  const visible = orders.filter(o =>
    !search ||
    (o.customer_name || o.customer || '').toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.thesis_title || o.thesis || '').toLowerCase().includes(search.toLowerCase())
  )

  const TABS = [
    { id: 'orders',  label: 'Orders'         },
    { id: 'content', label: 'Edit Website ✎' },
    { id: 'gallery', label: 'Gallery 🖼'      },
    { id: 'pricing', label: 'Pricing'         },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.gray1 }}>
      <div style={{ background: C.maroon, padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily:"'EB Garamond',serif", fontSize: '1.3rem', color: '#fff', fontWeight: 600 }}>Admin Panel</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize: '0.58rem', color: 'rgba(198,154,74,0.85)', letterSpacing: '0.15em' }}>ACADMIFY OPERATIONS</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[['↻ Refresh', loadData, 'rgba(255,255,255,0.12)', '#fff'], ['← Public Site', () => setPage('home'), 'transparent', 'rgba(255,255,255,0.8)'], ['Logout', onLogout, 'transparent', 'rgba(255,180,180,0.9)']].map(([label, fn, bg, col]) => (
            <button key={label} onClick={fn} style={{ background: bg, color: col, border: '1px solid rgba(255,255,255,0.2)', padding: '5px 14px', fontFamily:"'EB Garamond',serif", fontSize: '0.78rem', borderRadius: 4, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '1.75rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {[['Total Orders', stats?.totalOrders ?? '…'], ["Today's", stats?.todayOrders ?? '…'], ['Revenue', stats ? inr(stats.totalRevenue) : '…'], ['Pending', stats?.pending ?? '…']].map(([label, value]) => (
            <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.maroon}`, borderRadius: '0 0 4px 4px', padding: '1.1rem' }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize: '0.6rem', color: C.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              <div style={{ fontFamily:"'EB Garamond',serif", fontSize: '1.7rem', fontWeight: 600, color: C.maroon }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', borderBottom: `2px solid ${C.border}`, marginBottom: '1.5rem' }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '10px 22px', background: 'transparent', border: 'none', borderBottom: tab === id ? `2px solid ${C.maroon}` : '2px solid transparent', color: tab === id ? C.maroon : C.textMuted, fontFamily:"'DM Mono',monospace", fontSize: '0.75rem', cursor: 'pointer', marginBottom: -2, fontWeight: tab === id ? 600 : 400 }}>{label}</button>
          ))}
        </div>

        {tab === 'orders' && (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
              <select value={filter} onChange={e => { setFilter(e.target.value); setOrders([]) }} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
                <option value="all">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            {loading ? <div style={{ textAlign:'center', padding:'3rem', fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:C.textMuted }}>Loading orders…</div> : (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, overflowX: 'auto' }}>
                <div style={{ display:'grid', gridTemplateColumns:'140px 1fr 70px 90px 155px 135px 50px', padding:'9px 14px', background:C.gray1, fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', minWidth:760, borderBottom:`2px solid ${C.maroon}` }}>
                  {['Order ID','Customer / Thesis','Pages','Amount','Status','Update','PDF'].map(h => <div key={h}>{h}</div>)}
                </div>
                {visible.map((o, i) => (
                  <div key={o.id} style={{ display:'grid', gridTemplateColumns:'140px 1fr 70px 90px 155px 135px 50px', padding:'11px 14px', borderBottom:`1px solid ${C.border}`, background:i%2===0?C.white:C.gray1, alignItems:'center', minWidth:760 }}>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:C.maroon, fontWeight:500 }}>{o.id}</div>
                    <div>
                      <div style={{ fontFamily:"'EB Garamond',serif", fontSize:'0.95rem', color:C.maroon, fontWeight:600 }}>{o.customer_name || o.customer}</div>
                      <div style={{ fontFamily:"'EB Garamond',serif", fontSize:'0.78rem', color:C.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>{o.thesis_title || o.thesis}</div>
                    </div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:C.textMuted }}>{o.total_pages || o.pages}</div>
                    <div style={{ fontFamily:"'EB Garamond',serif", fontSize:'0.9rem', color:C.maroon, fontWeight:600 }}>{inr(o.total_amount || o.amount)}</div>
                    <span style={{ background:`${STATUS_COLORS[o.status]}15`, color:STATUS_COLORS[o.status], padding:'3px 8px', borderRadius:3, fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', border:`1px solid ${STATUS_COLORS[o.status]}40`, display:'inline-block', fontWeight:500 }}>{STATUS_LABELS[o.status]}</span>
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)} style={{ ...inputStyle, padding:'5px 8px', width:'100%', fontSize:'0.72rem', cursor:'pointer' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <button onClick={() => handleDownload(o.id)} style={{ background:'transparent', border:`1px solid ${C.border}`, borderRadius:3, padding:'4px 6px', color:C.maroon, cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:'0.75rem' }}>↓</button>
                  </div>
                ))}
                {visible.length === 0 && !loading && <div style={{ padding:'2rem', textAlign:'center', fontFamily:"'EB Garamond',serif", color:C.textMuted }}>No orders found</div>}
              </div>
            )}
          </div>
        )}

        {tab === 'content' && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: '2rem' }}>
            <ContentEditor adminSecret={adminSecret} />
          </div>
        )}

        {tab === 'gallery' && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: '2rem' }}>
            <h2 style={{ fontFamily:"'EB Garamond',serif", fontSize:'1.6rem', fontWeight:600, color:C.maroon, marginBottom:'0.25rem' }}>Gallery Manager</h2>
            <p style={{ fontFamily:"'EB Garamond',serif", fontSize:'0.95rem', color:C.textMuted, marginBottom:'1.75rem' }}>Add, remove and manage photos shown in the University Gallery section on your website.</p>
            <GalleryManager />
          </div>
        )}

        {tab === 'pricing' && (
          <div style={{ maxWidth: 460 }}>
            <h3 style={{ fontFamily:"'EB Garamond',serif", fontSize:'1.4rem', fontWeight:600, color:C.maroon, marginBottom:'1.25rem' }}>Pricing Configuration</h3>
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:'1.25rem' }}>
              {[['bw_per_page','B&W per page (₹)'],['color_per_page','Colour per page (₹)'],['hard_binding','Hardbound (₹)'],['soft_binding','Softbound (₹)'],['spiral_binding','Spiral (₹)'],['delivery_charge','Delivery (₹)'],['free_delivery_above','Free delivery above (₹)'],['gst_rate','GST Rate (%)']].map(([k, label]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.65rem 0', borderBottom:`1px solid ${C.border}` }}>
                  <label style={{ fontFamily:"'EB Garamond',serif", fontSize:'0.97rem', color:C.maroon }}>{label}</label>
                  <input type="number" value={pricing[k] ?? ''} onChange={e => setPricing(p => ({ ...p, [k]: parseFloat(e.target.value)||0 }))} style={{ ...inputStyle, width:90, textAlign:'right', padding:'5px 9px' }} />
                </div>
              ))}
              {saveMsg && <div style={{ marginTop:'0.75rem', fontFamily:"'DM Mono',monospace", fontSize:'0.68rem', color:saveMsg.startsWith('Error')?'#C0392B':'#1E6B3A' }}>{saveMsg}</div>}
              <button onClick={handleSavePricing} disabled={saving} style={{ ...btn('primary'), width:'100%', marginTop:'1rem', opacity:saving?0.6:1 }}>{saving?'Saving…':'Save Pricing →'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
