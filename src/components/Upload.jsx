import { useState, useEffect } from 'react'
import { C, BINDINGS, COVERS } from '../constants'
import { getQuote, placeOrder } from '../utils/api.js'
import { useRazorpay }          from '../hooks/useRazorpay.js'
import { inr }                  from '../utils/pricing.js'
import { mono, serif, inputStyle, labelStyle, btn, cardStyle } from '../utils/styles'

const DEGREES = ['PhD', 'MTech', 'MBA', 'MPhil', 'MSc', 'MA', 'Other']
const STEPS   = ['Details', 'Configure', 'Quotation', 'Payment']

const emptyForm = () => ({
  name: '', email: '', phone: '', university: '',
  title: '', degree: 'PhD',
  thesisFile: null,
  coverFile:  null,
  pages: '', colorPages: '0',
  binding: 'hardbound', cover: 'maroon', copies: 1,
  address: '',
})

// ── Small reusable components ──────────────────────────────────────────────────

function StepBar({ step }) {
  return (
    <div style={{ display: 'flex', marginBottom: '2.5rem' }}>
      {STEPS.map((label, i) => (
        <div key={label} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: i + 1 <= step ? C.gold : 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 6px',
            ...mono, fontSize: '0.72rem',
            color: i + 1 <= step ? C.dark : C.muted, fontWeight: 600,
          }}>
            {i + 1 < step ? '✓' : i + 1}
          </div>
          <div style={{ ...mono, fontSize: '0.65rem', color: i + 1 === step ? C.gold : C.muted }}>
            {label}
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              position: 'absolute', top: 14, left: '55%', width: '90%', height: 2,
              background: i + 1 < step ? C.gold : 'rgba(255,255,255,0.08)',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

function FileDropZone({ label, file, onChange, accept = '.pdf' }) {
  return (
    <div>
      <label style={labelStyle}>{label.toUpperCase()}</label>
      <label style={{
        display: 'block',
        border: `2px dashed ${file ? 'rgba(201,168,76,0.5)' : C.border}`,
        borderRadius: 8, padding: '1.25rem', textAlign: 'center', cursor: 'pointer',
        background: file ? 'rgba(201,168,76,0.06)' : 'transparent',
        transition: 'all 0.2s',
      }}>
        <div style={{ fontSize: 16, marginBottom: 4 }}>{file ? '✓' : '📄'}</div>
        <div style={{ ...mono, fontSize: '0.65rem', color: file ? C.gold : C.muted, wordBreak: 'break-all' }}>
          {file ? file.name : 'Click to upload PDF'}
        </div>
        {file && (
          <div style={{ ...mono, fontSize: '0.6rem', color: C.muted, marginTop: 2 }}>
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </div>
        )}
        <input type="file" accept={accept} onChange={onChange} style={{ display: 'none' }} />
      </label>
    </div>
  )
}

function QuoteRow({ label, value, gold }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '0.45rem 0', borderBottom: `1px solid rgba(201,168,76,0.08)`,
      ...serif, fontSize: '0.92rem', color: C.muted,
    }}>
      <span>{label}</span>
      <span style={{ color: gold ? C.gold : value === 'FREE' ? '#2ECC71' : C.cream }}>{value}</span>
    </div>
  )
}

function Alert({ type, children }) {
  const colors = {
    info:    { bg: 'rgba(74,144,217,0.07)',  border: 'rgba(74,144,217,0.25)',  text: '#4A90D9' },
    success: { bg: 'rgba(46,204,113,0.07)',  border: 'rgba(46,204,113,0.18)',  text: '#2ECC71' },
    warning: { bg: 'rgba(255,165,0,0.07)',   border: 'rgba(255,165,0,0.25)',   text: 'rgba(255,195,80,0.9)' },
    error:   { bg: 'rgba(231,76,60,0.08)',   border: 'rgba(231,76,60,0.3)',    text: '#E74C3C' },
  }
  const s = colors[type] || colors.info
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: '0.7rem 1rem', ...mono, fontSize: '0.7rem', color: s.text }}>
      {children}
    </div>
  )
}

// ── Main Upload Component ──────────────────────────────────────────────────────

