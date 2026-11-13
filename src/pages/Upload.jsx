// Place an order in three steps: print options -> your details and files -> review.
// Honest by design: if the order is not saved, we say so plainly and never
// show a made-up order number.
import { useEffect, useRef, useState } from 'react'
import { calcQuote } from '../lib/pricing-core.js'
import { usePricing } from '../lib/usePricing.js'
import { useContent } from '../lib/content.jsx'
import { usePageMeta } from '../lib/seo.js'
import { useWaLink } from '../lib/whatsapp.js'
import { Link } from '../lib/router.jsx'
import { createOrder, confirmUpload, freshUploadUrls, wakeServer } from '../lib/api.js'
import { putFile } from '../lib/upload.js'
import { countPdfPages } from '../lib/pdfPages.js'
import { readJson, writeJson, removeKey } from '../lib/util.js'
import { rupees, plural, formatBytes } from '../lib/format.js'
import { trackEvent } from '../lib/analytics.js'
import {
  COVERS, coverById, LETTERING, letteringLabel, BINDINGS, bindingLabel, DEGREES, DELIVERY_METHODS,
  MAX_PDF_MB, MAX_COVER_MB, MAX_GUIDELINES_MB,
} from '../constants.js'
import Field from '../components/Field.jsx'
import QuoteBreakdown from '../components/QuoteBreakdown.jsx'
import { Book, CoverPicker, LetteringPicker } from '../components/HeroBook.jsx'
import ConfidentialityNote from '../components/ConfidentialityNote.jsx'
import PayOnline from '../components/PayOnline.jsx'
import { IconUpload, IconFile, IconCheck, IconCopy, IconWhatsApp } from '../components/Icons.jsx'

const MB = 1048576
const DRAFT_KEY = 'acadmify.draft'
const STEPS = ['Print options', 'Your details', 'Review & submit']

const EMPTY = {
  cover: 'maroon', lettering: 'gold', ohp: '0', totalPages: '', copies: '5', binding: 'hardbound', formatting: false,
  thesisTitle: '',
  name: '', phone: '', email: '', university: '', degree: 'PhD', fileLink: '',
  deliveryMethod: 'pickup', address: '', requiredBy: '', instructions: '',
  consent: false, website: '',
}

function normalisePhone(value) {
  let d = String(value || '').replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return /^[6-9]\d{9}$/.test(d) ? d : null
}
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
const isHttps = (v) => {
  try {
    return new URL(v).protocol === 'https:'
  } catch {
    return false
  }
}

