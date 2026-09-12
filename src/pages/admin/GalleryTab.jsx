// Gallery photos: add (auto-resized on your phone/PC before upload), caption,
// reorder, hide/show and delete. The homepage gallery hides itself when empty.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseAdmin.js'

const BUCKET = 'gallery-images'

async function resizeToJpeg(file, maxSide = 1600) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('This image could not be read. Try a JPG or PNG.'))
      i.src = url
    })
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (!blob) throw new Error('Could not prepare the image.')
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}

const storagePath = (imageUrl) => {
  const marker = '/' + BUCKET + '/'
  const i = String(imageUrl || '').indexOf(marker)
  return i > -1 ? decodeURIComponent(imageUrl.slice(i + marker.length).split('?')[0]) : null
}

export default function GalleryTab() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function load() {
    const { data, error } = await supabase.from('gallery').select('*').order('sort_order', { ascending: true }).order('id', { ascending: false })
    if (error) setMsg({ kind: 'error', text: 'Could not load photos: ' + error.message })
    else setPhotos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function add(e) {
    e.preventDefault()
    if (!file) return setMsg({ kind: 'error', text: 'Choose a photo first.' })
    setBusy(true)
    setMsg(null)
    try {
      const blob = await resizeToJpeg(file)
      const slug = (caption || 'photo').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'photo'
      const path = Date.now() + '-' + slug + '.jpg'
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
      if (upErr) throw new Error('Upload failed: ' + upErr.message)
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const nextOrder = photos.reduce((m, p) => Math.max(m, p.sort_order || 0), 0) + 1
      const { error: rowErr } = await supabase.from('gallery').insert({ name: caption.trim() || null, image_url: pub.publicUrl, sort_order: nextOrder, active: true })
      if (rowErr) {
        await supabase.storage.from(BUCKET).remove([path])
        throw new Error('Could not save: ' + rowErr.message)
      }
      setFile(null)
      setCaption('')
      e.target.reset()
      setMsg({ kind: 'ok', text: 'Photo added. It now shows on the homepage.' })
      load()
    } catch (err) {
      setMsg({ kind: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  async function patch(photo, fields) {
    const { error } = await supabase.from('gallery').update(fields).eq('id', photo.id)
    if (error) setMsg({ kind: 'error', text: 'Could not save: ' + error.message })
    else setPhotos((list) => list.map((p) => (p.id === photo.id ? { ...p, ...fields } : p)))
  }

  async function move(index, dir) {
    const a = photos[index]
    const b = photos[index + dir]
    if (!a || !b) return
    // Give every photo a clean position first, then swap the two
    const ordered = photos.map((p, i) => ({ ...p, sort_order: i + 1 }))
    ordered[index].sort_order = index + dir + 1
    ordered[index + dir].sort_order = index + 1
    setPhotos([...ordered].sort((x, y) => x.sort_order - y.sort_order))
    const changed = ordered.filter((p, i) => p.sort_order !== photos[i].sort_order || i === index || i === index + dir)
    for (const p of changed) await supabase.from('gallery').update({ sort_order: p.sort_order }).eq('id', p.id)
  }

  async function remove(photo) {
    if (!window.confirm('Delete this photo permanently?')) return
    const { error } = await supabase.from('gallery').delete().eq('id', photo.id)
    if (error) return setMsg({ kind: 'error', text: 'Delete failed: ' + error.message })
    const path = storagePath(photo.image_url)
    if (path) await supabase.storage.from(BUCKET).remove([path])
    setMsg({ kind: 'ok', text: 'Photo deleted.' })
    load()
  }

  return (
    <div>
      <form className="admin-card" onSubmit={add}>
        <h2>Add a photo</h2>
        <p className="hint">Real photos of your own work only. Photos are resized automatically, so any phone photo is fine.</p>
        <div className="field">
          <label htmlFor="g-file">Photo</label>
          <input id="g-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
        </div>
        <div className="field">
          <label htmlFor="g-caption">Caption <span className="optional">(optional)</span></label>
          <input id="g-caption" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={80} placeholder="e.g. Maroon hardbound PhD thesis" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !file}>{busy ? 'Uploading…' : 'Add photo'}</button>
      </form>

      {msg && <p className={'admin-msg ' + msg.kind} role="status">{msg.text}</p>}

      <h2>Photos ({photos.length})</h2>
      {loading ? <p>Loading…</p> : photos.length === 0 ? (
        <p>No photos yet. The gallery section stays hidden on the website until you add one.</p>
      ) : (
        <ul className="gallery-admin">
          {photos.map((p, i) => (
            <li key={p.id} className={p.active ? '' : 'is-hidden'}>
              <img src={p.image_url} alt={p.name || 'Gallery photo'} loading="lazy" />
              <div className="gallery-admin-body">
                <input aria-label="Caption" defaultValue={p.name || ''} onBlur={(e) => e.target.value !== (p.name || '') && patch(p, { name: e.target.value || null })} />
                <div className="order-links">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">↑</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Move later">↓</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => patch(p, { active: !p.active })}>{p.active ? 'Hide' : 'Show'}</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(p)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
