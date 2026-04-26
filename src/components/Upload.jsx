import { useState } from 'react'
import { C } from '../constants'
import { mono, serif, inputStyle, labelStyle, btn, cardStyle } from '../utils/styles'
import { getQuote, placeOrder } from '../utils/api.js'
import { useRazorpay } from '../hooks/useRazorpay.js'

// ── Pricing Rules ─────────────────────────────────────────────────────────────
function calcTotal({ totalPages, colorPages, copies, ohp }) {
  const bwPages   = Math.max(0, totalPages - colorPages)
  const bwCost    = bwPages * 2

  // Color: ₹6 if colorPages > 10 AND copies > 2, else ₹10
  const colorRate = (colorPages > 10 && copies > 2) ? 6 : 10
  const colorCost = colorPages * colorRate

  const ohpCost     = ohp * 5
  const bindingCost = 250  // hardbound only

  const subtotal  = (bwCost + colorCost + ohpCost + bindingCost) * copies
  const delivery  = subtotal >= 500 ? 0 : 50
  const gst       = Math.round(subtotal * 0.18)
  const total     = subtotal + delivery + gst

  return { bwPages, bwCost: bwCost * copies, colorCost: colorCost * copies, colorRate, ohpCost: ohpCost * copies, bindingCost: bindingCost * copies, subtotal, delivery, gst, total }
}

const COVERS = [
  { id: 'maroon',  label: 'Maroon',     hex: '#7A1E1E' },
  { id: 'navy',    label: 'Navy',       hex: '#1B3A5C' },
  { id: 'black',   label: 'Black',      hex: '#2A2020' },
  { id: 'green',   label: 'Forest',     hex: '#1E4D2B' },
  { id: 'brown',   label: 'Brown',      hex: '#5C3010' },
  { id: 'royal',   label: 'Royal Blue', hex: '#2337A0' },
  { id: 'pink',    label: 'Pink',       hex: '#C2185B' },
  { id: 'orange',  label: 'Orange',     hex: '#E65100' },
  { id: 'purple',  label: 'Purple',     hex: '#6A1B9A' },
  { id: 'teal',    label: 'Teal',       hex: '#00695C' },
  { id: 'grey',    label: 'Grey',       hex: '#455A64' },
  { id: 'wine',    label: 'Wine',       hex: '#880E4F' },
]

const DEGREES = ['PhD', 'MTech', 'MBA', 'MPhil', 'MSc', 'MA', 'BTech', 'BCA', 'Other']

const emptyForm = () => ({
  name: '', phone: '', email: '', university: '',
  degree: 'PhD', thesisFile: null, coverFile: null,
  totalPages: '', colorPages: '0', bwPages: '0',
  copies: 1, ohp: 0, cover: 'maroon', address: '',
})