const MIME = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  png: 'image/png',
}
// "pdf", "docx", "jpg"... from the file name ("jpeg" counts as "jpg")
function fileExt(file) {
  const e = ((file.name || '').toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || ''
  return e === 'jpeg' ? 'jpg' : e
}
const mimeOf = (file) => MIME[fileExt(file)] || ''
const COVER_EXTS = ['pdf', 'jpg', 'png']
const GUIDELINE_EXTS = ['pdf', 'doc', 'docx', 'jpg', 'png']
const thesisExts = (formatting) => (formatting ? ['doc', 'docx'] : ['pdf'])

function initialForm() {
  const draft = readJson('sessionStorage', DRAFT_KEY) || {}
  const pre = readJson('sessionStorage', 'acadmify.prefill') || {}
  const next = { ...EMPTY, ...draft, consent: false, website: '' }
  if (pre.totalPages) {
    next.totalPages = String(pre.totalPages)
    next.copies = String(pre.copies || next.copies)
    next.ohp = String(pre.ohp || 0)
  }
  const cover = pre.cover || readJson('sessionStorage', 'acadmify.cover')
  if (cover && COVERS.some((x) => x.id === cover)) next.cover = cover
  if (!COVERS.some((x) => x.id === next.cover)) next.cover = 'maroon'
  const lettering = pre.lettering || readJson('sessionStorage', 'acadmify.lettering')
  if (LETTERING.some((x) => x.id === lettering)) next.lettering = lettering
  if (!LETTERING.some((x) => x.id === next.lettering)) next.lettering = 'gold'
  return next
}

export default function Upload() {
  usePageMeta({
    title: 'Place your thesis order — Acadmify',
    description: 'Choose your thesis cover, lettering, pages and copies, see the exact price and order online. Pickup or doorstep delivery in Jodhpur.',
    path: '/upload',
  })

  const p = usePricing()
  const c = useContent()
  const wa = useWaLink()

  const [step, setStep] = useState(1)
  const [f, setF] = useState(initialForm)
  const [fileMode, setFileMode] = useState('upload')
  const [thesisFile, setThesisFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [guidelinesFile, setGuidelinesFile] = useState(null)
  const [pageCount, setPageCount] = useState(null)
  const [counting, setCounting] = useState(false)
  const [errors, setErrors] = useState({})
  const [dragOver, setDragOver] = useState(false)

  // form | creating | uploading | confirming | createFailed | uploadFailed | done
  const [phase, setPhase] = useState('form')
  const [slow, setSlow] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadingWhat, setUploadingWhat] = useState('thesis')
  const [failMsg, setFailMsg] = useState('')
  const [order, setOrder] = useState(null)
  const [copied, setCopied] = useState(false)
  const [paidNow, setPaidNow] = useState(false)

  const topRef = useRef(null)
  const countToken = useRef(0)

  useEffect(() => {
    wakeServer()
    removeKey('sessionStorage', 'acadmify.prefill')
  }, [])

  // Keep typed details if the page is refreshed (files cannot be kept)
  useEffect(() => {
    if (phase !== 'form') return
    const { consent, website, ...draft } = f
    writeJson('sessionStorage', DRAFT_KEY, draft)
  }, [f, phase])

  const q = calcQuote(f, p)
  const method = DELIVERY_METHODS.find((m) => m.id === f.deliveryMethod) || DELIVERY_METHODS[0]
  const wordFile = f.formatting
  const thesisWhat = wordFile ? 'Word file' : 'PDF'

  function set(key, value) {
    setF((s) => ({ ...s, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }
  const bind = (key) => ({
    id: 'u-' + key,
    value: f[key],
    onChange: (e) => set(key, e.target.value),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': 'u-' + key + '-hint',
  })

  function scrollTop() {
    requestAnimationFrame(() => topRef.current && topRef.current.scrollIntoView({ block: 'start' }))
  }

  // ─── Files ────────────────────────────────────────────────────────────────
  function thesisProblem(file, formatting) {
    if (!thesisExts(formatting).includes(fileExt(file))) {
      return formatting ? 'Please choose your Word file (.doc or .docx).' : 'Please choose a PDF file.'
    }
    if (file.size > MAX_PDF_MB * MB) {
      return 'This file is ' + formatBytes(file.size) + '. The limit is ' + MAX_PDF_MB + ' MB, so please share a Google Drive link instead.'
    }
    return null
  }

  async function pickThesis(file) {
    if (!file) return
    const problem = thesisProblem(file, f.formatting)
    if (problem) {
      setThesisFile(null)
      setErrors((e) => ({ ...e, thesisFile: problem }))
      return
    }
    setErrors((e) => ({ ...e, thesisFile: undefined }))
    setThesisFile(file)
    setPageCount(null)
    if (fileExt(file) !== 'pdf') return
    setCounting(true)
    const token = ++countToken.current
    await new Promise((r) => setTimeout(r, 30)) // let "Counting pages…" appear first
    const n = await countPdfPages(file)
    if (token !== countToken.current) return
    setCounting(false)
    setPageCount(n)
  }

  function pickCover(file) {
    if (!file) return
    const problem = !COVER_EXTS.includes(fileExt(file)) ? 'The cover design must be a PDF, JPG or PNG.'
      : file.size > MAX_COVER_MB * MB ? 'The cover design must be under ' + MAX_COVER_MB + ' MB.' : null
    if (problem) {
      setCoverFile(null)
      setErrors((e) => ({ ...e, coverFile: problem }))
      return
    }
    setErrors((e) => ({ ...e, coverFile: undefined }))
    setCoverFile(file)
  }

  function pickGuidelines(file) {
    if (!file) return
    const problem = !GUIDELINE_EXTS.includes(fileExt(file)) ? 'The guidelines must be a PDF, Word document, JPG or PNG.'
      : file.size > MAX_GUIDELINES_MB * MB ? 'The guidelines file must be under ' + MAX_GUIDELINES_MB + ' MB.' : null
    if (problem) {
      setGuidelinesFile(null)
      setErrors((e) => ({ ...e, guidelinesFile: problem }))
      return
    }
    setErrors((e) => ({ ...e, guidelinesFile: undefined }))
    setGuidelinesFile(file)
  }

  // ─── Validation (mirrors the backend) ─────────────────────────────────────
  function validate(s) {
    const e = {}
    if (s === 1) {
      const tp = Number(f.totalPages)
      const copies = Number(f.copies)
      const ohp = Number(f.ohp || 0)
      if (!Number.isInteger(tp) || tp < 1 || tp > 5000) e.totalPages = 'Please enter the number of pages in your thesis (1 to 5000).'
      if (!Number.isInteger(copies) || copies < 1 || copies > 100) e.copies = 'Copies must be between 1 and 100.'
      if (!Number.isInteger(ohp) || ohp < 0 || ohp > 100) e.ohp = 'OHP sheets must be between 0 and 100.'
      if (!e.totalPages && !e.copies && !q.eligible) {
        e.totalPages = 'For this size of order, please message us on WhatsApp for a price (see below).'
      }
    }
    if (s === 2) {
      if (f.name.trim().length < 2) e.name = 'Please enter your full name.'
      if (!normalisePhone(f.phone)) e.phone = 'Please enter a 10-digit mobile number.'
      if (f.email.trim() && !isEmail(f.email.trim())) e.email = 'Please check your email address.'
      if (fileMode === 'upload') {
        if (!thesisFile) e.thesisFile = errors.thesisFile || 'Please choose your thesis ' + thesisWhat + '.'
        else {
          const problem = thesisProblem(thesisFile, f.formatting)
          if (problem) e.thesisFile = problem
        }
      }
      if (fileMode === 'link' && !isHttps(f.fileLink.trim())) e.fileLink = 'Please paste a link that starts with https://'
      if (errors.coverFile) e.coverFile = errors.coverFile
      if (errors.guidelinesFile) e.guidelinesFile = errors.guidelinesFile
      if (f.deliveryMethod !== 'pickup' && f.address.trim().length < 10) e.address = 'Please enter your full address, with area and a landmark.'
    }
    if (s === 3 && !f.consent) e.consent = 'Please tick this box to place your order.'
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) {
      requestAnimationFrame(() => {
        const el = document.getElementById('u-' + first)
        if (el) el.focus()
      })
    }
    return !first
  }

  function next() {
    if (!validate(step)) return
    setStep(step + 1)
    scrollTop()
  }
  function back(to) {
    setErrors({})
    setStep(to || step - 1)
    scrollTop()
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  function payload() {
    const body = {
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      university: f.university.trim(),
      degree: f.degree,
      thesisTitle: f.thesisTitle.trim(),
      totalPages: Number(f.totalPages),
      copies: Number(f.copies),
      ohp: Number(f.ohp || 0),
      binding: f.binding,
      coverColour: f.cover,
      lettering: f.lettering,
      formatting: f.formatting === true,
      deliveryMethod: f.deliveryMethod,
      address: f.deliveryMethod === 'pickup' ? '' : f.address.trim(),
      requiredBy: f.requiredBy || null,
      instructions: f.instructions.trim(),
      consent: f.consent === true,
      website: f.website,
    }
    if (fileMode === 'link') body.fileLink = f.fileLink.trim()
    else body.thesisFile = { name: thesisFile.name, size: thesisFile.size, type: mimeOf(thesisFile) }
    if (coverFile) body.coverFile = { name: coverFile.name, size: coverFile.size, type: mimeOf(coverFile) }
    if (guidelinesFile) body.guidelinesFile = { name: guidelinesFile.name, size: guidelinesFile.size, type: mimeOf(guidelinesFile) }
    return body
  }

  async function sendFile(what, url, file) {
    setUploadingWhat(what)
    setProgress(0)
    setPhase('uploading')
    await putFile(url, file, { contentType: mimeOf(file), onProgress: setProgress })
  }

  async function runUploads(created, uploads) {
    try {
      if (uploads.thesis && thesisFile && fileMode === 'upload') await sendFile('thesis', uploads.thesis.signedUrl, thesisFile)
      if (uploads.cover && coverFile) await sendFile('cover', uploads.cover.signedUrl, coverFile)
      if (uploads.guidelines && guidelinesFile) await sendFile('guidelines', uploads.guidelines.signedUrl, guidelinesFile)
      if (uploads.thesis || uploads.cover || uploads.guidelines) {
        setPhase('confirming')
        await confirmUpload(created.orderId, created.clientToken)
      }
      removeKey('sessionStorage', DRAFT_KEY)
      setPhase('done')
      scrollTop()
    } catch (err) {
      setFailMsg(err.message)
      setPhase('uploadFailed')
      scrollTop()
    }
  }

  async function submit() {
    if (!validate(3)) return
    setFailMsg('')
    setSlow(false)
    setPhase('creating')
    scrollTop()
    const slowTimer = setTimeout(() => setSlow(true), 5000)
    let created
    try {
      created = await createOrder(payload())
    } catch (err) {
      clearTimeout(slowTimer)
      setFailMsg(err.message)
      setPhase('createFailed')
      return
    }
    clearTimeout(slowTimer)
    setOrder(created)
    trackEvent('generate_lead', { value: created.quote.total, currency: 'INR' })
    await runUploads(created, created.uploads || {})
  }

  async function retryUpload() {
    setFailMsg('')
    setPhase('creating')
    try {
      const { uploads } = await freshUploadUrls(order.orderId, {
        clientToken: order.clientToken,
        thesis: fileMode === 'upload' && Boolean(thesisFile),
        thesisExt: thesisFile ? fileExt(thesisFile) : null,
        coverExt: coverFile ? fileExt(coverFile) : null,
        guidelinesExt: guidelinesFile ? fileExt(guidelinesFile) : null,
      })
      await runUploads(order, uploads || {})
    } catch (err) {
      setFailMsg(err.message)
      setPhase('uploadFailed')
    }
  }

  function startOver() {
    removeKey('sessionStorage', DRAFT_KEY)
    setF({ ...EMPTY, cover: f.cover, lettering: f.lettering })
    setThesisFile(null)
    setCoverFile(null)
    setGuidelinesFile(null)
    setPageCount(null)
    setOrder(null)
    setPaidNow(false)
    setErrors({})
    setStep(1)
    setPhase('form')
    scrollTop()
  }

  async function copyId() {
    try {
      await navigator.clipboard.writeText(order.orderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked: the number is on screen anyway
    }
  }

  // ─── WhatsApp messages ────────────────────────────────────────────────────
  const orderSummary =
    q.totalPages + ' pages × ' + plural(q.copies, 'copy', 'copies') +
    (q.ohp ? ', ' + q.ohp + ' OHP sheets' : '') + ', ' + bindingLabel(f.binding).toLowerCase() + ', ' +
    coverById(f.cover).label.toLowerCase() + ' cover with ' + letteringLabel(f.lettering).toLowerCase() + ' lettering' +
    (q.formatting ? ', with thesis formatting' : '')

  const waQuote = wa('Hello Acadmify! I would like a price for my thesis: ' + orderSummary + '.')
  const waCreateFailed = wa(
    'Hello Acadmify! I tried to order on the website but it did not go through.\n' +
    'Name: ' + f.name + '\nPhone: ' + f.phone + '\n' + orderSummary + ', ' + method.label.toLowerCase() +
    (f.deliveryMethod !== 'pickup' && f.address ? '\nAddress: ' + f.address : '') +
    '\nI will send my file here.'
  )
  const waUploadFailed = order && wa(
    'Hello Acadmify! My order ' + order.orderId + ' was created, but the file upload did not finish. I will send my file here.'
  )
  const waDone = order && wa(
    'Hello Acadmify! I have placed order ' + order.orderId + ': ' + orderSummary + '. Total ' + rupees(order.quote.total) + '. ' +
    (paidNow ? 'I have paid online.' : 'I have a question before paying.')
  )

  // ─── Screens ──────────────────────────────────────────────────────────────
  const busy = phase === 'creating' || phase === 'uploading' || phase === 'confirming'
  const hasUploads = (fileMode === 'upload' && thesisFile) || coverFile || guidelinesFile
  const uploadLabel = { thesis: 'thesis', cover: 'cover design', guidelines: 'guidelines' }[uploadingWhat]

  if (phase === 'done' && order) {
    return (
      <div className="page page-narrow" ref={topRef}>
        <div className="done-card">
          <span className="done-badge" aria-hidden="true"><IconCheck size={30} /></span>
          <h1>{paidNow ? 'Order confirmed' : 'Order saved: one step left'}</h1>
          <p className="done-label">Your order number</p>
          <p className="order-id num">
            {order.orderId}
            <button type="button" className="btn btn-ghost btn-sm" onClick={copyId}>
              <IconCopy size={16} /> {copied ? 'Copied' : 'Copy'}
            </button>
          </p>
          {!paidNow && (
            <p>
              Pay <strong className="num">{rupees(order.quote.total)}</strong> online to confirm your order. We start printing once
              payment is received.
            </p>
          )}
          <PayOnline orderId={order.orderId} auth={{ clientToken: order.clientToken }} total={order.quote.total}
            customer={{ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() }}
            onPaid={() => setPaidNow(true)}
            fallback={<p className="note-warn">Online payment is not available right now. Please message us on WhatsApp to pay for this order.</p>} />

          <a className={'btn btn-block ' + (paidNow ? 'btn-wa btn-lg' : 'btn-outline')} href={waDone} target="_blank" rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { place: 'order_done' })}>
            <IconWhatsApp size={20} /> {paidNow ? 'Send order details on WhatsApp' : 'Questions? Ask us on WhatsApp'}
          </a>

          <h2>What happens next</h2>
          <ol className="next-steps">
            <li>
              {paidNow
                ? 'Payment received, so your order is confirmed.'
                : 'Pay online to confirm your order. If you leave now, you can pay later from the Track page.'}
            </li>
            <li>We check your file. If anything needs to be clarified, we will chat with you on WhatsApp or email.</li>
            <li>We print and bind your thesis. Usually ready in 24–48 hours.</li>
            <li>
              {f.deliveryMethod === 'pickup'
                ? 'Collect it from our shop (' + c('contact_hours') + ').'
                : f.deliveryMethod === 'doorstep'
                  ? 'A Rapido rider brings it to you. You pay the rider’s fare on delivery.'
                  : 'We send it by courier. Charges are confirmed on WhatsApp.'}
            </li>
          </ol>
          <p className="btn-row center">
            <Link to={'/track?id=' + encodeURIComponent(order.orderId)} className="btn btn-outline">Track this order</Link>
            <button type="button" className="btn btn-ghost" onClick={startOver}>Place another order</button>
          </p>
        </div>
      </div>
    )
  }

  if (busy) {
    const pct = Math.round(progress * 100)
    return (
      <div className="page page-narrow" ref={topRef}>
        <div className="progress-card" role="status" aria-live="polite">
          <h1>Placing your order…</h1>
          <ol className="progress-steps">
            <li className={phase === 'creating' ? 'is-active' : 'is-done'}>Saving your order</li>
            {hasUploads && (
              <li className={phase === 'uploading' ? 'is-active' : phase === 'confirming' ? 'is-done' : ''}>
                Uploading your {uploadLabel}
                {phase === 'uploading' ? ' — ' + pct + '%' : ''}
              </li>
            )}
            {hasUploads && <li className={phase === 'confirming' ? 'is-active' : ''}>Checking the files arrived</li>}
          </ol>
          {phase === 'uploading' && (
            <div className="progress-bar" aria-hidden="true"><span style={{ width: pct + '%' }} /></div>
          )}
          {slow && phase === 'creating' && (
            <p className="note-warn">Waking up our server. The first order of the day can take up to a minute.</p>
          )}
          <p className="hint">Please keep this page open until it finishes.</p>
        </div>
      </div>
    )
  }

  if (phase === 'createFailed') {
    return (
      <div className="page page-narrow" ref={topRef}>
        <div className="alert-card alert-error" role="alert">
          <h1>Your order was not placed</h1>
          <p>{failMsg}</p>
          <p>Nothing was saved and you have not been charged. You can try again, or send your details to us on WhatsApp.</p>
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={submit}>Try again</button>
            <a className="btn btn-wa" href={waCreateFailed} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp size={18} /> Send details on WhatsApp
            </a>
            <button type="button" className="btn btn-ghost" onClick={() => setPhase('form')}>Back to the form</button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'uploadFailed' && order) {
    return (
      <div className="page page-narrow" ref={topRef}>
        <div className="alert-card alert-warn" role="alert">
          <h1>Your file did not finish uploading</h1>
          <p>
            Your order <strong className="num">{order.orderId}</strong> was saved, but the upload stopped: {failMsg}
          </p>
          <p>Keep this page open and try again, or send the file to us on WhatsApp with your order number.</p>
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={retryUpload}>Retry upload</button>
            <a className="btn btn-wa" href={waUploadFailed} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp size={18} /> Send file on WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  // The price column: a total when the order can be priced online, a WhatsApp prompt when it cannot
  const priceAside = (
    <aside className="form-aside" aria-label="Your price">
      <h2 className="aside-title">Your price</h2>
      {!q.valid ? (
        <div className="quote-empty"><p>Enter the pages in your thesis to see the price.</p></div>
      ) : !q.eligible ? (
        <div className="quote-empty">
          <p>
            Online prices are for theses of {p.min_pages} or more pages and {p.min_copies} or more copies.
            For this order, message us and we will quote you.
          </p>
          <a className="btn btn-wa btn-block" href={waQuote} target="_blank" rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { place: 'order_quote' })}>
            <IconWhatsApp size={18} /> Get a price on WhatsApp
          </a>
        </div>
      ) : (
        <QuoteBreakdown q={q} />
      )}
    </aside>
  )

  // ─── The form ─────────────────────────────────────────────────────────────
  return (
    <div className="page" ref={topRef}>
      <div className="container">
        <header className="page-head">
          <h1>Place your thesis order</h1>
          <p>Three short steps, then pay securely online to confirm your order.</p>
        </header>

        <ol className="stepper" aria-label="Order progress">
          {STEPS.map((label, i) => (
            <li key={label} className={i + 1 < step ? 'is-done' : i + 1 === step ? 'is-current' : ''} aria-current={i + 1 === step ? 'step' : undefined}>
              <span className="stepper-num">{i + 1 < step ? <IconCheck size={16} /> : i + 1}</span>
              <span className="stepper-label">{label}</span>
            </li>
          ))}
        </ol>

        {step === 1 && (
          <div className="form-split">
            <div className="form-card">
              <h2>Thesis cover</h2>
              <div className="cover-row">
                <Book cover={f.cover} lettering={f.lettering} size="sm" />
                <div className="cover-options">
                  <CoverPicker value={f.cover} onChange={(id) => set('cover', id)} name="order-cover" legend="Cover" />
                  <LetteringPicker value={f.lettering} onChange={(id) => set('lettering', id)} name="order-lettering" />
                </div>
              </div>
              {f.cover === 'laminated' && (
                <p className="hint">For a laminated colour-printed cover, you can upload your cover design in the next step.</p>
              )}
              <Field id="u-thesisTitle" label="Text for the cover and spine" optional
                hint="For example the thesis title, your name, university and year.">
                <textarea {...bind('thesisTitle')} rows={3} maxLength={200} />
              </Field>

              <h2>Your thesis</h2>
              <div className="field-row cols-3 tight">
                <Field id="u-totalPages" label="Pages in thesis" error={errors.totalPages}>
                  <input {...bind('totalPages')} type="number" inputMode="numeric" min="1" max="5000" />
                </Field>
                <Field id="u-copies" label="Copies" error={errors.copies}>
                  <input {...bind('copies')} type="number" inputMode="numeric" min="1" max="100" />
                </Field>
                <Field id="u-ohp" label="OHP transparent sheets" error={errors.ohp} hint={rupees(p.ohp_per_sheet) + ' each, per copy'}>
                  <input {...bind('ohp')} type="number" inputMode="numeric" min="0" max="100" />
                </Field>
              </div>
              <p className="hint">Printing is {rupees(p.print_per_page)} per page, colour or black &amp; white, on {c('paper_spec')}.</p>

              <h2>Binding</h2>
              <div className="segmented" role="radiogroup" aria-label="Binding">
                {BINDINGS.map((b) => (
                  <label key={b.id} className={f.binding === b.id ? 'is-on' : ''}>
                    <input type="radio" name="u-binding" value={b.id} checked={f.binding === b.id} onChange={() => set('binding', b.id)} />
                    {b.label} · {rupees(b.id === 'hardbound' ? p.hard_binding : p.soft_binding)} per copy
                  </label>
                ))}
              </div>

              {p.formatting_fee > 0 && (
                <div className="field">
                  <label className="check">
                    <input id="u-formatting" type="checkbox" checked={f.formatting} onChange={(e) => set('formatting', e.target.checked)} />
                    <span>
                      Format my thesis before printing ({rupees(p.formatting_fee)} per thesis)
                      <span className="hint">Word file required. You will upload it in the next step.</span>
                    </span>
                  </label>
                </div>
              )}

              {q.valid && !q.eligible && (
                <p className="note-warn">
                  Online prices are for theses of {p.min_pages} or more pages and {p.min_copies} or more copies. For this order, please{' '}
                  <a href={waQuote} target="_blank" rel="noopener noreferrer">message us on WhatsApp</a> and we will quote you.
                </p>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={next}>Continue</button>
              </div>
            </div>
            {priceAside}
          </div>
        )}

        {step === 2 && (
          <div className="form-split">
            <div className="form-card">
              <h2>Your details</h2>
              <div className="field-row cols-2">
                <Field id="u-name" label="Full name" error={errors.name}>
                  <input {...bind('name')} autoComplete="name" maxLength={80} />
                </Field>
                <Field id="u-phone" label="Mobile number" hint="We chat with you on this WhatsApp number if we have a question." error={errors.phone}>
                  <input {...bind('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" maxLength={16} />
                </Field>
              </div>
              <div className="field-row cols-3">
                <Field id="u-email" label="Email" optional error={errors.email}>
                  <input {...bind('email')} type="email" autoComplete="email" maxLength={120} />
                </Field>
                <Field id="u-university" label="University / college" optional>
                  <input {...bind('university')} maxLength={120} placeholder="e.g. JNVU Jodhpur" />
                </Field>
                <Field id="u-degree" label="Degree">
                  <select {...bind('degree')}>
                    {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>

              <h2>{wordFile ? 'Your Word file' : 'Your thesis file'}</h2>
              <div className="segmented" role="radiogroup" aria-label="How will you send the file?">
                <label className={fileMode === 'upload' ? 'is-on' : ''}>
                  <input type="radio" name="file-mode" checked={fileMode === 'upload'} onChange={() => setFileMode('upload')} />
                  Upload {thesisWhat} (up to {MAX_PDF_MB} MB)
                </label>
                <label className={fileMode === 'link' ? 'is-on' : ''}>
                  <input type="radio" name="file-mode" checked={fileMode === 'link'} onChange={() => setFileMode('link')} />
                  File too large? Share a link
                </label>
              </div>

              {fileMode === 'upload' ? (
                <div className={'field' + (errors.thesisFile ? ' has-error' : '')}>
                  <label
                    htmlFor="u-thesisFile"
                    className={'dropzone' + (dragOver ? ' is-over' : '') + (thesisFile ? ' has-file' : '')}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); pickThesis(e.dataTransfer.files[0]) }}
                  >
                    {thesisFile ? <IconFile size={28} /> : <IconUpload size={28} />}
                    {thesisFile ? (
                      <span>
                        <strong className="file-name">{thesisFile.name}</strong>
                        <span className="hint">
                          {formatBytes(thesisFile.size)}
                          {counting ? ' · Counting pages…' : pageCount ? ' · ' + pageCount + ' pages' : ''}
                          {' · Tap to change'}
                        </span>
                      </span>
                    ) : (
                      <span>
                        <strong>Choose your thesis {thesisWhat}</strong>
                        <span className="hint">or drag it here · {wordFile ? '.doc or .docx' : 'PDF only'}, up to {MAX_PDF_MB} MB</span>
                      </span>
                    )}
                    <input
                      id="u-thesisFile"
                      className="sr-only"
                      type="file"
                      accept={wordFile ? '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf,.pdf'}
                      aria-describedby="u-thesisFile-hint"
                      onChange={(e) => pickThesis(e.target.files[0])}
                    />
                  </label>
                  {errors.thesisFile && <p className="field-error" id="u-thesisFile-hint" role="alert">{errors.thesisFile}</p>}
                  {!errors.thesisFile && pageCount && Number(f.totalPages) !== pageCount && (
                    <p className="hint" id="u-thesisFile-hint">
                      This PDF has {pageCount} pages, but you entered {f.totalPages}. If that is a mistake, go back and correct it. Otherwise we will chat with you.
                    </p>
                  )}
                </div>
              ) : (
                <Field id="u-fileLink" label={wordFile ? 'Link to your Word file' : 'Link to your PDF'}
                  hint="Google Drive, OneDrive or Dropbox. Set sharing to “Anyone with the link”." error={errors.fileLink}>
                  <input {...bind('fileLink')} type="url" inputMode="url" placeholder="https://drive.google.com/…" maxLength={500} />
                </Field>
              )}

              {f.cover === 'laminated' && (
                <div className={'field' + (errors.coverFile ? ' has-error' : '')}>
                  <label htmlFor="u-coverFile">Your cover design <span className="optional">(for the laminated cover)</span></label>
                  <input id="u-coverFile" type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
                    onChange={(e) => pickCover(e.target.files[0])} aria-describedby="u-coverFile-hint" />
                  {errors.coverFile
                    ? <p className="field-error" id="u-coverFile-hint" role="alert">{errors.coverFile}</p>
                    : <p className="hint" id="u-coverFile-hint">PDF, JPG or PNG up to {MAX_COVER_MB} MB. You can also send it on WhatsApp later.</p>}
                </div>
              )}

              <div className={'field' + (errors.guidelinesFile ? ' has-error' : '')}>
                <label htmlFor="u-guidelinesFile">University thesis guidelines <span className="optional">(optional)</span></label>
                <input id="u-guidelinesFile" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={(e) => pickGuidelines(e.target.files[0])} aria-describedby="u-guidelinesFile-hint" />
                {errors.guidelinesFile
                  ? <p className="field-error" id="u-guidelinesFile-hint" role="alert">{errors.guidelinesFile}</p>
                  : <p className="hint" id="u-guidelinesFile-hint">If your university gave you guidelines for the thesis, upload them here. PDF, Word, JPG or PNG up to {MAX_GUIDELINES_MB} MB.</p>}
              </div>

              <Field id="u-instructions" label="Instructions for printing" optional
                hint="Anything we should know, such as where OHP sheets go, special pages, or your submission rules.">
                <textarea {...bind('instructions')} rows={3} maxLength={1000} />
              </Field>

              <ConfidentialityNote />

              <h2>Pickup or delivery</h2>
              <fieldset className="field choice-list">
                <legend className="sr-only">Pickup or delivery</legend>
                {DELIVERY_METHODS.map((m) => (
                  <label key={m.id} className={'choice' + (f.deliveryMethod === m.id ? ' is-on' : '')}>
                    <input type="radio" name="u-delivery" value={m.id} checked={f.deliveryMethod === m.id}
                      onChange={(e) => set('deliveryMethod', e.target.value)} />
                    <span>
                      <strong>{m.label}</strong>
                      <span className="hint">{m.note}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              {f.deliveryMethod !== 'pickup' && (
                <Field id="u-address" label="Delivery address" error={errors.address}
                  hint={f.deliveryMethod === 'doorstep' ? 'House number, area and a landmark help the rider find you.' : 'Full address with city, state and PIN code.'}>
                  <textarea {...bind('address')} rows={3} autoComplete="street-address" maxLength={500} />
                </Field>
              )}
              <div className="field-row cols-2">
                <Field id="u-requiredBy" label="Needed by" optional hint="Your submission date, if you have one.">
                  <input {...bind('requiredBy')} type="date" />
                </Field>
              </div>
              <p className="hint">If we have any query or find a discrepancy in your file, we will chat with you on WhatsApp or email.</p>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => back()}>Back</button>
                <button type="button" className="btn btn-primary btn-lg" onClick={next}>Review your order</button>
              </div>
            </div>
            {priceAside}
          </div>
        )}

        {step === 3 && (
          <div className="form-split">
            <div className="form-card">
              <h2>Check your order</h2>
              <div className="review-block">
                <div className="review-head">
                  <h3>Print options</h3>
                  <button type="button" className="link-btn" onClick={() => back(1)}>Edit</button>
                </div>
                <dl className="review-list">
                  <div>
                    <dt>Cover</dt>
                    <dd><span className="swatch-inline" style={{ background: coverById(f.cover).hex }} /> {coverById(f.cover).label}, {letteringLabel(f.lettering).toLowerCase()} lettering</dd>
                  </div>
                  {f.thesisTitle && <div><dt>Cover text</dt><dd className="pre">{f.thesisTitle}</dd></div>}
                  <div><dt>Pages</dt><dd>{q.totalPages}</dd></div>
                  <div><dt>Copies</dt><dd>{q.copies}</dd></div>
                  {q.ohp > 0 && <div><dt>OHP sheets</dt><dd>{q.ohp} per copy</dd></div>}
                  <div><dt>Binding</dt><dd>{bindingLabel(f.binding)}</dd></div>
                  {f.formatting && <div><dt>Formatting</dt><dd>Yes, {rupees(p.formatting_fee)}</dd></div>}
                </dl>
              </div>
              <div className="review-block">
                <div className="review-head">
                  <h3>Your details</h3>
                  <button type="button" className="link-btn" onClick={() => back(2)}>Edit</button>
                </div>
                <dl className="review-list">
                  <div><dt>Name</dt><dd>{f.name}</dd></div>
                  <div><dt>Mobile</dt><dd>{f.phone}</dd></div>
                  {f.email && <div><dt>Email</dt><dd>{f.email}</dd></div>}
                  <div><dt>Degree</dt><dd>{f.degree}{f.university ? ', ' + f.university : ''}</dd></div>
                  <div>
                    <dt>{wordFile ? 'Word file' : 'Thesis file'}</dt>
                    <dd>{fileMode === 'link' ? f.fileLink : thesisFile && thesisFile.name + ' (' + formatBytes(thesisFile.size) + ')'}</dd>
                  </div>
                  {coverFile && f.cover === 'laminated' && <div><dt>Cover design</dt><dd>{coverFile.name}</dd></div>}
                  {guidelinesFile && <div><dt>Guidelines</dt><dd>{guidelinesFile.name}</dd></div>}
                  {f.instructions && <div><dt>Instructions</dt><dd className="pre">{f.instructions}</dd></div>}
                  <div><dt>Delivery</dt><dd>{method.label}{f.deliveryMethod !== 'pickup' ? ': ' + f.address : ''}</dd></div>
                  {f.requiredBy && <div><dt>Needed by</dt><dd>{f.requiredBy}</dd></div>}
                </dl>
              </div>

              <div className={'field consent' + (errors.consent ? ' has-error' : '')}>
                <label className="check">
                  <input id="u-consent" type="checkbox" checked={f.consent}
                    onChange={(e) => set('consent', e.target.checked)} aria-describedby="u-consent-hint" />
                  <span>
                    This is my own work, or I have the right to have it printed. I agree to the{' '}
                    <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy policy</Link>.
                  </span>
                </label>
                {errors.consent && <p className="field-error" id="u-consent-hint" role="alert">{errors.consent}</p>}
              </div>

              {/* Hidden from people; bots fill it in and get rejected */}
              <div className="hp" aria-hidden="true">
                <label htmlFor="u-website">Leave this empty</label>
                <input id="u-website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => back()}>Back</button>
                <button type="button" className="btn btn-primary btn-lg" onClick={submit}>Place order and pay</button>
              </div>
              <p className="hint">On the next screen you pay online (UPI, card, net banking or wallet). We start printing once payment is received.</p>
            </div>

            {priceAside}
          </div>
        )}
      </div>
    </div>
  )
}
