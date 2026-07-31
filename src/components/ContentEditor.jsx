// ============================================================================
// src/components/ContentEditor.jsx
// The "Edit Website" tab. Saves to Supabase site_content.
//
// Writes now require a logged-in admin (see sql/005). If saving fails with
// a permission error, you are not signed in -- sign out and back in.
// ============================================================================

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONTENT_DEFAULTS } from '../hooks/useContent'
import { C } from '../constants'

// Everything editable, grouped into sections.
const SECTIONS = [
  {
    title: 'Hero (top of homepage)',
    fields: [
      ['hero_eyebrow',     'Small line above the heading'],
      ['hero_title',       'Main heading'],
      ['hero_subtitle',    'Subheading'],
      ['hero_description', 'Paragraph', 'area'],
      ['hero_stat1',       'Stat 1 number'],
      ['hero_stat1_label', 'Stat 1 label'],
      ['hero_stat2',       'Stat 2 number'],
      ['hero_stat2_label', 'Stat 2 label'],
      ['hero_stat3',       'Stat 3 number'],
      ['hero_stat3_label', 'Stat 3 label'],
      ['hero_stat4',       'Stat 4 number'],
      ['hero_stat4_label', 'Stat 4 label'],
    ],
  },
  {
    title: 'About Us',
    fields: [
      ['about_heading', 'Heading'],
      ['about_para1',   'First paragraph',  'area'],
      ['about_para2',   'Second paragraph', 'area'],
    ],
  },
  {
    title: 'Contact',
    fields: [
      ['contact_address',  'Address', 'area'],
      ['contact_phone',    'Phone (as displayed)'],
      ['contact_whatsapp', 'WhatsApp number (digits only, e.g. 919460046565)'],
      ['contact_email',    'Email'],
      ['contact_hours',    'Opening hours'],
    ],
  },
  {
    title: 'Pricing (numbers only, no Rs. sign)',
    fields: [
      ['pricing_bw',        'B&W per page'],
      ['pricing_colour',    'Colour per page'],
      ['pricing_hardbound', 'Hardbound per copy'],
      ['pricing_ohp',       'OHP sheet'],
      ['pricing_delivery',  'Delivery charge'],
    ],
  },
  {
    title: 'YouTube (paste the video ID only, not the full URL)',
    fields: [
      ['youtube_channel',            'Channel URL'],
      ['youtube_video1_id',          'Video 1 ID'],
      ['youtube_video1_title',       'Video 1 title'],
      ['youtube_video1_description', 'Video 1 description', 'area'],
      ['youtube_video2_id',          'Video 2 ID'],
      ['youtube_video2_title',       'Video 2 title'],
      ['youtube_video2_description', 'Video 2 description', 'area'],
      ['youtube_video3_id',          'Video 3 ID'],
      ['youtube_video3_title',       'Video 3 title'],
      ['youtube_video3_description', 'Video 3 description', 'area'],
    ],
  },
  {
    title: 'Footer',
    fields: [
      ['footer_tagline',   'Tagline', 'area'],
      ['footer_copyright', 'Copyright line'],
    ],
  },
]

const inputStyle = {
  width: '100%',
  padding: '9px 11px',
  fontSize: 15,
  fontFamily: 'inherit',
  border: '1px solid ' + C.gray3,
  borderRadius: 2,
  color: C.textBody,
  background: C.white,
}

export default function ContentEditor() {
  const [values, setValues]   = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [message, setMessage] = useState(null)   // { kind, text }
  const [dirty, setDirty]     = useState({})     // keys changed since load

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')

    if (error) {
      setMessage({ kind: 'error', text: 'Could not load: ' + error.message })
      setLoading(false)
      return
    }

    const map = { ...CONTENT_DEFAULTS }
    ;(data || []).forEach((r) => {
      if (r && r.key != null && r.value != null) map[r.key] = r.value
    })
    setValues(map)
    setDirty({})
    setLoading(false)
  }

  function change(key, val) {
    setValues((v) => ({ ...v, [key]: val }))
    setDirty((d) => ({ ...d, [key]: true }))
    setMessage(null)
  }

  async function saveAll() {
    const keys = Object.keys(dirty)
    if (keys.length === 0) {
      setMessage({ kind: 'info', text: 'Nothing has been changed.' })
      return
    }

    setSaving(true)
    setMessage(null)

    const rows = keys.map((k) => ({ key: k, value: values[k] ?? '' }))

    // Needs the UNIQUE constraint added by sql/007_schema_alignment.sql
    const { error } = await supabase
      .from('site_content')
      .upsert(rows, { onConflict: 'key' })

    setSaving(false)

    if (error) {
      const permission =
        error.message.toLowerCase().includes('policy') ||
        error.message.toLowerCase().includes('permission') ||
        error.code === '42501'

      setMessage({
        kind: 'error',
        text: permission
          ? 'Not allowed. Your admin session has expired -- sign out and sign in again.'
          : 'Save failed: ' + error.message,
      })
      return
    }

    setDirty({})
    setMessage({
      kind: 'ok',
      text: 'Saved. Open the site and press Ctrl+Shift+R to see the change.',
    })
  }

  if (loading) {
    return <p style={{ color: C.textMuted, padding: 24 }}>Loading content...</p>
  }

  const changedCount = Object.keys(dirty).length

  return (
    <div style={{ paddingBottom: 90 }}>
      {SECTIONS.map((section) => (
        <div key={section.title} style={{ marginBottom: 34 }}>
          <h3 style={{
            color: C.maroon,
            fontSize: 17,
            margin: '0 0 14px',
            paddingBottom: 7,
            borderBottom: '1px solid ' + C.gray3,
          }}>
            {section.title}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {section.fields.map(([key, labelText, kind]) => (
              <div key={key} style={{ gridColumn: kind === 'area' ? '1 / -1' : 'auto' }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  color: C.textMuted,
                  marginBottom: 5,
                }}>
                  {labelText}
                  {dirty[key] && (
                    <span style={{ color: C.maroon, marginLeft: 6 }}>* unsaved</span>
                  )}
                </label>

                {kind === 'area' ? (
                  <textarea
                    style={{ ...inputStyle, minHeight: 78, resize: 'vertical' }}
                    value={values[key] ?? ''}
                    onChange={(e) => change(key, e.target.value)}
                  />
                ) : (
                  <input
                    style={inputStyle}
                    value={values[key] ?? ''}
                    onChange={(e) => change(key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Sticky save bar */}
      <div style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        background: C.white,
        borderTop: '1px solid ' + C.gray3,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        zIndex: 40,
      }}>
        <button
          onClick={saveAll}
          disabled={saving || changedCount === 0}
          style={{
            padding: '11px 26px',
            fontSize: 15,
            fontFamily: 'inherit',
            background: changedCount === 0 ? C.gray3 : C.maroon,
            color: changedCount === 0 ? C.textMuted : C.white,
            border: 'none',
            borderRadius: 2,
            cursor: changedCount === 0 ? 'default' : 'pointer',
          }}
        >
          {saving
            ? 'Saving...'
            : changedCount === 0
              ? 'No changes'
              : 'Save ' + changedCount + ' change' + (changedCount > 1 ? 's' : '')}
        </button>

        {message && (
          <span style={{
            fontSize: 14,
            color: message.kind === 'error' ? '#B02020'
                 : message.kind === 'ok'    ? '#1E6B3A'
                 : C.textMuted,
          }}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  )
}
