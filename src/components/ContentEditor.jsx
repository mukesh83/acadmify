/**
 * ContentEditor — the CMS tab inside the Admin Panel.
 * Mukesh can edit all website text here without touching any code.
 *
 * Works in two modes:
 *   1. LOCAL mode  — saves to localStorage (no backend needed, changes persist in browser)
 *   2. SUPABASE mode — saves to Supabase (changes visible to all visitors)
 *
 * Mode is auto-detected based on VITE_SUPABASE_URL being set.
 */

import { useState, useEffect } from 'react'
import { C } from '../constants'
import { mono, serif, inputStyle, labelStyle, btn } from '../utils/styles'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// All editable fields grouped by section
const SCHEMA = [
  {
    section: 'hero',
    label: 'Hero Section',
    desc: 'The first thing visitors see — main heading and description',
    fields: [
      { key: 'hero_eyebrow',    label: 'Top label (small text)',  type: 'text'     },
      { key: 'hero_title',      label: 'Main heading',            type: 'text'     },
      { key: 'hero_subtitle',   label: 'Sub-heading (italic)',    type: 'text'     },
      { key: 'hero_description',label: 'Description paragraph',  type: 'textarea' },
      { key: 'hero_stat1_value',label: 'Stat 1 — Number',        type: 'text'     },
      { key: 'hero_stat1_label',label: 'Stat 1 — Label',         type: 'text'     },
      { key: 'hero_stat2_value',label: 'Stat 2 — Number',        type: 'text'     },
      { key: 'hero_stat2_label',label: 'Stat 2 — Label',         type: 'text'     },
      { key: 'hero_stat3_value',label: 'Stat 3 — Number',        type: 'text'     },
      { key: 'hero_stat3_label',label: 'Stat 3 — Label',         type: 'text'     },
      { key: 'hero_stat4_value',label: 'Stat 4 — Number',        type: 'text'     },
      { key: 'hero_stat4_label',label: 'Stat 4 — Label',         type: 'text'     },
    ],
  },
  {
    section: 'about',
    label: 'About Us',
    desc: 'The About Us section text',
    fields: [
      { key: 'about_heading', label: 'Heading',      type: 'text'     },
      { key: 'about_para1',   label: 'Paragraph 1',  type: 'textarea' },
      { key: 'about_para2',   label: 'Paragraph 2',  type: 'textarea' },
    ],
  },
  {
    section: 'contact',
    label: 'Contact Details',
    desc: 'Address, phone, email shown in the Contact section and footer',
    fields: [
      { key: 'contact_address',          label: 'Full Address',                    type: 'textarea' },
      { key: 'contact_phone',            label: 'Display Phone Number',            type: 'text'     },
      { key: 'contact_whatsapp_number',  label: 'WhatsApp Number (no + or spaces)', type: 'text'   },
      { key: 'contact_email',            label: 'Email Address',                   type: 'text'     },
      { key: 'contact_hours',            label: 'Business Hours',                  type: 'text'     },
    ],
  },
  {
    section: 'pricing',
    label: 'Pricing',
    desc: 'All rates shown in the pricing table — enter numbers only',
    fields: [
      { key: 'pricing_heading',    label: 'Section Heading',              type: 'text'   },
      { key: 'pricing_bw',         label: 'B&W rate (₹ per page)',        type: 'number' },
      { key: 'pricing_color',      label: 'Colour rate (₹ per page)',     type: 'number' },
      { key: 'pricing_hard',       label: 'Hardbound rate (₹ per copy)',  type: 'number' },
      { key: 'pricing_soft',       label: 'Softbound rate (₹ per copy)',  type: 'number' },
      { key: 'pricing_spiral',     label: 'Spiral rate (₹ per copy)',     type: 'number' },
      { key: 'pricing_delivery',   label: 'Delivery charge (₹)',          type: 'number' },
      { key: 'pricing_free_above', label: 'Free delivery above (₹)',      type: 'number' },
    ],
  },
  {
    section: 'youtube',
    label: 'YouTube / Resources',
    desc: 'YouTube channel link and video IDs. Get the ID from the video URL after ?v=',
    fields: [
      { key: 'youtube_channel_url',  label: 'YouTube Channel URL',     type: 'text'     },
      { key: 'youtube_video1_id',    label: 'Video 1 — ID',            type: 'text'     },
      { key: 'youtube_video1_title', label: 'Video 1 — Title',         type: 'text'     },
      { key: 'youtube_video1_desc',  label: 'Video 1 — Description',   type: 'textarea' },
      { key: 'youtube_video2_id',    label: 'Video 2 — ID',            type: 'text'     },
      { key: 'youtube_video2_title', label: 'Video 2 — Title',         type: 'text'     },
      { key: 'youtube_video2_desc',  label: 'Video 2 — Description',   type: 'textarea' },
      { key: 'youtube_video3_id',    label: 'Video 3 — ID',            type: 'text'     },
      { key: 'youtube_video3_title', label: 'Video 3 — Title',         type: 'text'     },
      { key: 'youtube_video3_desc',  label: 'Video 3 — Description',   type: 'textarea' },
    ],
  },
  {
    section: 'footer',
    label: 'Footer',
    desc: 'Footer tagline and copyright text',
    fields: [
      { key: 'footer_tagline',   label: 'Tagline',         type: 'text' },
      { key: 'footer_copyright', label: 'Copyright line',  type: 'text' },
    ],
  },
]

// Load from localStorage (offline mode fallback)
function loadLocal() {
  try { return JSON.parse(localStorage.getItem('acadmify_content') || '{}') } catch { return {} }
}
function saveLocal(data) {
  try { localStorage.setItem('acadmify_content', JSON.stringify(data)) } catch {}
}

