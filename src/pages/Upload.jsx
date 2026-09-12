// Place an order in three steps: details + file -> print options -> review.
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
import { COVERS, coverById, LETTERING, letteringLabel, DEGREES, DELIVERY_METHODS, MAX_PDF_MB, MAX_COVER_MB } from '../constants.js'
import Field from '../components/Field.jsx'
import QuoteBreakdown from '../components/QuoteBreakdown.jsx'
import { Book, CoverPicker, LetteringPicker } from '../components/HeroBook.jsx'
import ConfidentialityNote from '../components/ConfidentialityNote.jsx'
import { IconUpload, IconFile, IconCheck, IconCopy, IconWhatsApp } from '../components/Icons.jsx'

const MB = 1048576
const DRAFT_KEY = 'acadmify.draft'
const STEPS = ['Your details', 'Print options', 'Review & submit']

const EMPTY = {
  name: '', phone: '', email: '', university: '', degree: 'PhD', fileLink: '',
  totalPages: '', colourPages: '0', copies: '1', ohp: '0', cover: 'maroon', thesisTitle: '',
  lettering: 'gold', formatting: false,
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
const isPdf = (file) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
function coverMime(file) {
  const n = file.name.toLowerCase()
  if (file.type === 'application/pdf' || n.endsWith('.pdf')) return 'application/pdf'
  if (file.type === 'image/png' || n.endsWith('.png')) return 'image/png'
  if (/image\/jpe?g/.test(file.type) || /\.jpe?g$/.test(n)) return 'image/jpeg'
  return ''
}
const EXT = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg' }

function initialForm() {
  const draft = readJson('sessionStorage', DRAFT_KEY) || {}
  const pre = readJson('sessionStorage', 'acadmify.prefill') || {}
  const next = { ...EMPTY, ...draft, consent: false, website: '' }
  if (pre.totalPages) {
    next.totalPages = String(pre.totalPages)
    next.colourPages = String(pre.colourPages || 0)
    next.copies = String(pre.copies || 1)
    next.ohp = String(pre.ohp || 0)
  }
  if (pre.deliveryMethod) next.deliveryMethod = pre.deliveryMethod
  const cover = pre.cover || readJson('sessionStorage', 'acadmify.cover')
  if (cover && COVERS.some((x) => x.id === cover)) next.cover = cover
  if (pre.formatting) next.formatting = true
  const lettering = pre.lettering || readJson('sessionStorage', 'acadmify.lettering')
  if (LETTERING.some((x) => x.id === lettering)) next.lettering = lettering
  return next
}

export default function Upload() {
  usePageMeta({
    title: 'Upload your thesis — Acadmify',
    description: 'Upload your thesis PDF, choose copies, colour pages and cover colour, and see the exact price. Pickup or doorstep delivery in Jodhpur.',
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

  const q = calcQuote({ ...f, binding: 'hardbound' }, p)
  const method = DELIVERY_METHODS.find((m) => m.id === f.deliveryMethod) || DELIVERY_METHODS[0]

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
  async function pickThesis(file) {
    if (!file) return
    const problem = !isPdf(file)
      ? 'Please choose a PDF file.'
      : file.size > MAX_PDF_MB * MB
        ? 'This PDF is ' + formatBytes(file.size) + '. The limit is ' + MAX_PDF_MB + ' MB, so please share a Google Drive link instead.'
        : null
    if (problem) {
      setThesisFile(null)
      setErrors((e) => ({ ...e, thesisFile: problem }))
      return
    }
    setErrors((e) => ({ ...e, thesisFile: undefined }))
    setThesisFile(file)
    setPageCount(null)
    setCounting(true)
    const token = ++countToken.current
    await new Promise((r) => setTimeout(r, 30)) // let "Counting pages…" appear first
    const n = await countPdfPages(file)
    if (token !== countToken.current) return
    setCounting(false)
    setPageCount(n)
    if (n) setF((s) => ({ ...s, totalPages: String(n), colourPages: Number(s.colourPages) > n ? '0' : s.colourPages }))
  }

  function pickCover(file) {
    if (!file) return
    const mime = coverMime(file)
    const problem = !mime ? 'The cover page must be a PDF, JPG or PNG.'
      : file.size > MAX_COVER_MB * MB ? 'The cover page must be under ' + MAX_COVER_MB + ' MB.' : null
    if (problem) {
      setCoverFile(null)
      setErrors((e) => ({ ...e, coverFile: problem }))
      return
    }
    setErrors((e) => ({ ...e, coverFile: undefined }))
    setCoverFile(file)
  }

  // ─── Validation (mirrors the backend) ─────────────────────────────────────
  function validate(s) {
    const e = {}
    if (s === 1) {
      if (f.name.trim().length < 2) e.name = 'Please enter your full name.'
      if (!normalisePhone(f.phone)) e.phone = 'Please enter a 10-digit mobile number.'
      if (f.email.trim() && !isEmail(f.email.trim())) e.email = 'Please check your email address.'
      if (fileMode === 'upload' && !thesisFile) e.thesisFile = errors.thesisFile || 'Please choose your thesis PDF.'
      if (fileMode === 'link' && !isHttps(f.fileLink.trim())) e.fileLink = 'Please paste a link that starts with https://'
      if (errors.coverFile) e.coverFile = errors.coverFile
    }
    if (s === 2) {
      const tp = Number(f.totalPages)
      const cp = Number(f.colourPages || 0)
      const copies = Number(f.copies)
      const ohp = Number(f.ohp || 0)
      if (!Number.isInteger(tp) || tp < 1 || tp > 5000) e.totalPages = 'Please enter the total number of pages (1 to 5000).'
      if (!Number.isInteger(cp) || cp < 0 || cp > tp) e.colourPages = 'Colour pages must be between 0 and your total pages.'
      if (!Number.isInteger(copies) || copies < 1 || copies > 100) e.copies = 'Copies must be between 1 and 100.'
      if (!Number.isInteger(ohp) || ohp < 0 || ohp > 100) e.ohp = 'OHP sheets must be between 0 and 100.'
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
      colourPages: Number(f.colourPages || 0),
      copies: Number(f.copies),
      ohp: Number(f.ohp || 0),
      binding: 'hardbound',
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
    else body.thesisFile = { name: thesisFile.name, size: thesisFile.size, type: 'application/pdf' }
    if (coverFile) body.coverFile = { name: coverFile.name, size: coverFile.size, type: coverMime(coverFile) }
    return body
  }

  async function runUploads(created, uploads) {
    try {
      if (uploads.thesis && thesisFile && fileMode === 'upload') {
        setUploadingWhat('thesis')
        setProgress(0)
        setPhase('uploading')
        await putFile(uploads.thesis.signedUrl, thesisFile, { contentType: 'application/pdf', onProgress: setProgress })
      }
      if (uploads.cover && coverFile) {
        setUploadingWhat('cover')
        setProgress(0)
        setPhase('uploading')
        await putFile(uploads.cover.signedUrl, coverFile, { contentType: coverMime(coverFile), onProgress: setProgress })
      }
      if (uploads.thesis || uploads.cover) {
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
        coverExt: coverFile ? EXT[coverMime(coverFile)] : null,
      })
      await runUploads(order, uploads || {})
    } catch (err) {
      setFailMsg(err.message)
      setPhase('uploadFailed')
    }
  }

  function startOver() {
    removeKey('sessionStorage', DRAFT_KEY)
    setF({ ...EMPTY, cover: f.cover })
    setThesisFile(null)
    setCoverFile(null)
    setPageCount(null)
    setOrder(null)
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
    q.totalPages + ' pages (' + q.colourPages + ' colour) × ' + plural(q.copies, 'copy', 'copies') +
    (q.ohp ? ', ' + q.ohp + ' OHP sheets' : '') + ', ' + coverById(f.cover).label.toLowerCase() + ' cover with ' +
    letteringLabel(f.lettering).toLowerCase() + ' lettering, ' + (q.formatting ? 'with thesis formatting, ' : '') +
    method.label.toLowerCase()

  const waCreateFailed = wa(
    'Hello Acadmify! I tried to order on the website but it did not go through.\n' +
    'Name: ' + f.name + '\nPhone: ' + f.phone + '\n' + orderSummary +
    (f.deliveryMethod !== 'pickup' && f.address ? '\nAddress: ' + f.address : '') +
    '\nI will send my PDF here.'
  )
  const waUploadFailed = order && wa(
    'Hello Acadmify! My order ' + order.orderId + ' was created, but the file upload did not finish. I will send my PDF here.'
  )
  const waDone = order && wa(
    'Hello Acadmify! I have placed order ' + order.orderId + ': ' + orderSummary + '. Total ' + rupees(order.quote.total) +
    '. Please confirm and share payment details.'
  )

  // ─── Screens ──────────────────────────────────────────────────────────────
  const busy = phase === 'creating' || phase === 'uploading' || phase === 'confirming'
  const hasUploads = (fileMode === 'upload' && thesisFile) || coverFile

  if (phase === 'done' && order) {
    const upiId = c('upi_id')
    const upiLink = upiId
      ? 'upi://pay?pa=' + encodeURIComponent(upiId) + '&pn=' + encodeURIComponent(c('upi_name')) +
        '&am=' + order.quote.total + '&cu=INR&tn=' + encodeURIComponent('Acadmify ' + order.orderId)
      : ''
    return (
      <div className="page page-narrow" ref={topRef}>
        <div className="done-card">
          <span className="done-badge" aria-hidden="true"><IconCheck size={30} /></span>
          <h1>Order placed</h1>
          <p className="done-label">Your order number</p>
          <p className="order-id num">
            {order.orderId}
            <button type="button" className="btn btn-ghost btn-sm" onClick={copyId}>
              <IconCopy size={16} /> {copied ? 'Copied' : 'Copy'}
            </button>
          </p>
          <p>Total <strong className="num">{rupees(order.quote.total)}</strong>. Nothing to pay yet.</p>

          <a className="btn btn-wa btn-lg btn-block" href={waDone} target="_blank" rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { place: 'order_done' })}>
            <IconWhatsApp size={20} /> Send order details on WhatsApp
          </a>
          {upiLink && (
            <a className="btn btn-outline btn-block" href={upiLink}>Pay {rupees(order.quote.total)} by UPI</a>
          )}

          <h2>What happens next</h2>
          <ol className="next-steps">
            <li>We check your file and confirm your order on WhatsApp.</li>
            <li>We share payment details there (UPI or cash).</li>
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
                Uploading your {uploadingWhat === 'cover' ? 'cover page' : 'thesis'}
                {phase === 'uploading' ? ' — ' + pct + '%' : ''}
              </li>
            )}
            {hasUploads && <li className={phase === 'confirming' ? 'is-active' : ''}>Checking the file arrived</li>}
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
          <p>Keep this page open and try again, or send the PDF to us on WhatsApp with your order number.</p>
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={retryUpload}>Retry upload</button>
            <a className="btn btn-wa" href={waUploadFailed} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp size={18} /> Send PDF on WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ─── The form ─────────────────────────────────────────────────────────────
  return (
    <div className="page" ref={topRef}>
      <div className="container">
        <header className="page-head">
          <h1>Upload your thesis</h1>
          <p>Three short steps. Nothing to pay now: we confirm on WhatsApp first.</p>
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
          <div className="form-card">
            <h2>Your details</h2>
            <div className="field-row cols-2">
              <Field id="u-name" label="Full name" error={errors.name}>
                <input {...bind('name')} autoComplete="name" maxLength={80} />
              </Field>
              <Field id="u-phone" label="Mobile number" hint="We confirm your order on this WhatsApp number." error={errors.phone}>
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

            <h2>Your thesis file</h2>
            <div className="segmented" role="radiogroup" aria-label="How will you send the file?">
              <label className={fileMode === 'upload' ? 'is-on' : ''}>
                <input type="radio" name="file-mode" checked={fileMode === 'upload'} onChange={() => setFileMode('upload')} />
                Upload PDF (up to {MAX_PDF_MB} MB)
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
                      <strong>Choose your thesis PDF</strong>
                      <span className="hint">or drag it here · PDF only, up to {MAX_PDF_MB} MB</span>
                    </span>
                  )}
                  <input
                    id="u-thesisFile"
                    className="sr-only"
                    type="file"
                    accept="application/pdf,.pdf"
                    aria-describedby="u-thesisFile-hint"
                    onChange={(e) => pickThesis(e.target.files[0])}
                  />
                </label>
                {errors.thesisFile && <p className="field-error" id="u-thesisFile-hint" role="alert">{errors.thesisFile}</p>}
                {!errors.thesisFile && pageCount && (
                  <p className="hint" id="u-thesisFile-hint">We counted {pageCount} pages. You can change this on the next step.</p>
                )}
              </div>
            ) : (
              <Field id="u-fileLink" label="Link to your PDF" hint="Google Drive, OneDrive or Dropbox. Set sharing to “Anyone with the link”. A Word file is fine if you are ordering formatting." error={errors.fileLink}>
                <input {...bind('fileLink')} type="url" inputMode="url" placeholder="https://drive.google.com/…" maxLength={500} />
              </Field>
            )}

            <div className={'field' + (errors.coverFile ? ' has-error' : '')}>
              <label htmlFor="u-coverFile">Sample cover page <span className="optional">(optional)</span></label>
              <input id="u-coverFile" type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
                onChange={(e) => pickCover(e.target.files[0])} aria-describedby="u-coverFile-hint" />
              {errors.coverFile
                ? <p className="field-error" id="u-coverFile-hint" role="alert">{errors.coverFile}</p>
                : <p className="hint" id="u-coverFile-hint">PDF, JPG or PNG up to {MAX_COVER_MB} MB, if your university has a set cover format.</p>}
            </div>

            <ConfidentialityNote />

            <div className="form-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={next}>Continue to print options</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-split">
            <div className="form-card">
              <h2>Pages and copies</h2>
              <div className="field-row cols-3 tight">
                <Field id="u-totalPages" label="Total pages" error={errors.totalPages}
                  hint={pageCount ? 'Your PDF has ' + pageCount + ' pages.' : null}>
                  <input {...bind('totalPages')} type="number" inputMode="numeric" min="1" max="5000" />
                </Field>
                <Field id="u-colourPages" label="Colour pages" error={errors.colourPages}
                  hint="Pages with any colour on them.">
                  <input {...bind('colourPages')} type="number" inputMode="numeric" min="0" max="5000" />
                </Field>
                <div className="field">
                  <span className="label">B&amp;W pages</span>
                  <output className="output num">{q.bwPages}</output>
                </div>
              </div>
              <div className="field-row cols-2">
                <Field id="u-copies" label="Copies" error={errors.copies}>
                  <input {...bind('copies')} type="number" inputMode="numeric" min="1" max="100" />
                </Field>
                <Field id="u-ohp" label="OHP sheets per copy" optional error={errors.ohp}
                  hint={rupees(p.ohp_per_sheet) + ' each. Clear sheets placed before the title page, certificates or chapters.'}>
                  <input {...bind('ohp')} type="number" inputMode="numeric" min="0" max="100" />
                </Field>
              </div>

              <h2>Hardbound cover</h2>
              <div className="cover-row">
                <Book cover={f.cover} lettering={f.lettering} size="sm" />
                <div className="cover-options">
                  <CoverPicker value={f.cover} onChange={(id) => set('cover', id)} name="order-cover" />
                  <LetteringPicker value={f.lettering} onChange={(id) => set('lettering', id)} name="order-lettering" />
                </div>
              </div>
              <p className="hint">{c('hardbound_desc')}, {rupees(p.hard_binding)} per copy.</p>
              <Field id="u-thesisTitle" label="Text for the cover and spine" optional
                hint="For example the thesis title, your name, university and year. Or upload a sample cover page in step 1.">
                <textarea {...bind('thesisTitle')} rows={3} maxLength={200} />
              </Field>

              {p.formatting_fee > 0 && (
                <>
                  <h2>Thesis formatting</h2>
                  <div className="field">
                    <label className="check">
                      <input id="u-formatting" type="checkbox" checked={f.formatting} onChange={(e) => set('formatting', e.target.checked)} />
                      <span>
                        Format my thesis before printing ({rupees(p.formatting_fee)} per thesis)
                        <span className="hint">
                          We’ll discuss what you need on WhatsApp. The page count can change after formatting, so we confirm the final price before you pay.
                        </span>
                      </span>
                    </label>
                  </div>
                </>
              )}

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
              <Field id="u-instructions" label="Anything else we should know?" optional>
                <textarea {...bind('instructions')} rows={3} maxLength={1000}
                  placeholder="e.g. which pages are in colour, where OHP sheets go" />
              </Field>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => back()}>Back</button>
                <button type="button" className="btn btn-primary btn-lg" onClick={next}>Review your order</button>
              </div>
            </div>

            <aside className="form-aside" aria-label="Your price">
              <h2 className="aside-title">Your price</h2>
              {q.valid ? <QuoteBreakdown q={q} p={p} /> : <div className="quote-empty"><p>Enter your total pages to see the price.</p></div>}
            </aside>
          </div>
        )}

        {step === 3 && (
          <div className="form-split">
            <div className="form-card">
              <h2>Check your order</h2>
              <div className="review-block">
                <div className="review-head">
                  <h3>Your details</h3>
                  <button type="button" className="link-btn" onClick={() => back(1)}>Edit</button>
                </div>
                <dl className="review-list">
                  <div><dt>Name</dt><dd>{f.name}</dd></div>
                  <div><dt>Mobile</dt><dd>{f.phone}</dd></div>
                  {f.email && <div><dt>Email</dt><dd>{f.email}</dd></div>}
                  <div><dt>Degree</dt><dd>{f.degree}{f.university ? ', ' + f.university : ''}</dd></div>
                  <div>
                    <dt>Thesis file</dt>
                    <dd>{fileMode === 'link' ? f.fileLink : thesisFile && thesisFile.name + ' (' + formatBytes(thesisFile.size) + ')'}</dd>
                  </div>
                  {coverFile && <div><dt>Cover page</dt><dd>{coverFile.name}</dd></div>}
                </dl>
              </div>
              <div className="review-block">
                <div className="review-head">
                  <h3>Print options</h3>
                  <button type="button" className="link-btn" onClick={() => back(2)}>Edit</button>
                </div>
                <dl className="review-list">
                  <div><dt>Pages</dt><dd>{q.totalPages} ({q.colourPages} colour, {q.bwPages} B&amp;W)</dd></div>
                  <div><dt>Copies</dt><dd>{q.copies}</dd></div>
                  {q.ohp > 0 && <div><dt>OHP sheets</dt><dd>{q.ohp} per copy</dd></div>}
                  <div>
                    <dt>Cover</dt>
                    <dd><span className="swatch-inline" style={{ background: coverById(f.cover).hex }} /> {coverById(f.cover).label}, hardbound, {letteringLabel(f.lettering).toLowerCase()} lettering</dd>
                  </div>
                  {f.formatting && <div><dt>Formatting</dt><dd>Yes, {rupees(p.formatting_fee)}</dd></div>}
                  {f.thesisTitle && <div><dt>Cover text</dt><dd className="pre">{f.thesisTitle}</dd></div>}
                  <div><dt>Delivery</dt><dd>{method.label}{f.deliveryMethod !== 'pickup' ? ': ' + f.address : ''}</dd></div>
                  {f.requiredBy && <div><dt>Needed by</dt><dd>{f.requiredBy}</dd></div>}
                  {f.instructions && <div><dt>Notes</dt><dd className="pre">{f.instructions}</dd></div>}
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
                <button type="button" className="btn btn-primary btn-lg" onClick={submit}>Place order</button>
              </div>
              <p className="hint">Nothing to pay now. We check your file and confirm the price on WhatsApp before printing.</p>
            </div>

            <aside className="form-aside" aria-label="Your price">
              <h2 className="aside-title">Your price</h2>
              <QuoteBreakdown q={q} p={p} />
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