export default function Upload({ setPage, addOrder }) {
  const [step,      setStep]      = useState(1)
  const [f,         setF]         = useState(emptyForm())
  const [quote,     setQuote]     = useState(null)
  const [orderId,   setOrderId]   = useState(null)
  const [apiError,  setApiError]  = useState(null)
  const [busy,      setBusy]      = useState(false)
  const [payState,  setPayState]  = useState('idle')  // idle | success | failed
  const [payError,  setPayError]  = useState(null)

  const { openCheckout, loading: rzpLoading } = useRazorpay()

  const u = (k, v) => { setF(p => ({ ...p, [k]: v })); setApiError(null) }

  const canStep1 = f.name && f.phone && f.title && f.thesisFile
  const canStep2 = parseInt(f.pages) > 0

  // ── Step 2 → 3: fetch quote from backend ──────────────────────────────────
  const handleGetQuote = async () => {
    setBusy(true)
    setApiError(null)
    try {
      const res = await getQuote({
        pages:      parseInt(f.pages),
        colorPages: parseInt(f.colorPages) || 0,
        binding:    f.binding,
        copies:     parseInt(f.copies) || 1,
      })
      setQuote(res.data)
      setStep(3)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // ── Step 3 → 4: submit order (multipart) ──────────────────────────────────
  const handlePlaceOrder = async () => {
    setBusy(true)
    setApiError(null)
    try {
      const fd = new FormData()
      // Customer fields
      fd.append('name',        f.name)
      fd.append('email',       f.email)
      fd.append('phone',       f.phone)
      fd.append('university',  f.university)
      fd.append('address',     f.address)
      // Thesis fields
      fd.append('title',       f.title)
      fd.append('degree',      f.degree)
      fd.append('pages',       f.pages)
      fd.append('colorPages',  f.colorPages || '0')
      fd.append('binding',     f.binding)
      fd.append('coverColour', f.cover)
      fd.append('copies',      String(f.copies))
      // Files
      fd.append('thesis', f.thesisFile)
      if (f.coverFile) fd.append('cover', f.coverFile)

      const res = await placeOrder(fd)
      const newOrderId = res.data.orderId

      setOrderId(newOrderId)

      // Also update local demo state so Track page works immediately
      if (addOrder) {
        addOrder({
          id:         newOrderId,
          customer:   f.name,
          thesis:     f.title,
          pages:      parseInt(f.pages),
          colorPages: parseInt(f.colorPages) || 0,
          binding:    f.binding,
          cover:      f.cover,
          amount:     quote.total,
          status:     'received',
          date:       new Date().toISOString().slice(0, 10),
          phone:      f.phone,
        })
      }

      setStep(4)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // ── Step 4: open Razorpay checkout ────────────────────────────────────────
  const handlePay = async () => {
    setPayError(null)
    await openCheckout({
      orderId,
      customerName:  f.name,
      customerPhone: f.phone,
      customerEmail: f.email,
      thesisTitle:   f.title,
      onSuccess: ({ paymentId }) => {
        setPayState('success')
      },
      onFailure: (reason) => {
        setPayState('failed')
        setPayError(reason)
      },
    })
  }

  const reset = () => { setStep(1); setF(emptyForm()); setQuote(null); setOrderId(null); setPayState('idle'); setPayError(null) }

  return (
    <div style={{ minHeight: '100vh', background: C.dark, padding: '2.5rem 1rem' }}>
      <div style={{ maxWidth: 660, margin: '0 auto' }}>

        <StepBar step={step} />

        <div style={cardStyle}>

          {/* ── Step 1: Customer Details ────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 style={{ ...serif, fontSize: '1.7rem', color: C.cream, marginBottom: '1.25rem' }}>Your Details</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                {[['name', 'Full Name', 'text'], ['phone', 'Phone Number', 'tel'],
                  ['email', 'Email (optional)', 'email'], ['university', 'University', 'text']
                ].map(([k, l, t]) => (
                  <div key={k}>
                    <label style={labelStyle}>{l.toUpperCase()}</label>
                    <input type={t} value={f[k]} onChange={e => u(k, e.target.value)}
                      style={inputStyle} placeholder={l} />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={labelStyle}>THESIS TITLE</label>
                <input value={f.title} onChange={e => u('title', e.target.value)}
                  style={inputStyle} placeholder="Enter your full thesis title" />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>DEGREE</label>
                <select value={f.degree} onChange={e => u('degree', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
                <FileDropZone label="Thesis PDF (required)" file={f.thesisFile}
                  onChange={e => u('thesisFile', e.target.files[0] || null)} />
                <FileDropZone label="Cover Page (optional)" file={f.coverFile}
                  onChange={e => u('coverFile', e.target.files[0] || null)} />
              </div>

              {apiError && <div style={{ marginBottom: '0.9rem' }}><Alert type="error">⚠ {apiError}</Alert></div>}

              <button onClick={() => setStep(2)} disabled={!canStep1}
                style={{ ...btn(canStep1 ? C.gold : 'rgba(201,168,76,0.3)'), width: '100%' }}>
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: Print Configuration ──────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 style={{ ...serif, fontSize: '1.7rem', color: C.cream, marginBottom: '1.25rem' }}>Configure Your Print</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.9rem', marginBottom: '1.25rem' }}>
                {[['pages', 'Total Pages'], ['colorPages', 'Color Pages'], ['copies', 'Copies']].map(([k, l]) => (
                  <div key={k}>
                    <label style={labelStyle}>{l.toUpperCase()}</label>
                    <input type="number" min={0} value={f[k]}
                      onChange={e => u(k, parseInt(e.target.value) || 0)} style={inputStyle} />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>BINDING TYPE</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {BINDINGS.map(b => (
                    <div key={b.id} onClick={() => u('binding', b.id)} style={{
                      padding: '0.9rem',
                      border: `2px solid ${f.binding === b.id ? C.gold : C.border}`,
                      borderRadius: 8, cursor: 'pointer',
                      background: f.binding === b.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ ...serif, fontSize: '0.95rem', color: C.cream, marginBottom: 3 }}>{b.label}</div>
                      <div style={{ ...mono, fontSize: '0.68rem', color: C.gold, marginBottom: 3 }}>₹{b.price}</div>
                      <div style={{ ...serif, fontSize: '0.75rem', color: C.muted }}>{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>COVER COLOUR</label>
                <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                  {COVERS.map(c => (
                    <div key={c.id} onClick={() => u('cover', c.id)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', background: c.hex,
                        border: `3px solid ${f.cover === c.id ? C.gold : 'transparent'}`,
                        margin: '0 auto 4px', transition: 'border 0.2s',
                      }} />
                      <div style={{ ...mono, fontSize: '0.6rem', color: f.cover === c.id ? C.gold : C.muted }}>
                        {c.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {apiError && <div style={{ marginBottom: '0.9rem' }}><Alert type="error">⚠ {apiError}</Alert></div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep(1)}
                  style={{ ...btn('transparent', C.cream), border: `1px solid rgba(255,255,255,0.18)`, flex: 1 }}>
                  ← Back
                </button>
                <button onClick={handleGetQuote} disabled={!canStep2 || busy}
                  style={{ ...btn(canStep2 && !busy ? C.gold : 'rgba(201,168,76,0.3)'), flex: 2 }}>
                  {busy ? 'Calculating…' : 'Get Quotation →'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Quotation ─────────────────────────────────────────────── */}
          {step === 3 && quote && (
            <div>
              <h2 style={{ ...serif, fontSize: '1.7rem', color: C.cream, marginBottom: '0.4rem' }}>Your Quotation</h2>
              <div style={{ ...mono, fontSize: '0.7rem', color: C.muted, marginBottom: '1.25rem' }}>{f.title}</div>

              <div style={{ background: 'rgba(201,168,76,0.05)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '1.25rem', marginBottom: '1.25rem' }}>
                <QuoteRow label={`B&W pages (${parseInt(f.pages) - (parseInt(f.colorPages) || 0)} × ₹2)`} value={inr(quote.bw_cost)} />
                <QuoteRow label={`Color pages (${f.colorPages} × ₹10)`} value={inr(quote.color_cost)} />
                <QuoteRow label={`${BINDINGS.find(b => b.id === f.binding)?.label} × ${f.copies}`} value={inr(quote.binding_cost)} />
                <QuoteRow label="Subtotal" value={inr(quote.subtotal)} />
                <QuoteRow label="Delivery" value={quote.delivery === 0 ? 'FREE' : inr(quote.delivery)} />
                <QuoteRow label="GST (18%)" value={inr(quote.gst)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 0 0', ...mono, fontSize: '1.15rem', color: C.gold, fontWeight: 600 }}>
                  <span>TOTAL</span><span>{inr(quote.total)}</span>
                </div>
              </div>

              <Alert type="success" style={{ marginBottom: '1.25rem' }}>
                ⚡ Estimated delivery: within 24 hours of confirmed payment
              </Alert>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>DELIVERY ADDRESS</label>
                <textarea rows={3} value={f.address} onChange={e => u('address', e.target.value)}
                  placeholder="Enter your full delivery address in Jodhpur…"
                  style={{ ...inputStyle, resize: 'none' }} />
              </div>

              {apiError && <div style={{ marginBottom: '0.9rem' }}><Alert type="error">⚠ {apiError}</Alert></div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep(2)}
                  style={{ ...btn('transparent', C.cream), border: `1px solid rgba(255,255,255,0.18)`, flex: 1 }}>
                  ← Modify
                </button>
                <button onClick={handlePlaceOrder} disabled={busy || !f.address}
                  style={{ ...btn(busy || !f.address ? 'rgba(123,36,55,0.5)' : C.maroon, C.cream), flex: 2 }}>
                  {busy ? 'Uploading…' : 'Confirm & Upload →'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Payment ───────────────────────────────────────────────── */}
          {step === 4 && payState === 'idle' && (
            <div>
              <h2 style={{ ...serif, fontSize: '1.7rem', color: C.cream, marginBottom: '1.25rem' }}>Complete Payment</h2>

              {/* Order confirmation box */}
              <div style={{ background: 'rgba(201,168,76,0.07)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ ...mono, fontSize: '0.65rem', color: C.muted }}>ORDER ID</span>
                  <span style={{ ...mono, fontSize: '0.78rem', color: C.gold }}>{orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ ...serif, fontSize: '0.9rem', color: C.muted }}>Amount</span>
                  <span style={{ ...mono, fontSize: '1.4rem', color: C.gold }}>{inr(quote?.total)}</span>
                </div>
                <div style={{ ...serif, fontSize: '0.82rem', color: C.muted }}>{f.title}</div>
              </div>

              <Alert type="info">
                🔒 Payment secured by Razorpay — UPI, cards, netbanking all accepted
              </Alert>

              {payError && <div style={{ margin: '0.75rem 0' }}><Alert type="error">⚠ {payError} — please try again.</Alert></div>}

              <button
                onClick={handlePay}
                disabled={rzpLoading}
                style={{ ...btn(rzpLoading ? 'rgba(201,168,76,0.4)' : C.gold), width: '100%', marginTop: '1.25rem', fontSize: '1.05rem' }}>
                {rzpLoading ? 'Opening payment…' : `Pay ${inr(quote?.total)} →`}
              </button>

              <div style={{ marginTop: '0.75rem', textAlign: 'center', ...mono, fontSize: '0.65rem', color: C.muted }}>
                Or pay via WhatsApp after order confirmation
              </div>
            </div>
          )}

          {/* ── Payment Success ───────────────────────────────────────────────── */}
          {step === 4 && payState === 'success' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: 44, marginBottom: '0.75rem' }}>🎉</div>
              <h2 style={{ ...serif, fontSize: '1.9rem', color: C.cream, marginBottom: '0.4rem' }}>Payment Confirmed!</h2>
              <p style={{ ...serif, color: C.muted, marginBottom: '1.5rem' }}>
                Your thesis is queued for printing, {f.name.split(' ')[0]}.
              </p>

              <div style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', display: 'inline-block', minWidth: 280 }}>
                <div style={{ ...mono, fontSize: '0.65rem', color: C.muted, marginBottom: 4 }}>Your Order ID</div>
                <div style={{ ...mono, fontSize: '1.6rem', color: '#2ECC71' }}>{orderId}</div>
                <div style={{ ...serif, fontSize: '0.8rem', color: C.muted, marginTop: 6 }}>
                  Expected delivery within 24 hours
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button onClick={() => setPage('track')} style={btn(C.gold)}>Track Order</button>
                <button onClick={reset} style={{ ...btn('transparent', C.cream), border: `1px solid rgba(255,255,255,0.18)` }}>
                  New Order
                </button>
              </div>
            </div>
          )}

          {/* ── Payment Failed ────────────────────────────────────────────────── */}
          {step === 4 && payState === 'failed' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>⚠️</div>
              <h2 style={{ ...serif, fontSize: '1.7rem', color: C.cream, marginBottom: '0.5rem' }}>Payment Failed</h2>
              {payError && <p style={{ ...mono, fontSize: '0.75rem', color: '#E74C3C', marginBottom: '1.5rem' }}>{payError}</p>}

              <p style={{ ...serif, color: C.muted, marginBottom: '1.5rem' }}>
                Your order ({orderId}) is saved. You can retry payment or contact us on WhatsApp.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button onClick={() => { setPayState('idle'); setPayError(null) }} style={btn(C.gold)}>
                  Retry Payment
                </button>
                <button onClick={() => setPage('track')} style={{ ...btn('transparent', C.cream), border: `1px solid rgba(255,255,255,0.18)` }}>
                  Track Order
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
