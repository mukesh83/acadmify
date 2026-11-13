// Live price calculator on the homepage: pages, OHP sheets and copies, nothing else.
// Same maths as the order page and the backend (lib/pricing-core.js).
import { useState } from 'react'
import { calcQuote } from '../lib/pricing-core.js'
import { usePricing } from '../lib/usePricing.js'
import { useWaLink } from '../lib/whatsapp.js'
import { navigate } from '../lib/router.jsx'
import { rupees, plural } from '../lib/format.js'
import { readJson, writeJson } from '../lib/util.js'
import { trackEvent } from '../lib/analytics.js'
import QuoteBreakdown from './QuoteBreakdown.jsx'
import Field from './Field.jsx'

export default function QuoteCalculator() {
  const p = usePricing()
  const wa = useWaLink()
  const [f, setF] = useState({ totalPages: '', ohp: '0', copies: String(p.min_copies) })
  const set = (key) => (e) => setF((s) => ({ ...s, [key]: e.target.value }))

  const q = calcQuote({ ...f, binding: 'hardbound' }, p)

  const waMessage =
    'Hello Acadmify! I would like a price for my thesis: ' + q.totalPages + ' pages, ' + plural(q.copies, 'copy', 'copies') +
    (q.ohp ? ', ' + q.ohp + ' OHP sheets per copy' : '') + '.'

  function continueToUpload() {
    writeJson('sessionStorage', 'acadmify.prefill', {
      totalPages: q.totalPages,
      copies: q.copies,
      ohp: q.ohp,
      cover: readJson('sessionStorage', 'acadmify.cover'),
      lettering: readJson('sessionStorage', 'acadmify.lettering'),
    })
    trackEvent('quote_continue', { value: q.total, currency: 'INR' })
    navigate('/upload')
  }

  return (
    <section id="quote" className="section" aria-labelledby="quote-title">
      <div className="container">
        <div className="section-head">
          <h2 id="quote-title">Work out your price</h2>
          <p>Enter your pages, OHP sheets and copies. GST is included in the total.</p>
        </div>

        <div className="calc">
          <div className="calc-form">
            <div className="field-row cols-3 tight">
              <Field id="calc-pages" label="Pages in thesis">
                <input id="calc-pages" type="number" inputMode="numeric" min="1" max="5000" placeholder="e.g. 180"
                  value={f.totalPages} onChange={set('totalPages')} />
              </Field>
              <Field id="calc-ohp" label="OHP sheets" hint={rupees(p.ohp_per_sheet) + ' each, per copy'}>
                <input id="calc-ohp" type="number" inputMode="numeric" min="0" max="100"
                  value={f.ohp} onChange={set('ohp')} aria-describedby="calc-ohp-hint" />
              </Field>
              <Field id="calc-copies" label="Copies">
                <input id="calc-copies" type="number" inputMode="numeric" min="1" max="100"
                  value={f.copies} onChange={set('copies')} />
              </Field>
            </div>
            <p className="hint">
              Printing is {rupees(p.print_per_page)} per page, colour or black &amp; white. Hardbound binding is {rupees(p.hard_binding)} per copy.
            </p>
          </div>

          <div className="calc-result">
            {!q.valid ? (
              <div className="quote-empty">
                <p>Enter your pages to see the price.</p>
              </div>
            ) : !q.eligible ? (
              <div className="quote-empty">
                <p>
                  Online prices are for theses of {p.min_pages} or more pages and {p.min_copies} or more copies.
                  For anything smaller, message us and we will quote you.
                </p>
              </div>
            ) : (
              <QuoteBreakdown q={q} />
            )}
            <p className="sr-only" aria-live="polite">{q.valid && q.eligible ? 'Total ' + rupees(q.total) : ''}</p>

            {q.valid && q.eligible && (
              <button type="button" className="btn btn-primary btn-block" onClick={continueToUpload}>
                Continue with these options
              </button>
            )}
            {q.valid && (
              <a className={'btn btn-block ' + (q.eligible ? 'btn-outline' : 'btn-wa')} href={wa(waMessage)} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { place: 'calculator' })}>
                {q.eligible ? 'Ask on WhatsApp instead' : 'Get a price on WhatsApp'}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
