/**
 * GalleryManager — Admin tab to manage gallery photos.
 * Two ways to add photos:
 *   1. Paste any image URL (from Google Drive, WhatsApp, anywhere)
 *   2. Upload from your PC → stores in Supabase Storage
 */

import { useState, useEffect } from 'react'
import { C } from '../constants'
import { mono, serif, inputStyle, labelStyle, btn } from '../utils/styles'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL    || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const STORAGE_BUCKET = 'gallery-images'

// Hardcoded fallback gallery — used when Supabase not connected
const DEFAULT_GALLERY = [
  { id: 1,  name: 'AIIMS Jodhpur',                 image_url: 'https://lh3.googleusercontent.com/sitesv/AA5AbUCmq2iE7eiXcYlvZwVZUnpFp6bfzBJdoPQLcIlAePtg6dIqTHZwVA10n-2m9jXMAakdNCd7gP6CnzQf3xGC2kHOqC8KIi7NQSGiqCqjeeuvUsaRI5PH_6SKSnwZ5TgEjJdR1pXdcHw6PMeLjLV6QalyqzCsSoTTSLYuD-TntPd5L2sFkxu3Zqp9oe0I4anTNCJ3XQmlQGe1an2LYwpXfHD9pd4rdFmLrhPJDsY=w640' },
  { id: 2,  name: 'IIT Jodhpur',                    image_url: 'https://lh3.googleusercontent.com/sitesv/AA5AbUC8-wJmyfDEIhZJ0eHvdyqQAW4yDfEP1ok_zCvEV78f6VKbh4GzDxy4KrabLi9dhoSy8RYuWlCk_0kXRJiPqXUMbAd2pGdcM0iE04LB2YA4S8oTP2bKu4Y1cErKPobZh6M_sFtUVMhzhmVzJwdgdlzXtYmI-8VsRhiDtOUddwzP_c83FKfUYkOI0zki-57JI5WxxsIhEC15mD3z8SkZMjIE55DObGtWPmLy=w640' },
  { id: 3,  name: 'Faculty of Law, JNVU',           image_url: 'https://lh3.googleusercontent.com/sitesv/AA5AbUBimG1fqehk6TuHxJIU1LvgxPl3k1z7BaXTDw39yPlny7JvmoNnpiU-mON0FkuD3hu4vGAc46uLtIleBgxyNRhjaGsc9E568wrqwXGJTjq7Ut8FvosXS-nJvqEkzV8QcVoAd34D7TcfbN_9VfxKThsECnq0XbwEKmHQsM46fRHPYNT_4M3-M5ryxPfphpx8Ik2NhbOGeXFjewDwxM0GonqlMPMydAxsCXDQ=w640' },
  { id: 4,  name: 'SN Medical College',             image_url: 'https://lh3.googleusercontent.com/sitesv/AA5AbUAOsUxv0dywGFd5SFCOl7K08EaQax20nBSWNUBqn_Z6l9Tx-jPvaA08Y8BHCtJFB7b5ScjwcQUwQbfemfMVc9FEiO_1DgtLNDQ5iQVcxMvRjRZRv0b--aHKZHw81kxxM2Fe6k0LCfXwIEiyBZGC2ZHuSgLyiVpUXXqK-mX64Tb8hy3_P9AYSJn3N0fvQdZMcPoASLRu2eLuqlTLxVhQ2rWRZBBe_uq-xXWPlqo=w640' },
  { id: 5,  name: 'Maulana Azad University',        image_url: 'https://lh3.googleusercontent.com/sitesv/AA5AbUDmx9azNFXVoUG0-TK1iS3KHkuHD3bGl_xTtjuE1RHAj84ZnAic6VY0dB_KmMF4NJCQnS7jwGU1MrZ6TD3AeWhMDEVdc_8PcNDmNKjjEtjEtXrJqxAXRmJoAy_6NqiLv6E7aV8kvIjdBQA1O4YzEHLpkHV7v6kO2fRhpF_rL3g7R3hblLSdK2Lz74q7WV5x3nqe_0=w640' },
  { id: 6,  name: 'FDDI Jodhpur',                   image_url: 'https://lh3.googleusercontent.com/sitesv/AA5AbUBVi4bvmd8d-OAw0BHsN6ElBqJSxO92E-yHusTekFNDoXUjCrhVVQcoW89KrY3aSiDaXKXJef103eLs8Wph5wutSrlfxFJtEg1FBg1GHO90G3ktXFg6IjCHSyg9voWS1zX1AN_jc_58vF0FPP0IVBfhXjJ9wrVfEGMEIZzleR89kbcMoDS8je2lH8mZuawwsNcRPqml_hD9B6utlkOQEO9qSRlVlf5Gbec7=w640' },
  { id: 7,  name: 'IGNOU',                          image_url: 'https://lh3.googleusercontent.com/sitesv/AA5AbUCqUqMUi50IpPvP8fjHM1Dy9TuYwlWsGO14jJCEle_mrggtyJvXiqc_THR7j_M1LfiZt_iCWSeI7NTTQ4Wg6HA0f7Qy85JLNpCKBHn8szOizAPDMpWTSX_tAesLqE4Ua9I84JWK3NUf8mUCfkVhplJeB3ZBC9ohElIFSqCI0p2b5U0PO7AWb8tWeiZzFDhg5riEvmGHKc=w640' },
]