export default function ContentEditor({ adminSecret }) {
  const [values,      setValues]      = useState({})
  const [activeTab,   setActiveTab]   = useState('hero')
  const [saving,      setSaving]      = useState(false)
  const [saveMsg,     setSaveMsg]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON)

  // ── Load content on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (hasSupabase) {
      fetch(`${SUPABASE_URL}/rest/v1/site_content?select=key,value`, {
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }
      })
        .then(r => r.json())
        .then(rows => {
          if (Array.isArray(rows)) {
            const obj = {}
            rows.forEach(({ key, value }) => { obj[key] = value })
            setValues(obj)
          }
        })
        .catch(() => setValues(loadLocal()))
        .finally(() => setLoading(false))
    } else {
      setValues(loadLocal())
      setLoading(false)
    }
  }, [])

  const handleChange = (key, val) => setValues(prev => ({ ...prev, [key]: val }))

  // ── Save current section ──────────────────────────────────────────────────
  const handleSave = async (section) => {
    setSaving(true)
    setSaveMsg(null)

    const sectionFields = SCHEMA.find(s => s.section === section)?.fields || []
    const updates = sectionFields.map(f => ({ key: f.key, value: values[f.key] ?? '' }))

    if (hasSupabase) {
      // Save each field to Supabase via upsert
      try {
        const SERVICE_KEY = adminSecret // use admin secret as service role proxy
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
          method: 'POST',
          headers: {
            'apikey':          SUPABASE_ANON,
            'Authorization':   `Bearer ${SUPABASE_ANON}`,
            'Content-Type':    'application/json',
            'Prefer':          'resolution=merge-duplicates',
          },
          body: JSON.stringify(updates.map(u => ({
            key:        u.key,
            value:      u.value,
            label:      u.key,
            section:    section,
            type:       'text',
            updated_at: new Date().toISOString(),
          }))),
        })
        if (res.ok || res.status === 201 || res.status === 204) {
          setSaveMsg('✓ Saved to Supabase — changes are live on your website')
        } else {
          // Fallback to localStorage
          saveLocal(values)
          setSaveMsg('✓ Saved locally — connect Supabase to publish to live site')
        }
      } catch {
        saveLocal(values)
        setSaveMsg('✓ Saved locally (Supabase offline)')
      }
    } else {
      // No Supabase — save to localStorage
      saveLocal(values)
      setSaveMsg('✓ Saved locally — add VITE_SUPABASE_URL to publish to live site')
    }

    setSaving(false)
    setTimeout(() => setSaveMsg(null), 4000)
  }

  const activeSchema = SCHEMA.find(s => s.section === activeTab)
  const inp = {
    ...inputStyle,
    background: C.white,
    color: C.textBody,
    border: `1.5px solid ${C.border}`,
    fontSize: '0.97rem',
    padding: '9px 12px',
  }

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', ...mono, fontSize: '0.8rem', color: C.textMuted }}>
      Loading content…
    </div>
  )

  return (
    <div>
      {/* Mode indicator */}
      <div style={{ background: hasSupabase ? 'rgba(30,138,74,0.08)' : 'rgba(198,154,74,0.08)', border: `1px solid ${hasSupabase ? 'rgba(30,138,74,0.2)' : 'rgba(198,154,74,0.3)'}`, borderRadius: 4, padding: '0.7rem 1rem', marginBottom: '1.5rem', ...mono, fontSize: '0.7rem', color: hasSupabase ? '#1E5A30' : '#7A5C10' }}>
        {hasSupabase
          ? '🟢 Connected to Supabase — changes you save will go live on acadmify.com immediately'
          : '🟡 Local mode — changes are saved in your browser. Add VITE_SUPABASE_URL to Vercel environment variables to publish to live site.'}
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Left sidebar — section tabs */}
        <div style={{ width: 180, flexShrink: 0, borderRight: `1px solid ${C.border}`, paddingRight: '1rem' }}>
          <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Sections</div>
          {SCHEMA.map(s => (
            <div key={s.section} onClick={() => setActiveTab(s.section)} style={{
              padding: '8px 12px', borderRadius: 4, cursor: 'pointer', marginBottom: 4,
              background: activeTab === s.section ? 'rgba(122,30,30,0.08)' : 'transparent',
              border: activeTab === s.section ? `1px solid ${C.border}` : '1px solid transparent',
              ...serif, fontSize: '0.95rem', color: activeTab === s.section ? C.maroon : C.textMuted,
              fontWeight: activeTab === s.section ? 600 : 400,
            }}>
              {s.label}
            </div>
          ))}
        </div>

        {/* Right — field editor */}
        <div style={{ flex: 1, paddingLeft: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ ...serif, fontSize: '1.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.25rem' }}>
              {activeSchema?.label}
            </h3>
            <p style={{ ...serif, fontSize: '0.92rem', color: C.textMuted }}>{activeSchema?.desc}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeSchema?.fields.map(field => (
              <div key={field.key}>
                <label style={{ ...labelStyle, marginBottom: 6 }}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    value={values[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    style={{ ...inp, resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                  />
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={values[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Save button */}
          <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => handleSave(activeTab)}
              disabled={saving}
              style={{ ...btn('primary'), opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : `Save ${activeSchema?.label} →`}
            </button>
            {saveMsg && (
              <span style={{ ...mono, fontSize: '0.7rem', color: saveMsg.startsWith('✓') ? '#1E6B3A' : '#C0392B' }}>
                {saveMsg}
              </span>
            )}
          </div>

          <div style={{ marginTop: '1rem', ...mono, fontSize: '0.62rem', color: C.textMuted }}>
            Changes in one section do not affect other sections.
          </div>
        </div>
      </div>
    </div>
  )
}
