import { useState } from 'react'
import { C } from '../constants'
import { mono, serif, inputStyle, labelStyle, btn } from '../utils/styles'

// ── Pricing Rules ─────────────────────────────────────────────────────────────
// BW:      ₹2 per page
// Color:   ₹6 if colorPages > 10 AND copies > 2, else ₹10 per page
// OHP:     ₹5 per sheet
// Binding: ₹250 hardbound per copy
// GST:     18%
// Delivery:₹50 (free if subtotal >= ₹500)

function calcQuote({ totalPages, colorPages, copies, ohp }) {
  const tp  = parseInt(totalPages)  || 0
  const cp  = parseInt(colorPages)  || 0
  const qty = parseInt(copies)      || 1
  const oh  = parseInt(ohp)         || 0

  if (tp <= 0) return null

  const bwPages   = Math.max(0, tp - cp)
  const bwCost    = bwPages * 2
  const colorRate = (cp > 10 && qty > 2) ? 6 : 10
  const colorCost = cp * colorRate
  const ohpCost   = oh * 5
  const bindCost  = 250

  const subtotal  = (bwCost + colorCost + ohpCost + bindCost) * qty
  const delivery  = subtotal >= 500 ? 0 : 50
  const gst       = Math.round(subtotal * 0.18)
  const total     = subtotal + delivery + gst

  return { bwPages, bwCost: bwCost * qty, colorCost: colorCost * qty, colorRate, ohpCost: ohpCost * qty, bindCost: bindCost * qty, subtotal, delivery, gst, total }
}