export default function Upload({ setPage, addOrder }) {
  const [step,     setStep]     = useState(1) // 1=Details, 2=Configure, 3=Confirm
  const [f,        setF]        = useState(emptyForm())
  const [quote,    setQuote]    = useState(null)
  const [orderId,  setOrderId]  = useState(null)
  const [busy,     setBusy]     = useState(false)
  const [apiError, setApiError] = useState(null)
  const [done,     setDone]     = useState(false)
  const [payState, setPayState] = useState('idle')
  const [payError, setPayError] = useState(null)

  const { openCheckout, loading: rzpLoading } = useRazorpay()

  const u = (k, v) => {
    setF(p => {
      const next = { ...p, [k]: v }
      // Auto-calculate B&W pages
      if (k === 'totalPages' || k === 'colorPages') {
        const tp = parseInt(k === 'totalPages' ? v : p.totalPages) || 0
        const cp = parseInt(k === 'colorPages'  ? v : p.colorPages) || 0
        next.bwPages = String(Math.max(0, tp - cp))
      }
      return next
    })
    setApiError(null)
  }

  // Recalculate quote whenever configure fields change
  const liveQuote = (parseInt(f.totalPages) > 0)
    ? calcTotal({
        totalPages: parseInt(f.totalPages) || 0,
        colorPages: parseInt(f.colorPages) || 0,
        copies:     parseInt(f.copies)     || 1,
        ohp:        parseInt(f.ohp)        || 0,
      })
    : null

  const canStep1 = f.name && f.phone && f.thesisFile
  const canStep2 = parseInt(f.totalPages) > 0

  const handlePlaceOrder = async () => {
    setBusy(true)
    setApiError(null)
    try {
      const fd = new FormData()
      fd.append('name',       f.name)
      fd.append('phone',      f.phone)
      fd.append('email',      f.email)
      fd.append('university', f.university)
      fd.append('title',      f.university || 'Thesis')
      fd.append('degree',     f.degree)
      fd.append('pages',      f.totalPages)
      fd.append('colorPages', f.colorPages || '0')
      fd.append('binding',    'hardbound')
      fd.append('coverColour',f.cover)
      fd.append('copies',     String(f.copies))
      fd.append('address',    f.address)
      fd.append('thesis',     f.thesisFile)
      if (f.coverFile) fd.append('cover', f.coverFile)

      const res = await placeOrder(fd)
      const newId = res.data.orderId
      setOrderId(newId)
      if (addOrder) {
        addOrder({
          id: newId, customer: f.name, thesis: f.university || 'Thesis',
          pages: parseInt(f.totalPages), colorPages: parseInt(f.colorPages) || 0,
          binding: 'hardbound', cover: f.cover, amount: liveQuote.total,
          status: 'received', date: new Date().toISOString().slice(0, 10), phone: f.phone,
        })
      }
      setStep(3)
    } catch {
      // Place order locally if backend not available
      const newId = 'ACD-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900) + 100)
      setOrderId(newId)
      if (addOrder) {
        addOrder({
          id: newId, customer: f.name, thesis: f.university || 'Thesis',
          pages: parseInt(f.totalPages), colorPages: parseInt(f.colorPages) || 0,
          binding: 'hardbound', cover: f.cover, amount: liveQuote?.total || 0,
          status: 'received', date: new Date().toISOString().slice(0, 10), phone: f.phone,
        })
      }
      setStep(3)
    } finally {
      setBusy(false)
    }
  }

  const handlePay = async () => {
    setPayError(null)
    await openCheckout({
      orderId,
      customerName:  f.name,
      customerPhone: f.phone,
      customerEmail: f.email,
      thesisTitle:   f.university || 'Thesis',
      onSuccess: () => setPayState('success'),
      onFailure: (reason) => { setPayState('failed'); setPayError(reason) },
    })
  }

  const reset = () => { setStep(1); setF(emptyForm()); setQuote(null); setOrderId(null); setPayState('idle'); setDone(false) }

  const inp = { ...inputStyle }
  const lbl = { ...labelStyle }

  return (
    <div style={{ minHeight: '100vh', background: C.gray1, padding: '2.5rem 1rem' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', marginBottom: '2rem' }}>
            {['Your Details', 'Print Options', 'Confirm & Pay'].map((label, i) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: i + 1 <= step ? C.maroon : C.gray2, border: '1.5px solid ' + (i + 1 <= step ? C.maroon : C.border), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', ...mono, fontSize: '0.72rem', color: i + 1 <= step ? '#fff' : C.textMuted }}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <div style={{ ...mono, fontSize: '0.6rem', color: i + 1 === step ? C.maroon : C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                {i < 2 && <div style={{ position: 'absolute', top: 15, left: '55%', width: '90%', height: 1, background: i + 1 < step ? C.maroon : C.border }} />}
              </div>
            ))}
          </div>
        )}

        <div style={cardStyle}>

          {/* ── Step 1: Details ────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 style={{ ...serif, fontSize: '1.9rem', fontWeight: 600, color: C.maroon, marginBottom: '0.25rem' }}>Your Details</h2>
              <p style={{ ...serif, fontSize: '0.97rem', color: C.textMuted, marginBottom: '1.75rem' }}>Fill in your details and upload your thesis.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={lbl}>Full Name *</label>
                  <input value={f.name} onChange={e => u('name', e.target.value)} style={inp} placeholder="Your full name" />
                </div>
                <div>
                  <label style={lbl}>Phone Number *</label>
                  <input type="tel" value={f.phone} onChange={e => u('phone', e.target.value)} style={inp} placeholder="10-digit mobile number" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={lbl}>Email (optional)</label>
                  <input type="email" value={f.email} onChange={e => u('email', e.target.value)} style={inp} placeholder="your@email.com" />
                </div>
                <div>
                  <label style={lbl}>University / College (optional)</label>
                  <input value={f.university} onChange={e => u('university', e.target.value)} style={inp} placeholder="e.g. IIT Jodhpur" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                {/* Thesis PDF */}
                <div>
                  <label style={lbl}>Thesis PDF *</label>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px dashed ' + (f.thesisFile ? C.maroon : C.border), borderRadius: 6, padding: '1.5rem 1rem', cursor: 'pointer', background: f.thesisFile ? 'rgba(122,30,30,0.04)' : '#fff', minHeight: 100 }}>
                    <div style={{ fontSize: 24 }}>{f.thesisFile ? '✅' : '📄'}</div>
                    <div style={{ ...mono, fontSize: '0.65rem', color: f.thesisFile ? C.maroon : C.textMuted, textAlign: 'center', wordBreak: 'break-all' }}>
                      {f.thesisFile ? f.thesisFile.name : 'Click to upload PDF'}
                    </div>
                    <input type="file" accept=".pdf" onChange={e => u('thesisFile', e.target.files[0] || null)} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* Cover page */}
                <div>
                  <label style={lbl}>Sample Cover Page (optional)</label>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px dashed ' + (f.coverFile ? C.maroon : C.border), borderRadius: 6, padding: '1.5rem 1rem', cursor: 'pointer', background: f.coverFile ? 'rgba(122,30,30,0.04)' : '#fff', minHeight: 100 }}>
                    <div style={{ fontSize: 24 }}>{f.coverFile ? '✅' : '🖼'}</div>
                    <div style={{ ...mono, fontSize: '0.65rem', color: f.coverFile ? C.maroon : C.textMuted, textAlign: 'center', wordBreak: 'break-all' }}>
                      {f.coverFile ? f.coverFile.name : 'Click to upload (optional)'}
                    </div>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => u('coverFile', e.target.files[0] || null)} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {apiError && <div style={{ ...mono, fontSize: '0.7rem', color: '#C0392B', marginBottom: '1rem', padding: '0.6rem', background: 'rgba(192,57,43,0.07)', borderRadius: 4 }}>⚠ {apiError}</div>}

              <button onClick={() => setStep(2)} disabled={!canStep1}
                style={{ ...btn('primary'), width: '100%', opacity: canStep1 ? 1 : 0.4 }}>
                Continue to Print Options →
              </button>
            </div>
          )}

          {/* ── Step 2: Configure ──────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 style={{ ...serif, fontSize: '1.9rem', fontWeight: 600, color: C.maroon, marginBottom: '0.25rem' }}>Print Options</h2>
              <p style={{ ...serif, fontSize: '0.97rem', color: C.textMuted, marginBottom: '1.75rem' }}>Configure your printing specifications below.</p>

              {/* Page counts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={lbl}>Total Pages *</label>
                  <input type="number" min={1} value={f.totalPages} onChange={e => u('totalPages', e.target.value)} style={inp} placeholder="0" />
                </div>
                <div>
                  <label style={lbl}>Colour Pages</label>
                  <input type="number" min={0} value={f.colorPages} onChange={e => u('colorPages', e.target.value)} style={inp} placeholder="0" />
                </div>
                <div>
                  <label style={lbl}>B&W Pages (auto)</label>
                  <input type="number" value={f.bwPages} readOnly style={{ ...inp, background: C.gray1, color: C.textMuted, cursor: 'not-allowed' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={lbl}>Number of Copies</label>
                  <input type="number" min={1} value={f.copies} onChange={e => u('copies', parseInt(e.target.value) || 1)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>OHP Transparent Sheets</label>
                  <input type="number" min={0} value={f.ohp} onChange={e => u('ohp', parseInt(e.target.value) || 0)} style={inp} placeholder="0" />
                  <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted, marginTop: 4 }}>₹5 per sheet</div>
                </div>
              </div>

              {/* Binding — Hardbound only */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={lbl}>Binding Type</label>
                <div style={{ padding: '1rem 1.25rem', border: '2px solid ' + C.maroon, borderRadius: 6, background: 'rgba(122,30,30,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ ...serif, fontSize: '1.1rem', fontWeight: 600, color: C.maroon }}>Hardbound</div>
                    <div style={{ ...serif, fontSize: '0.88rem', color: C.textMuted }}>Buckram cloth cover, gold foil title stamping</div>
                  </div>
                  <div style={{ ...mono, fontSize: '1.1rem', color: C.maroon, fontWeight: 600 }}>₹250 / copy</div>
                </div>
              </div>

              {/* Cover colour */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={lbl}>Cover Colour</label>
                <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                  {COVERS.map(c => (
                    <div key={c.id} onClick={() => u('cover', c.id)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.hex, border: '3px solid ' + (f.cover === c.id ? C.maroon : 'transparent'), margin: '0 auto 5px', boxShadow: f.cover === c.id ? '0 0 0 2px rgba(122,30,30,0.25)' : 'none', transition: 'all 0.15s' }} />
                      <div style={{ ...mono, fontSize: '0.58rem', color: f.cover === c.id ? C.maroon : C.textMuted, textTransform: 'uppercase' }}>{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery address */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={lbl}>Delivery Address</label>
                <textarea rows={2} value={f.address} onChange={e => u('address', e.target.value)}
                  placeholder="Enter your delivery address in Jodhpur..."
                  style={{ ...inp, resize: 'none' }} />
              </div>

              {/* Live quotation */}
              {liveQuote && (
                <div style={{ background: C.gray1, border: '1px solid ' + C.border, borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Live Quotation</div>
                  {[
                    ['B&W printing (' + liveQuote.bwPages + ' pages × ₹2 × ' + (f.copies || 1) + ' copies)', '₹' + liveQuote.bwCost],
                    ['Colour printing (' + (parseInt(f.colorPages) || 0) + ' pages × ₹' + liveQuote.colorRate + ' × ' + (f.copies || 1) + ' copies)', '₹' + liveQuote.colorCost],
                    ['OHP sheets (' + (parseInt(f.ohp) || 0) + ' × ₹5 × ' + (f.copies || 1) + ' copies)', '₹' + liveQuote.ohpCost],
                    ['Hardbound binding × ' + (f.copies || 1) + ' copies', '₹' + liveQuote.bindingCost],
                    ['Subtotal', '₹' + liveQuote.subtotal],
                    ['Delivery', liveQuote.delivery === 0 ? 'FREE' : '₹' + liveQuote.delivery],
                    ['GST (18%)', '₹' + liveQuote.gst],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid ' + C.border, ...serif, fontSize: '0.92rem', color: C.textBody }}>
                      <span>{l}</span>
                      <span style={{ color: v === 'FREE' ? '#1E6B3A' : C.maroon, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 0 0', ...mono, fontSize: '1.15rem', color: C.maroon, fontWeight: 700 }}>
                    <span>TOTAL</span>
                    <span>₹{liveQuote.total}</span>
                  </div>
                  {liveQuote.colorRate === 6 && parseInt(f.colorPages) > 0 && (
                    <div style={{ ...mono, fontSize: '0.62rem', color: '#1E6B3A', marginTop: '0.5rem' }}>
                      ✓ Bulk discount applied — colour rate ₹6/page (10+ colour pages, 2+ copies)
                    </div>
                  )}
                </div>
              )}

              {apiError && <div style={{ ...mono, fontSize: '0.7rem', color: '#C0392B', marginBottom: '1rem', padding: '0.6rem', background: 'rgba(192,57,43,0.07)', borderRadius: 4 }}>⚠ {apiError}</div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep(1)}
                  style={{ ...btn('ghost'), flex: 1 }}>← Back</button>
                <button onClick={handlePlaceOrder} disabled={!canStep2 || busy}
                  style={{ ...btn(canStep2 && !busy ? 'primary' : 'ghost'), flex: 2, opacity: (!canStep2 || busy) ? 0.5 : 1 }}>
                  {busy ? 'Submitting...' : 'Confirm Order →'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm & Pay ──────────────────────────────── */}
          {step === 3 && payState === 'idle' && (
            <div>
              <h2 style={{ ...serif, fontSize: '1.9rem', fontWeight: 600, color: C.maroon, marginBottom: '1.5rem' }}>Order Confirmed</h2>
              <div style={{ background: C.gray1, border: '1px solid ' + C.border, borderRadius: 6, padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ ...mono, fontSize: '0.65rem', color: C.textMuted }}>ORDER ID</span>
                  <span style={{ ...mono, fontSize: '0.78rem', color: C.maroon, fontWeight: 600 }}>{orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...serif, fontSize: '1rem', color: C.textMuted }}>Amount Due</span>
                  <span style={{ ...mono, fontSize: '1.6rem', color: C.maroon, fontWeight: 700 }}>₹{liveQuote?.total}</span>
                </div>
                <div style={{ ...serif, fontSize: '0.88rem', color: C.textMuted, marginTop: 6 }}>{f.name} · {f.university || 'Thesis'}</div>
              </div>
              <div style={{ background: 'rgba(198,154,74,0.08)', border: '1px solid rgba(198,154,74,0.3)', borderRadius: 4, padding: '0.85rem 1rem', marginBottom: '1.25rem', ...mono, fontSize: '0.7rem', color: '#7A5C10', textAlign: 'center' }}>
                🔧 Payment via Razorpay coming soon — WhatsApp us with your Order ID to confirm
              </div>
              <a href={'https://wa.me/919460046565?text=' + encodeURIComponent('Hello Acadmify! My Order ID is ' + orderId + '. I want to confirm my thesis printing order of ₹' + liveQuote?.total)}
                target="_blank" rel="noreferrer"
                style={{ ...btn('primary'), textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginBottom: '0.75rem' }}>
                💬 WhatsApp to Confirm Payment
              </a>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setPage('track')} style={{ ...btn('ghost'), flex: 1 }}>Track Order</button>
                <button onClick={reset} style={{ ...btn('outline'), flex: 1 }}>New Order</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
