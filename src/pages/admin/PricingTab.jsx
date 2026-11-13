// Prices for the whole website and the backend (Supabase `pricing`, row 1).
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseAdmin.js'
import { calcQuote, normalisePricing, DEFAULT_PRICING } from '../../lib/pricing-core.js'
import { forgetPricingCache } from '../../lib/usePricing.js'
import QuoteBreakdown from '../../components/QuoteBreakdown.jsx'

const FIELDS = [
  ['print_per_page', 'Printing, per page (₹)', 'One rate for colour and black & white'],
  ['ohp_per_sheet', 'OHP sheet (₹)'],
  ['hard_binding', 'Hardbound thesis binding, per copy (₹)'],
  ['soft_binding', 'Softbound thesis binding, per copy (₹)'],
  ['formatting_fee', 'Thesis formatting, per thesis (₹)', '0 = hide the formatting option'],
  ['min_pages', 'Smallest thesis priced online (pages)', 'Below this, customers are asked to message you for a price'],
  ['min_copies', 'Smallest order priced online (copies)', 'Below this, customers are asked to message you for a price'],
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
      setForm(Object.fromEntries(Object.keys(DEFAULT_PRICING).map((k) => [k, String(p[k])])))
    })
  }, [])

  if (!form) return <p>Loading prices…</p>

  const p = normalisePricing(form)
  const examples = [
    ['200 pages, hardbound, ' + p.min_copies + ' copies', calcQuote({ totalPages: 200, copies: p.min_copies, binding: 'hardbound' }, p)],
    ['150 pages, softbound, ' + (p.min_copies + 5) + ' copies', calcQuote({ totalPages: 150, copies: p.min_copies + 5, binding: 'softbound' }, p)],
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
    row.min_pages = Math.round(row.min_pages)
    row.min_copies = Math.round(row.min_copies)
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
              <QuoteBreakdown q={q} />
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
