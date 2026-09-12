// Prices for the whole website and the backend (Supabase `pricing`, row 1).
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseAdmin.js'
import { calcQuote, normalisePricing, DEFAULT_PRICING } from '../../lib/pricing-core.js'
import { forgetPricingCache } from '../../lib/usePricing.js'
import QuoteBreakdown from '../../components/QuoteBreakdown.jsx'

const FIELDS = [
  ['bw_per_page', 'B&W printing, per page (₹)'],
  ['color_per_page', 'Colour printing, per page (₹)'],
  ['colour_bulk_rate', 'Colour bulk rate, per page (₹)'],
  ['colour_bulk_above', 'Bulk colour rate applies when colour pages × copies is more than'],
  ['ohp_per_sheet', 'OHP sheet (₹)'],
  ['hard_binding', 'Hardbound thesis binding, per copy (₹)'],
  ['soft_binding', 'Softbound book binding, per copy (₹)'],
  ['formatting_fee', 'Thesis formatting, per thesis (₹)', '0 = hide the formatting option'],
  ['delivery_charge', 'Doorstep delivery added to the bill (₹)', '0 = customer pays the Rapido rider directly'],
  ['free_delivery_above', 'Free delivery above (₹)', '0 = no free-delivery rule'],
  ['gst_rate', 'GST (%)', 'Check the correct rate for printing/binding with your CA'],
]

export default function PricingTab() {
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    supabase.from('pricing').select('*').eq('id', 1).maybeSingle().then(({ data, error }) => {
      if (error) setMsg({ kind: 'error', text: 'Could not load prices: ' + error.message })
      const p = normalisePricing(data || {})
      setForm(Object.fromEntries(Object.keys(DEFAULT_PRICING).map((k) => [k, typeof p[k] === 'boolean' ? p[k] : String(p[k])])))
    })
  }, [])

  if (!form) return <p>Loading prices…</p>

  const p = normalisePricing(form)
  const examples = [
    ['200 pages, B&W, 1 copy', calcQuote({ totalPages: 200, copies: 1 }, p)],
    ['150 pages, 15 colour, 3 copies', calcQuote({ totalPages: 150, colourPages: 15, copies: 3 }, p)],
  ]

  async function save(e) {
    e.preventDefault()
    const row = {}
    for (const [key] of FIELDS) {
      const n = Number(form[key])
      if (form[key] === '' || !Number.isFinite(n) || n < 0) return setMsg({ kind: 'error', text: 'Please enter a number of 0 or more for every price.' })
      row[key] = n
    }
    if (row.gst_rate > 28) return setMsg({ kind: 'error', text: 'GST looks too high. Please check it.' })
    row.colour_bulk_above = Math.round(row.colour_bulk_above)
    row.softbound_enabled = Boolean(form.softbound_enabled)
    row.updated_at = new Date().toISOString()
    setBusy(true)
    const { error } = await supabase.from('pricing').update(row).eq('id', 1)
    setBusy(false)
    if (error) return setMsg({ kind: 'error', text: 'Save failed: ' + error.message })
    forgetPricingCache()
    setMsg({ kind: 'ok', text: 'Prices saved. The website, calculator and new orders all use them now.' })
  }

  return (
    <form onSubmit={save}>
      <div className="admin-card">
        <h2>Prices</h2>
        <p className="hint">Changing a price here changes it everywhere: price list, calculator, FAQ and the amount on new orders.</p>
        <div className="content-grid">
          {FIELDS.map(([key, label, hint]) => (
            <div key={key} className="field">
              <label htmlFor={'p-' + key}>{label}</label>
              <input id={'p-' + key} type="number" inputMode="decimal" min="0" step="any" value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              {hint && <p className="hint">{hint}</p>}
            </div>
          ))}
          <div className="field wide">
            <label className="check">
              <input type="checkbox" checked={Boolean(form.softbound_enabled)} onChange={(e) => setForm((f) => ({ ...f, softbound_enabled: e.target.checked }))} />
              <span>Offer book binding (softbound) on the website</span>
            </label>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save prices'}</button>
        {msg && <p className={'admin-msg ' + msg.kind} role="status" style={{ marginTop: '1rem' }}>{msg.text}</p>}
      </div>

      <div className="admin-card">
        <h2>Examples with these prices</h2>
        <div className="example-quotes">
          {examples.map(([title, q]) => (
            <div key={title}>
              <h3>{title}</h3>
              <QuoteBreakdown q={q} p={p} />
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
