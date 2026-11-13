// Orders: counts, filters, search, one card per order with everything needed
// to call, message, open the files, and move the order along.
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseAdmin.js'
import { useContent } from '../../lib/content.jsx'
import { waLink } from '../../lib/whatsapp.js'
import { rupees, formatDate } from '../../lib/format.js'
import { coverById, STATUSES, STATUS_LABELS } from '../../constants.js'
import { refundOrder } from '../../lib/api.js'

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

function paymentMessage(o) {
  return 'Amount due for ' + o.id + ': ' + rupees(o.total_amount) + '. Please pay online to confirm your order: ' +
    window.location.origin + '/track?id=' + encodeURIComponent(o.id) +
    ' (enter the last 4 digits of your phone, then tap Pay).'
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
  const [selected, setSelected] = useState(() => new Set())
  const [openId, setOpenId] = useState(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkStatusValue, setBulkStatusValue] = useState('')

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

  // Core actions (no prompts). Each returns an error message, or '' on success.
  async function doCancel(o) {
    const { error: err } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', o.id)
    if (err) return err.message
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: 'cancelled' } : x)))
    return ''
  }

  async function doRefund(o) {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data && data.session && data.session.access_token
      if (!token) return 'Please sign out and sign in again.'
      await refundOrder(o.id, token)
      setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, payment_status: 'refunded' } : x)))
      return ''
    } catch (err) {
      return err.message
    }
  }

  async function doDelete(o) {
    const files = [['thesis-pdfs', o.thesis_pdf_path], ['cover-pages', o.cover_pdf_path], ['cover-pages', o.guidelines_path]]
    for (const [bucket, path] of files) {
      if (path && !o.files_deleted_at) await supabase.storage.from(bucket).remove([path])
    }
    const { error: err } = await supabase.from('orders').delete().eq('id', o.id)
    if (err) return err.message
    setOrders((list) => list.filter((x) => x.id !== o.id))
    setSelected((sel) => {
      const next = new Set(sel)
      next.delete(o.id)
      return next
    })
    return ''
  }

  // Runs one action over many orders and reports what happened.
  async function runBulk(list, verb, fn) {
    setBulkBusy(true)
    const failed = []
    for (const o of list) {
      const msg = await fn(o)
      if (msg) failed.push(o.id + ' (' + msg + ')')
    }
    setBulkBusy(false)
    const done = list.length - failed.length
    setNotice({
      kind: failed.length ? 'error' : 'ok',
      text: done + ' order(s) ' + verb + '.' + (failed.length ? ' Could not do ' + failed.length + ': ' + failed.join('; ') : ''),
    })
  }

  async function cancelOrder(o) {
    if (!window.confirm('Cancel order ' + o.id + ' (' + o.customer_name + ')?' +
      (o.payment_status === 'paid' ? '\n\nIt is paid. Cancelling does not return the money: use Refund as well.' : ''))) return
    const msg = await doCancel(o)
    setNotice(msg ? { kind: 'error', text: 'Could not cancel ' + o.id + ': ' + msg } : { kind: 'ok', text: o.id + ' cancelled.' })
  }

  async function refund(o) {
    if (!window.confirm('Refund ' + rupees(o.total_amount) + ' to the customer for order ' + o.id + '?\n\n' +
      'The full amount goes back to the card, UPI or bank account they paid with. This cannot be undone.')) return
    setNotice({ kind: 'info', text: 'Refunding ' + o.id + '…' })
    const msg = await doRefund(o)
    setNotice(msg
      ? { kind: 'error', text: 'Refund failed for ' + o.id + ': ' + msg }
      : { kind: 'ok', text: o.id + ' refunded. The customer sees it in 5 to 7 working days.' })
  }

  async function deleteOrder(o) {
    const unrefunded = o.payment_status === 'paid'
    if (!window.confirm('PERMANENTLY DELETE order ' + o.id + ' (' + o.customer_name + ')?\n\n' +
      (unrefunded ? 'WARNING: this order is marked paid and has not been refunded. Deleting does not return any money.\n\n' : '') +
      'The order, its history and any uploaded files are erased. This cannot be undone.\nTip: Cancel keeps a record; Delete does not.')) return
    const msg = await doDelete(o)
    setNotice(msg ? { kind: 'error', text: 'Could not delete ' + o.id + ': ' + msg } : { kind: 'ok', text: o.id + ' deleted.' })
  }

  const chosen = () => orders.filter((o) => selected.has(o.id))

  async function bulkStatus(status) {
    const list = chosen().filter((o) => o.status !== status)
    if (!list.length) return setNotice({ kind: 'info', text: 'Those orders already have that status.' })
    if (!window.confirm('Set ' + list.length + ' order(s) to "' + STATUS_LABELS[status] + '"?')) return
    await runBulk(list, 'set to ' + STATUS_LABELS[status], async (o) => {
      const { error: err } = await supabase.from('orders').update({ status }).eq('id', o.id)
      if (err) return err.message
      setOrders((l) => l.map((x) => (x.id === o.id ? { ...x, status } : x)))
      return ''
    })
  }

  async function bulkCancel() {
    const list = chosen().filter((o) => o.status !== 'cancelled')
    if (!list.length) return setNotice({ kind: 'info', text: 'Those orders are already cancelled.' })
    const paid = list.filter((o) => o.payment_status === 'paid').length
    if (!window.confirm('Cancel ' + list.length + ' order(s)?' + (paid ? '\n\n' + paid + ' of them are paid. Cancelling does not return money: use Refund as well.' : ''))) return
    await runBulk(list, 'cancelled', doCancel)
  }

  async function bulkRefund() {
    const list = chosen().filter((o) => o.payment_status === 'paid')
    if (!list.length) return setNotice({ kind: 'info', text: 'None of the selected orders are paid, so there is nothing to refund.' })
    const total = list.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
    if (!window.confirm('Refund ' + list.length + ' paid order(s), ' + rupees(total) + ' in total, back to the customers?\n\n' +
      'Each full amount goes back to the card, UPI or bank account that paid. This cannot be undone.')) return
    await runBulk(list, 'refunded', doRefund)
  }

  async function bulkDelete() {
    const list = chosen()
    const unrefunded = list.filter((o) => o.payment_status === 'paid').length
    if (!window.confirm('PERMANENTLY DELETE ' + list.length + ' order(s)?\n\n' +
      (unrefunded ? 'WARNING: ' + unrefunded + ' of them are marked paid and not refunded. Deleting does not return any money.\n\n' : '') +
      'The orders, their history and any uploaded files are erased. This cannot be undone.')) return
    await runBulk(list, 'deleted', doDelete)
  }

  async function cleanupOldFiles() {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data, error: err } = await supabase
      .from('orders')
      .select('id, thesis_pdf_path, cover_pdf_path, guidelines_path')
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
    const covers = data.flatMap((o) => [o.cover_pdf_path, o.guidelines_path]).filter(Boolean)
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

  const selectedShown = shown.filter((o) => selected.has(o.id))
  const allShownSelected = shown.length > 0 && selectedShown.length === shown.length
  const toggleOne = (id) => setSelected((sel) => {
    const next = new Set(sel)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  const toggleAll = () => setSelected((sel) => {
    const next = new Set(sel)
    if (allShownSelected) shown.forEach((o) => next.delete(o.id))
    else shown.forEach((o) => next.add(o.id))
    return next
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
        <>
          <div className="bulk-bar">
            <label className="check">
              <input type="checkbox" checked={allShownSelected} onChange={toggleAll} />
              <span>{selectedShown.length ? selectedShown.length + ' selected' : 'Select all (' + shown.length + ')'}</span>
            </label>
            {selectedShown.length > 0 && (
              <div className="bulk-actions">
                <select value={bulkStatusValue} disabled={bulkBusy} aria-label="Set status of selected orders"
                  onChange={(e) => { const v = e.target.value; setBulkStatusValue(''); if (v) bulkStatus(v) }}>
                  <option value="">Set status…</option>
                  {STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
                </select>
                <button type="button" className="btn btn-outline btn-sm" disabled={bulkBusy} onClick={bulkCancel}>Cancel</button>
                <button type="button" className="btn btn-outline btn-sm" disabled={bulkBusy} onClick={bulkRefund}>Refund</button>
                <button type="button" className="btn btn-danger btn-sm" disabled={bulkBusy} onClick={bulkDelete}>Delete</button>
                <button type="button" className="link-btn" onClick={() => setSelected(new Set())}>Clear</button>
              </div>
            )}
          </div>
          <ul className="order-rows">
            {shown.map((o) => (
              <li key={o.id} className={'order-row' + (openId === o.id ? ' is-open' : '')}>
                <div className="order-row-head" style={{ '--status': STATUS_COLOURS[o.status] || '#7A1E1E' }}>
                  <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} aria-label={'Select ' + o.id} />
                  <button type="button" className="order-row-main" aria-expanded={openId === o.id} onClick={() => setOpenId(openId === o.id ? null : o.id)}>
                    <span className="order-no">{o.id}</span>
                    <span className="order-row-name">{o.customer_name}</span>
                    <span className="badge">{STATUS_LABELS[o.status] || o.status}</span>
                    <span className={'badge ' + (o.payment_status === 'paid' ? 'ok' : o.payment_status === 'failed' ? 'err' : 'warn')}>{o.payment_status}</span>
                    <span className="order-total">{rupees(o.total_amount)}</span>
                  </button>
                </div>
                {openId === o.id && <OrderCard o={o} c={c} onUpdate={update} onCancel={cancelOrder} onRefund={refund} onDelete={deleteOrder} />}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function OrderCard({ o, c, onUpdate, onCancel, onRefund, onDelete }) {
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
              <a className="btn btn-ghost btn-sm" href={waLink(paymentMessage(o), o.customer_phone)} target="_blank" rel="noopener noreferrer">
                Payment message
              </a>
            )}
          </div>
        </div>

        <div className="order-block">
          <h4>Job</h4>
          <p>{o.total_pages} pages × {o.copies} {o.copies === 1 ? 'copy' : 'copies'}{o.ohp_sheets ? ', ' + o.ohp_sheets + ' OHP/copy' : ''}</p>
          <p><span className="swatch-inline" style={{ background: cover.hex }} /> {cover.label} {o.binding_type}{o.lettering ? ', ' + o.lettering + ' lettering' : ''}</p>
          {o.formatting && <p><strong>Thesis formatting requested</strong></p>}
          {o.thesis_title && <p className="pre">Cover text: {o.thesis_title}</p>}
          <p>{DELIVERY_LABELS[o.delivery_method] || o.delivery_method}{o.delivery_address ? ': ' + o.delivery_address : ''}</p>
          {o.required_by && <p className={dueSoon ? 'due-soon' : ''}>Needed by {formatDate(o.required_by)}</p>}
          {o.instructions && <p className="pre">Notes from customer: {o.instructions}</p>}
          <div className="order-links">
            {o.thesis_pdf_path && !o.files_deleted_at && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => openSigned('thesis-pdfs', o.thesis_pdf_path)}>Open thesis file</button>
            )}
            {o.cover_pdf_path && !o.files_deleted_at && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openSigned('cover-pages', o.cover_pdf_path)}>Open cover design</button>
            )}
            {o.guidelines_path && !o.files_deleted_at && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openSigned('cover-pages', o.guidelines_path)}>Open guidelines</button>
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
          <div className="order-actions">
            {o.status !== 'cancelled' && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => onCancel(o)}>Cancel order</button>
            )}
            {o.payment_status === 'paid' && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => onRefund(o)}>Refund {rupees(o.total_amount)}</button>
            )}
            <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(o)}>Delete order</button>
          </div>
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