function apiHeaders() {
  return { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' }
}

export default function GalleryManager() {
  const [items,      setItems]      = useState(DEFAULT_GALLERY)
  const [loading,    setLoading]    = useState(true)
  const [uploading,  setUploading]  = useState(false)
  const [msg,        setMsg]        = useState(null)
  const [newName,    setNewName]    = useState('')
  const [newUrl,     setNewUrl]     = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON)

  // ── Load gallery from Supabase ──────────────────────────────────────────
  useEffect(() => {
    if (!hasSupabase) { setLoading(false); return }
    fetch(`${SUPABASE_URL}/rest/v1/gallery?select=*&active=eq.true&order=sort_order.asc`, {
      headers: apiHeaders()
    })
      .then(r => r.json())
      .then(rows => { if (Array.isArray(rows) && rows.length > 0) setItems(rows) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const showMsg = (text, isError = false) => {
    setMsg({ text, isError })
    setTimeout(() => setMsg(null), 4000)
  }

  // ── Add by URL ──────────────────────────────────────────────────────────
  const handleAddUrl = async () => {
    if (!newName.trim() || !newUrl.trim()) { showMsg('Please enter both name and image URL', true); return }

    const newItem = { name: newName.trim(), image_url: newUrl.trim(), sort_order: items.length + 1, active: true }

    if (hasSupabase) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/gallery`, {
        method: 'POST',
        headers: { ...apiHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(newItem)
      })
      const saved = await res.json()
      if (Array.isArray(saved) && saved[0]) {
        setItems(prev => [...prev, saved[0]])
        showMsg('✓ Photo added — visible on website now')
      } else {
        showMsg('Failed to save. Check Supabase connection.', true)
        return
      }
    } else {
      setItems(prev => [...prev, { ...newItem, id: Date.now() }])
      showMsg('✓ Added locally. Connect Supabase to save permanently.')
    }
    setNewName(''); setNewUrl(''); setPreviewUrl('')
  }

  // ── Upload photo from PC ─────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showMsg('Only image files allowed (JPG, PNG, WebP)', true); return }
    if (file.size > 5 * 1024 * 1024) { showMsg('File too large. Max 5MB.', true); return }

    if (!hasSupabase) {
      // Local preview only
      const reader = new FileReader()
      reader.onload = ev => {
        setNewUrl(ev.target.result)
        setPreviewUrl(ev.target.result)
        showMsg('Image loaded. Enter a name and click "Add Photo".')
      }
      reader.readAsDataURL(file)
      return
    }

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${fileName}`,
        {
          method: 'POST',
          headers: {
            'apikey':        SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`,
            'Content-Type':  file.type,
          },
          body: file,
        }
      )
      if (!uploadRes.ok) throw new Error('Upload failed')

      // Get public URL
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`
      setNewUrl(publicUrl)
      setPreviewUrl(publicUrl)
      showMsg('✓ Photo uploaded. Enter a name and click "Add Photo".')
    } catch (err) {
      showMsg(`Upload error: ${err.message}`, true)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // ── Delete photo ─────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from gallery?`)) return

    if (hasSupabase) {
      await fetch(`${SUPABASE_URL}/rest/v1/gallery?id=eq.${item.id}`, {
        method: 'DELETE',
        headers: apiHeaders()
      })
    }
    setItems(prev => prev.filter(i => i.id !== item.id))
    showMsg(`"${item.name}" removed from gallery`)
  }

  const inp = { ...inputStyle, fontSize: '0.97rem', padding: '9px 12px', background: '#fff' }

  return (
    <div>
      {/* Mode banner */}
      <div style={{ background: hasSupabase ? 'rgba(30,138,74,0.08)' : 'rgba(198,154,74,0.08)', border: `1px solid ${hasSupabase ? 'rgba(30,138,74,0.2)' : 'rgba(198,154,74,0.3)'}`, borderRadius: 4, padding: '0.7rem 1rem', marginBottom: '1.5rem', ...mono, fontSize: '0.7rem', color: hasSupabase ? '#1E5A30' : '#7A5C10' }}>
        {hasSupabase
          ? '🟢 Connected — photos you add here appear on acadmify.com immediately'
          : '🟡 Local mode — add VITE_SUPABASE_URL to Vercel to save photos permanently'}
      </div>

      {/* ── Add new photo ── */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ ...serif, fontSize: '1.35rem', fontWeight: 600, color: C.maroon, marginBottom: '1.25rem' }}>
          Add New Photo
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>University / Caption Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="e.g. IIT Jodhpur" style={inp} />
          </div>
          <div>
            <label style={labelStyle}>Image URL (paste link)</label>
            <input value={newUrl} onChange={e => { setNewUrl(e.target.value); setPreviewUrl(e.target.value) }}
              placeholder="https://..." style={inp} />
          </div>
        </div>

        {/* OR upload from PC */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ ...mono, fontSize: '0.65rem', color: C.textMuted }}>— OR —</span>
          <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, ...btn('outline'), padding: '8px 18px' }}>
            {uploading ? 'Uploading…' : '📷 Upload from PC'}
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
          <span style={{ ...mono, fontSize: '0.62rem', color: C.textMuted }}>JPG, PNG, WebP — max 5MB</span>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Preview</label>
            <img src={previewUrl} alt="preview" style={{ height: 120, borderRadius: 4, border: `1px solid ${C.border}`, objectFit: 'cover' }}
              onError={e => e.target.style.display = 'none'} />
          </div>
        )}

        {msg && (
          <div style={{ ...mono, fontSize: '0.7rem', color: msg.isError ? '#C0392B' : '#1E6B3A', marginBottom: '0.75rem' }}>
            {msg.text}
          </div>
        )}

        <button onClick={handleAddUrl} disabled={!newName || !newUrl}
          style={{ ...btn('primary'), opacity: (!newName || !newUrl) ? 0.5 : 1 }}>
          Add Photo to Gallery →
        </button>
      </div>

      {/* ── How to get image URL ── */}
      <div style={{ background: 'rgba(122,30,30,0.04)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ ...mono, fontSize: '0.65rem', color: C.maroon, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          How to get an Image URL from WhatsApp or Google Photos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {[
            ['From WhatsApp (Desktop)', [
              '1. Open WhatsApp Web on PC',
              '2. Find the thesis photo',
              '3. Right-click the image → "Open in new tab"',
              '4. Copy the URL from browser address bar',
              '5. Paste in Image URL field above',
            ]],
            ['From Google Drive', [
              '1. Upload photo to Google Drive',
              '2. Right-click → Share → Anyone with link',
              '3. Copy the share link',
              '4. Change the URL:',
              '   drive.google.com/file/d/FILE_ID/view',
              '   → drive.google.com/uc?id=FILE_ID',
              '5. Paste in Image URL field above',
            ]],
          ].map(([title, steps]) => (
            <div key={title}>
              <div style={{ ...serif, fontSize: '0.97rem', color: C.maroon, fontWeight: 600, marginBottom: '0.5rem' }}>{title}</div>
              {steps.map((s, i) => (
                <div key={i} style={{ ...mono, fontSize: '0.68rem', color: C.textMuted, marginBottom: 3 }}>{s}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', ...serif, fontSize: '0.92rem', color: C.textBody }}>
          <strong style={{ color: C.maroon }}>Easiest method:</strong> Use the "Upload from PC" button above — take a photo on your phone, transfer to PC via WhatsApp or USB, then upload directly.
        </div>
      </div>

      {/* ── Current gallery ── */}
      <h3 style={{ ...serif, fontSize: '1.35rem', fontWeight: 600, color: C.maroon, marginBottom: '1rem' }}>
        Current Gallery ({items.length} photos)
      </h3>

      {loading ? (
        <div style={{ ...mono, fontSize: '0.75rem', color: C.textMuted, padding: '1rem' }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
              <img src={item.image_url} alt={item.name}
                style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.background = C.gray2; e.target.style.height = '80px' }} />
              <div style={{ padding: '0.6rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ ...serif, fontSize: '0.88rem', color: C.maroon, fontWeight: 600 }}>{item.name}</span>
                <button onClick={() => handleDelete(item)}
                  title="Remove from gallery"
                  style={{ background: 'transparent', border: 'none', color: '#C0392B', cursor: 'pointer', ...mono, fontSize: '0.8rem', padding: '2px 6px' }}>
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
