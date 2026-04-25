/**
 * GalleryManager — Fixed version
 * Upload works via:
 *   1. Supabase Storage (if bucket is public)
 *   2. imgbb.com free API (backup — no signup needed)
 *   3. Paste any public image URL manually
 */

import { useState, useEffect } from 'react'
import { C } from '../constants'
import { mono, serif, inputStyle, labelStyle, btn } from '../utils/styles'

const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL     || ''
const SUPABASE_ANON   = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const STORAGE_BUCKET  = 'gallery-images'

// imgbb free image hosting — get free API key at imgbb.com/api
// Replace with your own key from imgbb.com (free, takes 1 minute)
const IMGBB_API_KEY   = import.meta.env.VITE_IMGBB_API_KEY    || ''

const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON)

function apiHeaders(extra = {}) {
  return {
    'apikey':        SUPABASE_ANON,
    'Authorization': 'Bearer ' + SUPABASE_ANON,
    'Content-Type':  'application/json',
    ...extra,
  }
}

// ── Upload image to Supabase Storage ────────────────────────────────────────
async function uploadToSupabase(file) {
  const ext      = file.name.split('.').pop().toLowerCase()
  const fileName = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext

  const res = await fetch(
    SUPABASE_URL + '/storage/v1/object/' + STORAGE_BUCKET + '/' + fileName,
    {
      method:  'POST',
      headers: {
        'apikey':        SUPABASE_ANON,
        'Authorization': 'Bearer ' + SUPABASE_ANON,
        'Content-Type':  file.type,
        'Cache-Control': '3600',
      },
      body: file,
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error('Supabase upload failed: ' + err)
  }
  // Return public URL
  return SUPABASE_URL + '/storage/v1/object/public/' + STORAGE_BUCKET + '/' + fileName
}

// ── Upload image to imgbb (free fallback) ────────────────────────────────────
async function uploadToImgbb(file) {
  if (!IMGBB_API_KEY) throw new Error('No imgbb API key configured')
  const formData = new FormData()
  formData.append('image', file)
  const res  = await fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_API_KEY, {
    method: 'POST',
    body:   formData,
  })
  const data = await res.json()
  if (!data.success) throw new Error('imgbb upload failed')
  return data.data.url
}

// ── Convert file to base64 data URL (last resort — stores in DB) ─────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Save gallery item to Supabase DB ─────────────────────────────────────────
async function saveToDb(name, imageUrl, sortOrder) {
  if (!hasSupabase) return null
  const res = await fetch(SUPABASE_URL + '/rest/v1/gallery', {
    method:  'POST',
    headers: { ...apiHeaders(), 'Prefer': 'return=representation' },
    body:    JSON.stringify({ name, image_url: imageUrl, sort_order: sortOrder, active: true }),
  })
  const data = await res.json()
  return Array.isArray(data) ? data[0] : null
}

