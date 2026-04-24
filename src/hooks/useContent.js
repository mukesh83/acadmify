/**
 * useContent — fetches all site_content rows from Supabase.
 * Falls back to hardcoded defaults if Supabase is not yet configured.
 * Usage: const { c, loading } = useContent()
 *        Then: c('hero_title') returns the live value
 */

import { useState, useEffect } from 'react'

const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL    || ''
const SUPABASE_ANON   = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// ── Hardcoded defaults — used when Supabase is not connected ──────────────────
// These are the fallback values so the website always works.
const DEFAULTS = {
  hero_eyebrow:    "Jodhpur, Rajasthan — India's Premier Academic Thesis Printing Service",
  hero_title:      'Print. Bind. Submit.',
  hero_subtitle:   'With Confidence.',
  hero_description:"Acadmify is Jodhpur's trusted thesis printing and binding service for PhD scholars, postgraduate researchers, and academic institutions. Upload your thesis tonight — receive a professionally bound copy at your doorstep within 24 hours.",
  hero_stat1_value:'200+', hero_stat1_label:'Theses Printed',
  hero_stat2_value:'90+',  hero_stat2_label:'Happy Scholars',
  hero_stat3_value:'24 hr',hero_stat3_label:'Doorstep Delivery',
  hero_stat4_value:'₹2/pg',hero_stat4_label:'B&W Printing',

  about_heading: "Jodhpur's Leading Thesis Experts",
  about_para1:   "We are Jodhpur's leading experts in professional thesis formatting, printing and binding at reasonable cost. We have completed over 200+ theses from IIT, AIIMS, JNVU, FDDI, MAUJ and other universities, serving over 90+ satisfied customers visible on our Google Maps reviews.",
  about_para2:   "We are the only destination for fast, efficient, reliable and cost-effective thesis delivery in Jodhpur, Rajasthan. Whether you are submitting your PhD dissertation at AIIMS Jodhpur or your MTech thesis at IIT Jodhpur — Acadmify delivers on time, every time.",

  contact_address: 'Sector 19 Circle, Chopasni Housing Board, Jodhpur, Rajasthan\n(5 km from AIIMS Jodhpur)',
  contact_phone:   '+91 94600-46565',
  contact_email:   'acadmify.support@gmail.com',
  contact_hours:   'Open 7 days — 9 AM to 11 PM',
  contact_whatsapp_number: '919460046565',

  pricing_heading:    'Transparent, Research-Friendly Pricing',
  pricing_bw:         '2',
  pricing_color:      '10',
  pricing_hard:       '350',
  pricing_soft:       '150',
  pricing_spiral:     '100',
  pricing_delivery:   '50',
  pricing_free_above: '500',

  youtube_channel_url:  'https://www.youtube.com/@acadmify',
  youtube_video1_id: '', youtube_video1_title: 'How to Format Your Thesis for Printing',
  youtube_video1_desc: 'Step-by-step guide to preparing your thesis PDF before sending to Acadmify.',
  youtube_video2_id: '', youtube_video2_title: 'Hardbound vs Softbound — Which to Choose?',
  youtube_video2_desc: 'Understanding binding options for PhD and MTech submissions in Indian universities.',
  youtube_video3_id: '', youtube_video3_title: 'Thesis Margin & Page Setup Guide',
  youtube_video3_desc: 'Correct margins, font size, and page setup as per UGC and university guidelines.',

  footer_tagline:   'PRINT ◆ BIND ◆ SUBMIT',
  footer_copyright: '© 2025 Acadmify. GST Registered: Hari Om Graphics, Jodhpur.',
}

export function useContent() {
  const [content, setContent] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      // No Supabase configured — use defaults silently
      setLoading(false)
      return
    }

    fetch(`${SUPABASE_URL}/rest/v1/site_content?select=key,value`, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      }
    })
      .then(r => r.json())
      .then(rows => {
        if (Array.isArray(rows)) {
          const merged = { ...DEFAULTS }
          rows.forEach(({ key, value }) => { merged[key] = value })
          setContent(merged)
        }
      })
      .catch(() => {}) // silently fall back to defaults
      .finally(() => setLoading(false))
  }, [])

  // c('key') returns live value or default
  const c = (key) => content[key] ?? DEFAULTS[key] ?? ''

  return { c, loading, raw: content }
}
