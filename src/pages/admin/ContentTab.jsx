// Website text editor. Saves to the Supabase site_content table.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseAdmin.js'
import { CONTENT_DEFAULTS, forgetContentCache } from '../../lib/content.jsx'
import { youtubeId } from '../../lib/util.js'

const area = (key, label, hint) => [key, label, 'area', hint]

const GROUPS = [
  ['Announcement bar', [
    area('announcement_text', 'Short notice shown above the menu', 'Leave empty to hide it. Example: “Closed on 2 October for Gandhi Jayanti.”'),
  ]],
  ['Top of the homepage', [
    ['hero_eyebrow', 'Small line above the heading'],
    ['hero_title', 'Heading'],
    ['hero_subtitle', 'Heading, second part (shown in italics)'],
    area('hero_description', 'Paragraph under the heading'),
    ['hero_stat1_value', 'Number 1'], ['hero_stat1_label', 'Label 1'],
    ['hero_stat2_value', 'Number 2'], ['hero_stat2_label', 'Label 2'],
    ['hero_stat3_value', 'Number 3'], ['hero_stat3_label', 'Label 3'],
    ['hero_stat4_value', 'Number 4'], ['hero_stat4_label', 'Label 4'],
  ]],
  ['Why choose us (4 boxes)', [
    ['why_heading', 'Section heading'],
    ['why1_title', 'Box 1 title'], area('why1_text', 'Box 1 text'),
    ['why2_title', 'Box 2 title'], area('why2_text', 'Box 2 text'),
    ['why3_title', 'Box 3 title'], area('why3_text', 'Box 3 text'),
    ['why4_title', 'Box 4 title'], area('why4_text', 'Box 4 text'),
  ]],
  ['About us', [
    ['about_heading', 'Heading'],
    area('about_para1', 'Paragraph 1'),
    area('about_para2', 'Paragraph 2'),
    area('about_para3', 'Paragraph 3 (leave empty to hide)'),
  ]],
  ['Price list wording', [
    ['pricing_heading', 'Price list heading'],
    area('pricing_note', 'Line under the heading'),
    ['paper_spec', 'Paper description'],
    ['hardbound_desc', 'Hardbound binding description'],
    ['softbound_desc', 'Book binding (softbound) description'],
    ['formatting_desc', 'Thesis formatting description'],
    area('delivery_note', 'Delivery description'),
  ], 'The prices themselves are in the Pricing tab.'],
  ['Contact', [
    area('contact_address', 'Address'),
    ['contact_phone', 'Phone number as shown'],
    ['contact_whatsapp_number', 'WhatsApp number', null, 'Digits only with country code, e.g. 919460046565'],
    ['contact_email', 'Email'],
    ['contact_hours', 'Opening hours'],
    ['maps_link', 'Google Maps link (for “Get directions”)'],
    ['map_query', 'Map position', null, 'Latitude,longitude or an address for the embedded map'],
  ]],
  ['Google reviews', [
    ['google_reviews_url', 'Link to your Google reviews'],
    ['elfsight_widget_id', 'Elfsight widget id', null, 'Shows your live Google reviews. Leave empty to show the excerpts below instead.'],
    ['review1_name', 'Review 1 name'], ['review1_meta', 'Review 1 detail'], area('review1_text', 'Review 1 excerpt', 'Copy 1–2 sentences word for word from the real Google review. Never write your own.'),
    ['review2_name', 'Review 2 name'], ['review2_meta', 'Review 2 detail'], area('review2_text', 'Review 2 excerpt'),
    ['review3_name', 'Review 3 name'], ['review3_meta', 'Review 3 detail'], area('review3_text', 'Review 3 excerpt'),
    ['review4_name', 'Review 4 name'], ['review4_meta', 'Review 4 detail'], area('review4_text', 'Review 4 excerpt'),
  ]],
  ['YouTube videos', [
    ['youtube_channel_url', 'Channel link'],
    ['youtube_video1_id', 'Video 1', null, 'Paste the YouTube link or just the video id'], ['youtube_video1_title', 'Video 1 title'], area('youtube_video1_desc', 'Video 1 description'),
    ['youtube_video2_id', 'Video 2'], ['youtube_video2_title', 'Video 2 title'], area('youtube_video2_desc', 'Video 2 description'),
    ['youtube_video3_id', 'Video 3'], ['youtube_video3_title', 'Video 3 title'], area('youtube_video3_desc', 'Video 3 description'),
  ]],
  ['Footer, GST and payment', [
    area('footer_tagline', 'Footer tagline'),
    ['footer_copyright', 'Copyright line'],
    ['gstin', 'GSTIN', null, 'Shown in the footer and policies when filled in'],
    ['upi_id', 'UPI id', null, 'Leave empty: payment details are shared on WhatsApp'],
    ['upi_name', 'UPI payee name'],
  ]],
  ['Social media links', [
    ['social_instagram', 'Instagram'],
    ['social_facebook', 'Facebook'],
    ['social_x', 'X (Twitter)'],
    ['social_linkedin', 'LinkedIn'],
    ['social_telegram', 'Telegram channel'],
  ], 'Full links starting with https://. Leave empty to hide an icon.'],
]

