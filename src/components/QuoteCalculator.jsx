// Live price calculator on the homepage. Same maths as the upload page and the
// backend (lib/pricing-core.js), with prices from the Supabase pricing table.
import { useState } from 'react'
import { calcQuote } from '../lib/pricing-core.js'
import { usePricing } from '../lib/usePricing.js'
import { useWaLink } from '../lib/whatsapp.js'
import { navigate } from '../lib/router.jsx'
import { rupees, plural } from '../lib/format.js'
import { readJson, writeJson } from '../lib/util.js'
import { trackEvent } from '../lib/analytics.js'
import { DELIVERY_METHODS } from '../constants.js'
import QuoteBreakdown from './QuoteBreakdown.jsx'
import Field from './Field.jsx'

export default function QuoteCalculator() {
  const p = usePricing()
  const wa = useWaLink()
  const [service, setService] = useState('thesis')
  const [f, setF] = useState({ totalPages: '', colourPages: '0', copies: '1', ohp: '0', deliveryMethod: 'pickup', formatting: false })
  const set = (key) => (e) => setF((s) => ({ ...s, [key]: e.target.value }))

  const book = service === 'book' && p.softbound_enabled
  const q = book
    ? calcQuote({ totalPages: 0, copies: f.copies, binding: 'softbound', deliveryMethod: f.deliveryMethod }, p)
    : calcQuote({ ...f, binding: 'hardbound' }, p)
  const ready = book || q.valid
  const colourTooMany = Number(f.colourPages) > Number(f.totalPages) && Number(f.totalPages) > 0

  const copiesText = plural(q.copies, 'copy', 'copies')
  const waMessage = book
    ? 'Hello Acadmify! I would like softbound book binding: ' + copiesText + '. Calculator total ' + rupees(q.total) + '.'
    : 'Hello Acadmify! Price for my thesis: ' + q.totalPages + ' pages (' + q.colourPages + ' colour), ' + copiesText +
      (q.ohp ? ', ' + q.ohp + ' OHP sheets' : '') + (q.formatting ? ', with thesis formatting' : '') +
      '. Calculator total ' + rupees(q.total) + '.'

  function continueToUpload() {
    writeJson('sessionStorage', 'acadmify.prefill', {
      totalPages: q.totalPages,
      colourPages: q.colourPages,
      copies: q.copies,
      ohp: q.ohp,
      deliveryMethod: q.deliveryMethod,
      formatting: q.formatting,
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
          <p>Type your page count and the total updates as you go, GST included.</p>
        </div>

        <div className="calc">
          <div className="calc-form">
            {p.softbound_enabled && (
              <div className="segmented" role="radiogroup" aria-label="Service">
                <label className={service === 'thesis' ? 'is-on' : ''}>
                  <input type="radio" name="service" checked={service === 'thesis'} onChange={() => setService('thesis')} />
                  Thesis printing &amp; binding
                </label>
                <label className={service === 'book' ? 'is-on' : ''}>
                  <input type="radio" name="service" checked={service === 'book'} onChange={() => setService('book')} />
                  Book binding only
                </label>
              </div>
            )}

            {!book && (
              <>
                <div className="field-row cols-3 tight">
                  <Field id="calc-pages" label="Total pages">
                    <input id="calc-pages" type="number" inputMode="numeric" min="1" max="5000" placeholder="e.g. 180"
                      value={f.totalPages} onChange={set('totalPages')} />
                  </Field>
                  <Field id="calc-colour" label="Colour pages" error={colourTooMany ? 'More than total pages' : null}>
                    <input id="calc-colour" type="number" inputMode="numeric" min="0" max="5000"
                      value={f.colourPages} onChange={set('colourPages')} aria-describedby="calc-colour-hint" />
                  </Field>
                  <div className="field">
                    <span className="label">B&amp;W pages</span>
                    <output className="output num" htmlFor="calc-pages calc-colour">{q.bwPages}</output>
                  </div>
                </div>
                <div className="field-row cols-2">
                  <Field id="calc-copies" label="Copies">
                    <input id="calc-copies" type="number" inputMode="numeric" min="1" max="100"
                      value={f.copies} onChange={set('copies')} />
                  </Field>
                  <Field id="calc-ohp" label="OHP sheets per copy" hint={rupees(p.ohp_per_sheet) + ' per sheet'}>
                    <input id="calc-ohp" type="number" inputMode="numeric" min="0" max="100"
                      value={f.ohp} onChange={set('ohp')} aria-describedby="calc-ohp-hint" />
                  </Field>
                </div>
                <p className="hint">
                  Colour is {rupees(p.color_per_page)} per page, or {rupees(p.colour_bulk_rate)} when you print more than{' '}
                  {p.colour_bulk_above} colour pages in total (colour pages × copies).
                </p>
                {p.formatting_fee > 0 && (
                  <label className="check calc-check">
                    <input type="checkbox" checked={f.formatting} onChange={(e) => setF((s) => ({ ...s, formatting: e.target.checked }))} />
                    <span>Add thesis formatting ({rupees(p.formatting_fee)} per thesis)</span>
                  </label>
                )}
              </>
            )}

            {book && (
              <>
                <Field id="calc-book-copies" label="Books to bind" hint={'Softbound binding, ' + rupees(p.soft_binding) + ' per copy. Bring or send us the pages.'}>
                  <input id="calc-book-copies" type="number" inputMode="numeric" min="1" max="100"
                    value={f.copies} onChange={set('copies')} aria-describedby="calc-book-copies-hint" />
                </Field>
              </>
            )}

            <fieldset className="field choice-list">
              <legend>Pickup or delivery</legend>
              {DELIVERY_METHODS.map((m) => (
                <label key={m.id} className={'choice' + (f.deliveryMethod === m.id ? ' is-on' : '')}>
                  <input type="radio" name="calc-delivery" value={m.id} checked={f.deliveryMethod === m.id} onChange={set('deliveryMethod')} />
                  <span>
                    <strong>{m.label}</strong>
                    <span className="hint">{m.note}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </div>

          <div className="calc-result">
            {ready ? (
              <QuoteBreakdown q={q} p={p} service={book ? 'book' : 'thesis'} />
            ) : (
              <div className="quote-empty">
                <p>Enter your total pages to see the price.</p>
                <p className="hint">A 200-page black &amp; white thesis, one copy, is {rupees(calcQuote({ totalPages: 200 }, p).total)} including GST.</p>
              </div>
            )}
            <p className="sr-only" aria-live="polite">{ready ? 'Total ' + rupees(q.total) : ''}</p>

            {ready && !book && (
              <button type="button" className="btn btn-primary btn-block" onClick={continueToUpload}>
                Continue with these options
              </button>
            )}
            {ready && (
              <a className={'btn btn-block ' + (book ? 'btn-wa' : 'btn-outline')} href={wa(waMessage)} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { place: 'calculator' })}>
                {book ? 'Book it on WhatsApp' : 'Ask on WhatsApp instead'}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