export default function QuoteCalculator({ setPage }) {
  const [fields, setFields] = useState({
    name: '', university: '',
    totalPages: '', colorPages: '0',
    copies: '1', ohp: '0',
  })

  const u = (k, v) => setFields(p => ({ ...p, [k]: v }))

  const tp = parseInt(fields.totalPages) || 0
  const cp = parseInt(fields.colorPages) || 0
  const bw = Math.max(0, tp - cp)

  const result = calcQuote({
    totalPages: fields.totalPages,
    colorPages: fields.colorPages,
    copies:     fields.copies,
    ohp:        fields.ohp,
  })

  const inp = {
    ...inputStyle,
    padding: '10px 12px',
    fontSize: '1rem',
  }

  const lbl = { ...labelStyle }

  return (
    <section id="quote" style={{ background: '#fff', padding: '4.5rem 3rem', borderBottom: '1px solid ' + C.border }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Instant Price Calculator</p>
        <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>Calculate Your Quotation</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0.5rem 0 1.5rem' }}>
          <span style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ color: '#C69A4A', fontSize: 10, letterSpacing: 8 }}>◆ ◆ ◆</span>
          <span style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>

          {/* ── Left: Input form ─────────────────────────────────── */}
          <div>
            {/* Optional name/institute */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1rem' }}>
              <div>
                <label style={lbl}>Your Name (optional)</label>
                <input value={fields.name} onChange={e => u('name', e.target.value)} style={inp} placeholder="Name" />
              </div>
              <div>
                <label style={lbl}>Institute (optional)</label>
                <input value={fields.university} onChange={e => u('university', e.target.value)} style={inp} placeholder="e.g. IIT Jodhpur" />
              </div>
            </div>

            {/* Page counts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.9rem', marginBottom: '1rem' }}>
              <div>
                <label style={lbl}>Total Pages *</label>
                <input type="number" min={1} value={fields.totalPages} onChange={e => u('totalPages', e.target.value)} style={inp} placeholder="e.g. 180" />
              </div>
              <div>
                <label style={lbl}>Colour Pages</label>
                <input type="number" min={0} value={fields.colorPages} onChange={e => u('colorPages', e.target.value)} style={inp} placeholder="0" />
              </div>
              <div>
                <label style={lbl}>B&W Pages</label>
                <input type="number" value={bw} readOnly style={{ ...inp, background: C.gray1, color: C.textMuted, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={lbl}>No. of Copies</label>
                <input type="number" min={1} value={fields.copies} onChange={e => u('copies', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>OHP Transparent Sheets</label>
                <input type="number" min={0} value={fields.ohp} onChange={e => u('ohp', e.target.value)} style={inp} placeholder="0" />
                <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted, marginTop: 4 }}>₹5 per sheet</div>
              </div>
            </div>

            {/* Pricing reference */}
            <div style={{ background: C.gray1, border: '1px solid ' + C.border, borderRadius: 6, padding: '1rem' }}>
              <div style={{ ...mono, fontSize: '0.6rem', color: C.maroon, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Pricing Reference</div>
              {[
                ['B&W printing', '₹2 per page'],
                ['Colour printing', '₹10/page (₹6 if 10+ colour & 2+ copies)'],
                ['OHP transparent sheet', '₹5 per sheet'],
                ['Hardbound binding', '₹250 per copy'],
                ['GST', '18% on subtotal'],
                ['Delivery', 'Free above ₹500'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid ' + C.border, ...serif, fontSize: '0.88rem' }}>
                  <span style={{ color: C.textMuted }}>{l}</span>
                  <span style={{ color: C.maroon, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Live result ───────────────────────────────── */}
          <div style={{ position: 'sticky', top: 80 }}>
            {!result ? (
              <div style={{ background: C.gray1, border: '2px dashed ' + C.border, borderRadius: 8, padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: '0.75rem' }}>🧮</div>
                <p style={{ ...serif, fontSize: '1.05rem', color: C.textMuted, lineHeight: 1.7 }}>
                  Enter total pages on the left to see your instant quotation.
                </p>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 16px rgba(122,30,30,0.08)' }}>
                {/* Header */}
                <div style={{ background: C.maroon, padding: '1rem 1.25rem' }}>
                  <div style={{ ...mono, fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', marginBottom: 4 }}>QUOTATION</div>
                  <div style={{ ...serif, fontSize: '0.95rem', color: '#fff' }}>
                    {fields.name || 'Scholar'}{fields.university ? ' · ' + fields.university : ''}
                  </div>
                </div>

                {/* Breakdown */}
                <div style={{ padding: '1.25rem' }}>
                  {[
                    ['B&W (' + result.bwPages + ' pages × ₹2 × ' + (fields.copies || 1) + ')', '₹' + result.bwCost],
                    ['Colour (' + cp + ' pages × ₹' + result.colorRate + ' × ' + (fields.copies || 1) + ')', '₹' + result.colorCost],
                    ['OHP (' + (parseInt(fields.ohp) || 0) + ' × ₹5 × ' + (fields.copies || 1) + ')', '₹' + result.ohpCost],
                    ['Hardbound × ' + (fields.copies || 1), '₹' + result.bindCost],
                    ['Subtotal', '₹' + result.subtotal],
                    ['Delivery', result.delivery === 0 ? 'FREE' : '₹' + result.delivery],
                    ['GST 18%', '₹' + result.gst],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid ' + C.border, ...serif, fontSize: '0.92rem', color: C.textBody }}>
                      <span>{l}</span>
                      <span style={{ color: v === 'FREE' ? '#1E6B3A' : C.maroon, fontWeight: v === 'FREE' ? 600 : 400 }}>{v}</span>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0.5rem', ...mono, fontSize: '1.3rem', color: C.maroon, fontWeight: 700 }}>
                    <span>TOTAL</span>
                    <span>₹{result.total}</span>
                  </div>

                  {result.colorRate === 6 && cp > 0 && (
                    <div style={{ ...mono, fontSize: '0.62rem', color: '#1E6B3A', marginBottom: '1rem', padding: '0.4rem 0.6rem', background: 'rgba(30,107,58,0.07)', borderRadius: 3 }}>
                      ✓ Bulk discount — colour rate ₹6/page applied
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button onClick={() => setPage('upload')}
                      style={{ ...btn('primary'), flex: 2, textAlign: 'center' }}>
                      Upload Thesis →
                    </button>
                    <a href="https://wa.me/919460046565?text=Hello%20Acadmify!%20I%20want%20a%20quotation%20for%20my%20thesis%20printing."
                      target="_blank" rel="noreferrer"
                      style={{ ...btn('outline'), flex: 1, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.9rem' }}>
                      💬 WA
                    </a>
                  </div>

                  <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted, textAlign: 'center', marginTop: '0.75rem' }}>
                    Estimate only. Final price confirmed on upload.
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
