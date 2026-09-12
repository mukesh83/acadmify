// Orders: counts, filters, search, one card per order with everything needed
// to call, message, open the files, and move the order along.
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseAdmin.js'
import { useContent } from '../../lib/content.jsx'
import { waLink } from '../../lib/whatsapp.js'
import { rupees, formatDate } from '../../lib/format.js'
import { coverById, STATUSES, STATUS_LABELS } from '../../constants.js'

const STATUS_COLOURS = {
  received: '#7A1E1E', printing: '#1A5C9B', binding: '#6A1B9A', ready: '#B26A00',
  dispatched: '#00695C', delivered: '#1E6B3A', cancelled: '#8A8080',
}
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']
const PAYMENT_METHODS = [['', '—'], ['upi', 'UPI'], ['cash', 'Cash'], ['bank', 'Bank transfer'], ['razorpay', 'Razorpay']]
const DELIVERY_LABELS = { pickup: 'Pickup from shop', doorstep: 'Doorstep (Rapido)', courier: 'Courier' }
const ACTIVE = ['received', 'printing', 'binding', 'ready', 'dispatched']

function statusMessage(o, c) {
  const name = (o.customer_name || '').trim().split(/\s+/)[0] || 'there'
  const id = o.id
  switch (o.status) {
    case 'received':
      return 'Hi ' + name + ', we’ve received your Acadmify order ' + id + ' (' + o.total_pages + ' pages × ' + o.copies + '). We’ll check your file and confirm shortly.'
    case 'printing':
      return 'Hi ' + name + ', your order ' + id + ' is now being printed.'
    case 'binding':
      return 'Hi ' + name + ', your order ' + id + ' is now being bound.'
    case 'ready':
      return o.delivery_method === 'pickup'
        ? 'Hi ' + name + ', your order ' + id + ' is ready for pickup at Sector 19, Chopasni Housing Board (' + c('contact_hours') + ').'
        : 'Hi ' + name + ', your order ' + id + ' is ready and will be sent out shortly.'
    case 'dispatched':
      return 'Hi ' + name + ', your order ' + id + ' is out for delivery.'
    case 'delivered':
      return 'Hi ' + name + ', your order ' + id + ' has been delivered. Thank you! A Google review helps us a lot: ' + c('google_reviews_url')
    case 'cancelled':
      return 'Hi ' + name + ', your order ' + id + ' has been cancelled. Please message us if you have any questions.'
    default:
      return 'Hi ' + name + ', about your Acadmify order ' + id + ':'
  }
}

function paymentMessage(o, c) {
  const upi = c('upi_id')
  return 'Amount due for ' + o.id + ': ' + rupees(o.total_amount) + '. ' +
    (upi ? 'Pay by UPI to ' + upi + '.' : 'You can pay by UPI or cash. Reply here and we’ll share the details.')
}

async function openSigned(bucket, path) {
  const win = window.open('', '_blank')
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300)
  if (error || !data) {
    if (win) win.close()
    alert('Could not open the file: ' + (error ? error.message : 'unknown error'))
    return
  }
  if (win) {
    win.opener = null
    win.location = data.signedUrl
  } else {
    window.location.href = data.signedUrl
  }
}

