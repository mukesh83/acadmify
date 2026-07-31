// ============================================================================
// src/hooks/useContent.js
// Loads editable website text from the Supabase site_content table.
//
// Usage is unchanged from before:
//    const { c, loading } = useContent()
//    c('hero_title')
//
// Reading works logged-out (the public site needs it).
// Saving is admin-only and lives in ContentEditor.jsx.
// ============================================================================

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Shown when a key has no value saved in Supabase yet.
// Anything you have already saved in the CMS overrides these.
export const CONTENT_DEFAULTS = {
  hero_eyebrow:     'PRINT - BIND - SUBMIT',
  hero_title:       'Thesis printing done properly',
  hero_subtitle:    'Jodhpur',
  hero_description: 'Hardbound thesis printing and binding for research scholars, delivered to your door in 24 to 48 hours.',
  hero_stat1:       '200+',
  hero_stat1_label: 'Theses delivered',
  hero_stat2:       '24hr',
  hero_stat2_label: 'Typical turnaround',
  hero_stat3:       'Rs.2',
  hero_stat3_label: 'Per B&W page',
  hero_stat4:       'Free',
  hero_stat4_label: 'Delivery in Jodhpur',

  about_heading: 'About Acadmify',
  about_para1:   'Acadmify is the printing arm of Hari Om Graphics, based at Sector 19 Circle, Chopasni Housing Board, Jodhpur.',
  about_para2:   'We print and hardbind academic work for scholars at IIT Jodhpur, AIIMS Jodhpur, JNVU, MBM University and FDDI. We are a printing and binding service only -- we do not write, edit or format academic content.',

  contact_address:  'Sector 19 Circle, Chopasni Housing Board, Jodhpur, Rajasthan 342008',
  contact_phone:    '+91 94600-46565',
  contact_whatsapp: '919460046565',
  contact_email:    'acadmify.support@gmail.com',
  contact_hours:    'Monday to Saturday, 9:00 AM to 8:00 PM',

  pricing_bw:        '2',
  pricing_colour:    '10',
  pricing_hardbound: '250',
  pricing_ohp:       '5',
  pricing_delivery:  '50',

  youtube_channel:            'https://www.youtube.com/@acadmify',
  youtube_video1_id:          '',
  youtube_video1_title:       '',
  youtube_video1_description: '',
  youtube_video2_id:          '',
  youtube_video2_title:       '',
  youtube_video2_description: '',
  youtube_video3_id:          '',
  youtube_video3_title:       '',
  youtube_video3_description: '',

  footer_tagline:   'Thesis printing, hardbound binding and doorstep delivery for research scholars in Jodhpur.',
  footer_copyright: 'Acadmify. All rights reserved.',
}

export function useContent() {
  const [values, setValues]   = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // If your columns are named differently, change 'key' and 'value' here.
      const { data, error } = await supabase
        .from('site_content')
        .select('key, value')

      if (error) throw error

      const map = {}
      ;(data || []).forEach((row) => {
        if (row && row.key != null) map[row.key] = row.value
      })
      setValues(map)
      setError(null)
    } catch (e) {
      // Never let a content failure blank out the website.
      // We fall through to CONTENT_DEFAULTS instead.
      console.error('Could not load site content:', e.message)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // c('hero_title') -> saved value, else default, else empty string
  const c = useCallback((key, fallback) => {
    const saved = values[key]
    if (saved !== undefined && saved !== null && saved !== '') return saved
    if (fallback !== undefined) return fallback
    return CONTENT_DEFAULTS[key] ?? ''
  }, [values])

  return { c, values, loading, error, reload: load }
}

export default useContent