// ── Load gallery from Supabase DB ────────────────────────────────────────────
async function loadFromDb() {
  if (!hasSupabase) return []
  const res  = await fetch(
    SUPABASE_URL + '/rest/v1/gallery?select=*&active=eq.true&order=sort_order.asc',
    { headers: apiHeaders() }
  )
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

// ── Delete from Supabase DB ──────────────────────────────────────────────────
async function deleteFromDb(id) {
  if (!hasSupabase) return
  await fetch(SUPABASE_URL + '/rest/v1/gallery?id=eq.' + id, {
    method:  'DELETE',
    headers: apiHeaders(),
  })
}

export default function GalleryManager() {
  const [items,     setItems]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newName,   setNewName]   = useState('')
  const [newUrl,    setNewUrl]    = useState('')
  const [preview,   setPreview]   = useState('')
  const [msg,       setMsg]       = useState(null)

  const showMsg = (text, isError = false) => {
    setMsg({ text, isError })
    setTimeout(() => setMsg(null), 5000)
  }

  // Load on mount
  useEffect(() => {
    setLoading(true)
    loadFromDb()
      .then(rows => { if (rows.length > 0) setItems(rows) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Handle file selected from PC/mobile ──────────────────────────────────
  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showMsg('Only image files allowed (JPG, PNG, WebP)', true); return }
    if (file.size > 10 * 1024 * 1024) { showMsg('File too large. Maximum size is 10MB.', true); return }

    setUploading(true)
    showMsg('Uploading image...')

    try {
      let imageUrl = ''

      // Try Supabase Storage first
      if (hasSupabase) {
        try {
          imageUrl = await uploadToSupabase(file)
          showMsg('Image uploaded to Supabase. Enter a name and click Add Photo.')
        } catch (err) {
          console.warn('Supabase upload failed, trying imgbb:', err.message)
          imageUrl = ''
        }
      }

      // Try imgbb if Supabase failed or not configured
      if (!imageUrl && IMGBB_API_KEY) {
        try {
          imageUrl = await uploadToImgbb(file)
          showMsg('Image uploaded to imgbb. Enter a name and click Add Photo.')
        } catch (err) {
          console.warn('imgbb failed, using base64:', err.message)
          imageUrl = ''
        }
      }

      // Last resort: base64 (works always, stored in DB)
      if (!imageUrl) {
        imageUrl = await fileToBase64(file)
        showMsg('Image loaded locally. Enter a name and click Add Photo.')
      }

      setNewUrl(imageUrl)
      setPreview(imageUrl)
    } catch (err) {
      showMsg('Upload failed: ' + err.message, true)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // ── Add photo ─────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newName.trim())  { showMsg('Please enter a name for this photo.', true); return }
    if (!newUrl.trim())   { showMsg('Please upload a photo or paste an image URL.', true); return }

    setUploading(true)
    try {
      const sortOrder = items.length + 1
      const saved     = await saveToDb(newName.trim(), newUrl.trim(), sortOrder)
      const newItem   = saved || { id: Date.now(), name: newName.trim(), image_url: newUrl.trim(), sort_order: sortOrder }

      setItems(prev => [...prev, newItem])
      setNewName('')
      setNewUrl('')
      setPreview('')
      showMsg('Photo added successfully. It is now visible on your website.')
    } catch (err) {
      // Still add locally even if DB fails
      setItems(prev => [...prev, { id: Date.now(), name: newName.trim(), image_url: newUrl.trim() }])
      setNewName('')
      setNewUrl('')
      setPreview('')
      showMsg('Photo added locally. Check Supabase connection to save permanently.')
    } finally {
      setUploading(false)
    }
  }

  // ── Delete photo ─────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm('Remove "' + item.name + '" from gallery?')) return
    setItems(prev => prev.filter(i => i.id !== item.id))
    try { await deleteFromDb(item.id) } catch {}
    showMsg('"' + item.name + '" removed from gallery.')
  }

  const inp = { ...inputStyle, fontSize: '0.97rem', padding: '9px 12px' }

  return (
    <div>
      {/* Status banner */}
      <div style={{ background: hasSupabase ? 'rgba(30,138,74,0.08)' : 'rgba(198,154,74,0.1)', border: '1px solid ' + (hasSupabase ? 'rgba(30,138,74,0.25)' : 'rgba(198,154,74,0.3)'), borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1.5rem', ...mono, fontSize: '0.7rem', color: hasSupabase ? '#1E5A30' : '#7A5C10' }}>
        {hasSupabase
          ? '🟢 Supabase connected — photos you add appear on acadmify.com immediately'
          : '🟡 No Supabase — photos stored locally in browser only'}
      </div>

      {/* ── Add new photo ─────────────────────────────────────────────── */}
      <div style={{ background: C.gray1, border: '1px solid ' + C.border, borderRadius: 6, padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ ...serif, fontSize: '1.35rem', fontWeight: 600, color: C.maroon, marginBottom: '1.25rem' }}>
          Add New Photo
        </h3>

        {/* Name input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>University or Caption Name</label>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="e.g. AIIMS Jodhpur, IIT Jodhpur" style={inp} />
        </div>

        {/* Upload from device */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Upload Photo from PC or Mobile</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.9rem 1.1rem', border: '2px dashed ' + (preview ? C.maroon : C.border), borderRadius: 6, cursor: uploading ? 'not-allowed' : 'pointer', background: preview ? 'rgba(122,30,30,0.04)' : '#fff' }}>
            <div style={{ fontSize: 24 }}>{uploading ? '⏳' : '📷'}</div>
            <div>
              <div style={{ ...serif, fontSize: '1rem', color: C.maroon, fontWeight: 600 }}>
                {uploading ? 'Uploading...' : preview ? 'Photo ready — click to change' : 'Click here to select photo'}
              </div>
              <div style={{ ...mono, fontSize: '0.62rem', color: C.textMuted, marginTop: 2 }}>
                JPG, PNG, WebP — max 10MB — works on phone and PC
              </div>
            </div>
            <input type="file" accept="image/*" capture="environment"
              onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>

        {/* OR paste URL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ ...mono, fontSize: '0.65rem', color: C.textMuted }}>OR PASTE IMAGE URL</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <input value={newUrl} onChange={e => { setNewUrl(e.target.value); setPreview(e.target.value) }}
            placeholder="https://..." style={inp} />
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Preview</label>
            <img src={preview} alt="preview"
              style={{ height: 150, width: 'auto', maxWidth: '100%', borderRadius: 4, border: '1px solid ' + C.border, objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; showMsg('Image URL is broken or blocked. Please upload the file directly.', true) }} />
          </div>
        )}

        {/* Message */}
        {msg && (
          <div style={{ ...mono, fontSize: '0.72rem', color: msg.isError ? '#C0392B' : '#1E6B3A', marginBottom: '1rem', padding: '0.6rem 0.9rem', background: msg.isError ? 'rgba(192,57,43,0.07)' : 'rgba(30,107,58,0.07)', borderRadius: 4, border: '1px solid ' + (msg.isError ? 'rgba(192,57,43,0.2)' : 'rgba(30,107,58,0.2)') }}>
            {msg.text}
          </div>
        )}

        <button onClick={handleAdd} disabled={uploading || !newName || !newUrl}
          style={{ ...btn('primary'), opacity: (uploading || !newName || !newUrl) ? 0.5 : 1, width: '100%' }}>
          {uploading ? 'Please wait...' : 'Add Photo to Gallery'}
        </button>
      </div>

      {/* ── How to upload from phone ─────────────────────────────────── */}
      <div style={{ background: 'rgba(122,30,30,0.04)', border: '1px solid ' + C.border, borderRadius: 6, padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ ...serif, fontSize: '1.05rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>
          How to Add Photos from Your Phone
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {[
            ['From Mobile (Easiest)', [
              '1. Open acadmify.com/#admin-mukesh on your phone',
              '2. Login to Admin → Gallery tab',
              '3. Tap "Click here to select photo"',
              '4. Choose from Gallery or take new photo',
              '5. Enter university name',
              '6. Tap Add Photo — done instantly',
            ]],
            ['From WhatsApp on PC', [
              '1. Open web.whatsapp.com on PC',
              '2. Find the thesis delivery photo',
              '3. Click the photo to open full size',
              '4. Right-click → Save image as',
              '5. Save to Desktop',
              '6. Upload using the button above',
            ]],
          ].map(([title, steps]) => (
            <div key={title}>
              <div style={{ ...serif, fontSize: '0.97rem', color: C.maroon, fontWeight: 600, marginBottom: '0.5rem' }}>{title}</div>
              {steps.map((s, i) => (
                <div key={i} style={{ ...mono, fontSize: '0.68rem', color: C.textMuted, lineHeight: 1.7 }}>{s}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Current gallery grid ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ ...serif, fontSize: '1.35rem', fontWeight: 600, color: C.maroon }}>
          Current Gallery ({items.length} photos)
        </h3>
        {items.length === 0 && !loading && (
          <span style={{ ...mono, fontSize: '0.68rem', color: C.textMuted }}>No photos yet — add your first photo above</span>
        )}
      </div>

      {loading ? (
        <div style={{ ...mono, fontSize: '0.75rem', color: C.textMuted, padding: '2rem', textAlign: 'center' }}>
          Loading gallery...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ border: '1px solid ' + C.border, borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
              <div style={{ position: 'relative' }}>
                <img src={item.image_url} alt={item.name}
                  style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block', background: C.gray2 }}
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div style={{ display: 'none', height: 140, alignItems: 'center', justifyContent: 'center', background: C.gray2, flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 24 }}>🖼</div>
                  <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted, textAlign: 'center', padding: '0 8px' }}>Image not loading</div>
                </div>
              </div>
              <div style={{ padding: '0.6rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid ' + C.border }}>
                <span style={{ ...serif, fontSize: '0.85rem', color: C.maroon, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{item.name}</span>
                <button onClick={() => handleDelete(item)} title="Remove"
                  style={{ background: 'transparent', border: 'none', color: '#C0392B', cursor: 'pointer', fontSize: '1rem', padding: '2px 4px', flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