export default function OrdersTab() {
  const c = useContent()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)
  const [filter, setFilter] = useState('active')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('admin_orders_view')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    if (err) setError(err.message)
    else {
      setOrders(data || [])
      setError('')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function update(o, fields) {
    const { error: err } = await supabase.from('orders').update(fields).eq('id', o.id)
    if (err) {
      setNotice({ kind: 'error', text: 'Could not save ' + o.id + ': ' + err.message })
      return false
    }
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, ...fields } : x)))
    setNotice({ kind: 'ok', text: o.id + ' saved.' })
    return true
  }

  async function cleanupOldFiles() {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data, error: err } = await supabase
      .from('orders')
      .select('id, thesis_pdf_path, cover_pdf_path')
      .eq('status', 'delivered')
      .is('files_deleted_at', null)
      .or('delivered_at.lt.' + cutoff + ',and(delivered_at.is.null,status_updated_at.lt.' + cutoff + ')')
    if (err) {
      setNotice({ kind: 'error', text: 'Could not check old files: ' + err.message })
      return
    }
    if (!data || data.length === 0) {
      setNotice({ kind: 'info', text: 'Nothing to delete: no orders delivered more than 30 days ago still have files.' })
      return
    }
    if (!window.confirm('Permanently delete the uploaded files for ' + data.length + ' order(s) delivered more than 30 days ago? This cannot be undone.')) return

    const thesis = data.map((o) => o.thesis_pdf_path).filter(Boolean)
    const covers = data.map((o) => o.cover_pdf_path).filter(Boolean)
    if (thesis.length) {
      const { error: e1 } = await supabase.storage.from('thesis-pdfs').remove(thesis)
      if (e1) return setNotice({ kind: 'error', text: 'Deleting thesis files failed: ' + e1.message })
    }
    if (covers.length) {
      const { error: e2 } = await supabase.storage.from('cover-pages').remove(covers)
      if (e2) return setNotice({ kind: 'error', text: 'Deleting cover files failed: ' + e2.message })
    }
    const now = new Date().toISOString()
    const { error: e3 } = await supabase.from('orders').update({ files_deleted_at: now }).in('id', data.map((o) => o.id))
    if (e3) return setNotice({ kind: 'error', text: 'Files deleted, but orders were not marked: ' + e3.message })
    setNotice({ kind: 'ok', text: 'Deleted files for ' + data.length + ' order(s).' })
    load()
  }

  const today = new Date().toDateString()
  const counts = useMemo(() => ({
    today: orders.filter((o) => new Date(o.created_at).toDateString() === today).length,
    active: orders.filter((o) => ACTIVE.includes(o.status)).length,
    awaiting: orders.filter((o) => o.upload_status === 'pending' && o.status !== 'cancelled').length,
    unpaid: orders.filter((o) => o.payment_status !== 'paid' && o.status !== 'cancelled').length,
  }), [orders, today])

  const term = search.trim().toLowerCase()
  const termDigits = term.replace(/\D/g, '')
  const shown = orders.filter((o) => {
    if (filter === 'active' && !ACTIVE.includes(o.status)) return false
    if (filter === 'today' && new Date(o.created_at).toDateString() !== today) return false
    if (filter === 'awaiting' && !(o.upload_status === 'pending' && o.status !== 'cancelled')) return false
    if (filter === 'unpaid' && !(o.payment_status !== 'paid' && o.status !== 'cancelled')) return false
    if (STATUSES.includes(filter) && o.status !== filter) return false
    if (!term) return true
    return (
      String(o.id).toLowerCase().includes(term) ||
      String(o.customer_name || '').toLowerCase().includes(term) ||
      (termDigits.length >= 3 && String(o.customer_phone || '').replace(/\D/g, '').includes(termDigits))
    )
  })

  if (loading) return <p>Loading orders…</p>
  if (error) {
    return (
      <div className="admin-msg error">
        <strong>Could not load orders.</strong> {error}
        <br />If this mentions permissions or a missing view, run migration 010 in Supabase, then sign out and in again.
      </div>
    )
  }

  return (
    <div>
      <div className="kpis">
        {[['today', counts.today, 'New today'], ['active', counts.active, 'In progress'], ['awaiting', counts.awaiting, 'Waiting for file'], ['unpaid', counts.unpaid, 'Not paid yet']].map(([id, n, label]) => (
          <button key={id} type="button" className="kpi" aria-pressed={filter === id} onClick={() => setFilter(id)}>
            <strong>{n}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <input type="search" placeholder="Search order number, name or phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search orders" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={cleanupOldFiles}>Delete files of orders delivered 30+ days ago</button>
      </div>

      <div className="chips" aria-label="Filter by status">
        {[['active', 'In progress'], ['all', 'All'], ...STATUSES.map((s) => [s, STATUS_LABELS[s]])].map(([id, label]) => (
          <button key={id} type="button" className="chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      {notice && <p className={'admin-msg ' + notice.kind} role="status">{notice.text}</p>}

      {shown.length === 0 ? (
        <p>No orders here.</p>
      ) : (
        <div className="order-list">
          {shown.map((o) => <OrderCard key={o.id} o={o} c={c} onUpdate={update} />)}
        </div>
      )}
    </div>
  )
}

function OrderCard({ o, c, onUpdate }) {
  const [notes, setNotes] = useState(o.notes || '')
  const [history, setHistory] = useState(null)
  const cover = coverById(o.cover_colour)
  const neededBy = o.required_by ? new Date(o.required_by + 'T23:59:59') : null
  const dueSoon = neededBy && ACTIVE.includes(o.status) && neededBy.getTime() - Date.now() < 2 * 86400000

  async function loadHistory() {
    const { data } = await supabase
      .from('order_status_history')
      .select('old_status, new_status, changed_by, changed_at')
      .eq('order_id', o.id)
      .order('changed_at', { ascending: true })
    setHistory(data || [])
  }

  const uploadBadge =
    o.files_deleted_at ? ['Files deleted', ''] :
    o.upload_status === 'uploaded' ? ['File uploaded', 'ok'] :
    o.upload_status === 'link' ? ['File link', 'ok'] :
    ['Waiting for file', 'warn']

  return (
    <article className="order-card" style={{ '--status': STATUS_COLOURS[o.status] || '#7A1E1E' }}>
      <div className="order-top">
        <span className="order-no">{o.id}</span>
        <span className="badge">{STATUS_LABELS[o.status] || o.status}</span>
        <span className={'badge ' + (o.payment_status === 'paid' ? 'ok' : o.payment_status === 'failed' ? 'err' : 'warn')}>
          {o.payment_status === 'paid' ? 'Paid' + (o.payment_method ? ' · ' + o.payment_method : '') : o.payment_status}
        </span>
        <span className={'badge ' + uploadBadge[1]}>{uploadBadge[0]}</span>
        <span className="order-total">{rupees(o.total_amount)}</span>
      </div>

      <div className="order-grid">
        <div className="order-block">
          <h4>Customer</h4>
          <p><strong>{o.customer_name}</strong></p>
          <p>
            <a href={'tel:+91' + String(o.customer_phone || '').replace(/\D/g, '').slice(-10)}>{o.customer_phone}</a>
            {o.customer_email ? ' · ' + o.customer_email : ''}
          </p>
          <p>{[o.degree, o.customer_university].filter(Boolean).join(', ')}</p>
          <p className="hint">Placed {formatDate(o.created_at, true)}</p>
          <div className="order-links">
            <a className="btn btn-wa btn-sm" href={waLink(statusMessage(o, c), o.customer_phone)} target="_blank" rel="noopener noreferrer">
              WhatsApp: {STATUS_LABELS[o.status] || 'message'}
            </a>
            {o.payment_status !== 'paid' && o.status !== 'cancelled' && (
              <a className="btn btn-ghost btn-sm" href={waLink(paymentMessage(o, c), o.customer_phone)} target="_blank" rel="noopener noreferrer">
                Payment message
              </a>
            )}
          </div>
        </div>

        <div className="order-block">
          <h4>Job</h4>
          <p>{o.total_pages} pages ({o.color_pages} colour) × {o.copies} {o.copies === 1 ? 'copy' : 'copies'}{o.ohp_sheets ? ', ' + o.ohp_sheets + ' OHP/copy' : ''}</p>
          <p><span className="swatch-inline" style={{ background: cover.hex }} /> {cover.label} {o.binding_type}{o.lettering ? ', ' + o.lettering + ' lettering' : ''}</p>
          {o.formatting && <p><strong>Thesis formatting requested</strong></p>}
          {o.thesis_title && <p className="pre">Cover text: {o.thesis_title}</p>}
          <p>{DELIVERY_LABELS[o.delivery_method] || o.delivery_method}{o.delivery_address ? ': ' + o.delivery_address : ''}</p>
          {o.required_by && <p className={dueSoon ? 'due-soon' : ''}>Needed by {formatDate(o.required_by)}</p>}
          {o.instructions && <p className="pre">Notes from customer: {o.instructions}</p>}
          <div className="order-links">
            {o.thesis_pdf_path && !o.files_deleted_at && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => openSigned('thesis-pdfs', o.thesis_pdf_path)}>Open thesis PDF</button>
            )}
            {o.cover_pdf_path && !o.files_deleted_at && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openSigned('cover-pages', o.cover_pdf_path)}>Open cover</button>
            )}
            {o.file_link && (
              <a className="btn btn-outline btn-sm" href={o.file_link} target="_blank" rel="noopener noreferrer">Open file link</a>
            )}
          </div>
        </div>

        <div className="order-block order-controls">
          <label>
            Status
            <select value={o.status} onChange={(e) => onUpdate(o, { status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </label>
          <label>
            Payment
            <select value={o.payment_status} onChange={(e) => onUpdate(o, { payment_status: e.target.value })}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            Paid by
            <select value={o.payment_method || ''} onChange={(e) => onUpdate(o, { payment_method: e.target.value || null })}>
              {PAYMENT_METHODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label>
            Private notes
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          {notes !== (o.notes || '') && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onUpdate(o, { notes })}>Save notes</button>
          )}
          {history === null ? (
            <button type="button" className="link-btn" onClick={loadHistory}>Show history</button>
          ) : (
            <ul className="history-list">
              {history.map((h, i) => (
                <li key={i}>{formatDate(h.changed_at, true)}: {STATUS_LABELS[h.new_status] || h.new_status} ({h.changed_by})</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  )
}