const URL_KEYS = /^(social_|maps_link|google_reviews_url|youtube_channel_url)/

export default function ContentTab() {
  const [saved, setSaved] = useState(null)
  const [values, setValues] = useState({})
  const [dirty, setDirty] = useState({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function load() {
    const { data, error } = await supabase.from('site_content').select('key, value')
    if (error) {
      setMsg({ kind: 'error', text: 'Could not load: ' + error.message })
      setSaved({})
      return
    }
    const map = {}
    for (const r of data || []) if (r.key) map[r.key] = r.value == null ? '' : String(r.value)
    setSaved(map)
    const v = {}
    for (const key of Object.keys(CONTENT_DEFAULTS)) v[key] = key in map ? map[key] : CONTENT_DEFAULTS[key]
    setValues(v)
    setDirty({})
  }

  useEffect(() => {
    load()
  }, [])

  function change(key, value) {
    setValues((v) => ({ ...v, [key]: value }))
    setDirty((d) => ({ ...d, [key]: true }))
    setMsg(null)
  }

  async function save() {
    const keys = Object.keys(dirty)
    const rows = []
    for (const key of keys) {
      let value = String(values[key] ?? '').trim()
      if (/^youtube_video\d_id$/.test(key) && value) {
        const id = youtubeId(value)
        if (!id) return setMsg({ kind: 'error', text: 'Could not find a YouTube video in “' + value + '”.' })
        value = id
      }
      if (key === 'contact_whatsapp_number') value = value.replace(/\D/g, '')
      if (URL_KEYS.test(key) && value && !/^https:\/\//.test(value)) {
        return setMsg({ kind: 'error', text: 'Links must start with https:// (check “' + key + '”).' })
      }
      rows.push({ key, value, updated_at: new Date().toISOString() })
    }
    setBusy(true)
    const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' })
    setBusy(false)
    if (error) {
      setMsg({ kind: 'error', text: 'Save failed: ' + error.message })
      return
    }
    forgetContentCache()
    setMsg({ kind: 'ok', text: 'Saved ' + rows.length + ' change' + (rows.length === 1 ? '' : 's') + '. Refresh the website to see them.' })
    load()
  }

  if (!saved) return <p>Loading website text…</p>
  const count = Object.keys(dirty).length

  return (
    <div>
      {GROUPS.map(([title, fields, note], gi) => (
        <details key={title} className="content-group" open={gi < 2}>
          <summary>{title}</summary>
          <div>
            {note && <p className="hint">{note}</p>}
            <div className="content-grid">
              {fields.map(([key, label, kind, hint]) => {
                const id = 'c-' + key
                const isDefault = !(key in saved)
                return (
                  <div key={key} className={'field' + (kind === 'area' ? ' wide' : '')}>
                    <label htmlFor={id}>{label}{dirty[key] && <span className="optional"> · not saved yet</span>}</label>
                    {kind === 'area' ? (
                      <textarea id={id} rows={3} value={values[key] ?? ''} onChange={(e) => change(key, e.target.value)} />
                    ) : (
                      <input id={id} value={values[key] ?? ''} onChange={(e) => change(key, e.target.value)} />
                    )}
                    <div className="field-tools">
                      {hint && <span>{hint}</span>}
                      {isDefault && !dirty[key] && <span>(website default)</span>}
                      {values[key] !== CONTENT_DEFAULTS[key] && CONTENT_DEFAULTS[key] !== '' && (
                        <button type="button" className="link-btn" onClick={() => change(key, CONTENT_DEFAULTS[key])}>Use default</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </details>
      ))}

      <div className="save-bar">
        <div className="save-bar-inner">
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy || count === 0}>
            {busy ? 'Saving…' : count === 0 ? 'No changes' : 'Save ' + count + ' change' + (count === 1 ? '' : 's')}
          </button>
          {msg && <p className={'admin-msg ' + msg.kind} role="status">{msg.text}</p>}
        </div>
      </div>
    </div>
  )
}
