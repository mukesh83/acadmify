// ============================================================================
// src/components/GalleryManager.jsx
// The "Gallery" tab. Uploads to Supabase Storage, records the row in the
// gallery table, and deletes both together.
//
// Works from a phone: the file picker offers the camera roll.
// ============================================================================

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { C } from '../constants'

const BUCKET = 'gallery-images'
const MAX_MB = 5

export default function GalleryManager() {
  const [photos, setPhotos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [file, setFile]       = useState(null)
  const [name, setName]       = useState('')
  const [busy, setBusy]       = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('id', { ascending: false })

    if (error) setMessage({ kind: 'error', text: 'Could not load: ' + error.message })
    else setPhotos(data || [])
    setLoading(false)
  }

  function pickFile(e) {
    const f = e.target.files && e.target.files[0]
    setMessage(null)
    if (!f) return

    if (!f.type.startsWith('image/')) {
      setMessage({ kind: 'error', text: 'Please choose an image file (JPG or PNG).' })
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setMessage({
        kind: 'error',
        text: 'That image is ' + (f.size / 1048576).toFixed(1) +
              ' MB. Please keep it under ' + MAX_MB + ' MB.',
      })
      return
    }

    setFile(f)
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''))
  }

  async function upload() {
    if (!file) {
      setMessage({ kind: 'error', text: 'Choose a photo first.' })
      return
    }

    setBusy(true)
    setMessage(null)

    // Safe filename: no spaces, no odd characters, always unique.
    const ext      = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const safeBase = (name || 'photo').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    const filename = Date.now() + '-' + safeBase + '.' + ext

    const { error: upErr } = await supabase
      .storage
      .from(BUCKET)
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (upErr) {
      setBusy(false)
      setMessage({
        kind: 'error',
        text: upErr.message.toLowerCase().includes('policy')
          ? 'Not allowed. Sign out and sign in again, then retry.'
          : 'Upload failed: ' + upErr.message,
      })
      return
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename)

    // If your column is image_url rather than url, change it on the next line.
    const { error: rowErr } = await supabase
      .from('gallery')
      .insert({ name: name || 'Photo', url: pub.publicUrl, active: true })

    setBusy(false)

    if (rowErr) {
      // Do not leave an orphan file sitting in storage.
      await supabase.storage.from(BUCKET).remove([filename])
      setMessage({ kind: 'error', text: 'Could not save: ' + rowErr.message })
      return
    }

    setFile(null)
    setName('')
    setMessage({ kind: 'ok', text: 'Photo added.' })
    load()
  }

  async function remove(photo) {
    if (!window.confirm('Delete "' + (photo.name || 'this photo') + '" permanently?')) return

    setBusy(true)

    // Work the storage path back out of the public URL.
    const marker = '/' + BUCKET + '/'
    const idx    = String(photo.url || '').indexOf(marker)
    const path   = idx > -1 ? photo.url.slice(idx + marker.length) : null

    const { error } = await supabase.from('gallery').delete().eq('id', photo.id)

    if (!error && path) {
      await supabase.storage.from(BUCKET).remove([decodeURIComponent(path)])
    }

    setBusy(false)

    if (error) setMessage({ kind: 'error', text: 'Delete failed: ' + error.message })
    else { setMessage({ kind: 'ok', text: 'Deleted.' }); load() }
  }

  return (
    <div>
      {/* Upload panel */}
      <div style={{
        background: C.gray1,
        border: '1px solid ' + C.gray3,
        padding: '20px 22px',
        marginBottom: 28,
      }}>
        <h3 style={{ color: C.maroon, margin: '0 0 14px', fontSize: 17 }}>
          Add a photo
        </h3>

        <label style={{
          display: 'block',
          border: '1.5px dashed ' + C.gray3,
          background: C.white,
          padding: '22px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 14,
          color: C.textMuted,
          fontSize: 15,
        }}>
          {file ? file.name : 'Tap to choose a photo (JPG or PNG, under 5 MB)'}
          <input
            type="file"
            accept="image/*"
            onChange={pickFile}
            style={{ display: 'none' }}
          />
        </label>

        <input
          placeholder="Caption, e.g. Maroon hardbound - IIT Jodhpur PhD"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 16,
            fontFamily: 'inherit',
            border: '1px solid ' + C.gray3,
            borderRadius: 2,
            marginBottom: 14,
          }}
        />

        <button
          onClick={upload}
          disabled={busy || !file}
          style={{
            padding: '11px 26px',
            fontSize: 15,
            fontFamily: 'inherit',
            background: !file ? C.gray3 : C.maroon,
            color: !file ? C.textMuted : C.white,
            border: 'none',
            borderRadius: 2,
            cursor: !file ? 'default' : 'pointer',
          }}
        >
          {busy ? 'Working...' : 'Add Photo'}
        </button>

        {message && (
          <p style={{
            marginTop: 12,
            marginBottom: 0,
            fontSize: 14,
            color: message.kind === 'error' ? '#B02020' : '#1E6B3A',
          }}>
            {message.text}
          </p>
        )}
      </div>

      {/* Existing photos */}
      <h3 style={{ color: C.maroon, margin: '0 0 14px', fontSize: 17 }}>
        Photos on the site ({photos.length})
      </h3>

      {loading ? (
        <p style={{ color: C.textMuted }}>Loading...</p>
      ) : photos.length === 0 ? (
        <p style={{ color: C.textMuted }}>No photos yet.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: 16,
        }}>
          {photos.map((p) => (
            <div key={p.id} style={{
              border: '1px solid ' + C.gray3,
              background: C.white,
            }}>
              <div style={{
                height: 140,
                background: C.gray1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
              }}>
                <img
                  src={p.url}
                  alt={p.name || 'Gallery photo'}
                  loading="lazy"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',   // contain, not cover - never crop a thesis
                  }}
                />
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{
                  fontSize: 13,
                  color: C.textBody,
                  marginBottom: 8,
                  wordBreak: 'break-word',
                }}>
                  {p.name}
                </div>
                <button
                  onClick={() => remove(p)}
                  disabled={busy}
                  style={{
                    fontSize: 13,
                    fontFamily: 'inherit',
                    color: '#B02020',
                    background: 'none',
                    border: '1px solid #E5C5C5',
                    borderRadius: 2,
                    padding: '5px 12px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
