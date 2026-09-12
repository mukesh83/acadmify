// Editable website text (Supabase `site_content` table, edited in Admin -> Website text).
// The page never waits for Supabase: it shows the defaults below (or the last
// values this browser saw), then swaps in the live text when it arrives.
//
//   const c = useContent()
//   c('hero_title')
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { publicSelect } from './supabasePublic.js'
import { readJson, writeJson, removeKey } from './util.js'

export const CONTENT_DEFAULTS = {
  announcement_text: '',

  hero_eyebrow: 'Print · Bind · Submit',
  hero_title: 'Thesis printing & hardbound binding',
  hero_subtitle: 'in Jodhpur',
  hero_description:
    'Upload your PDF, see the exact price as you type, then collect your bound thesis from our shop or get it delivered. Usually ready in 24–48 hours.',
  hero_stat1_value: '500+',
  hero_stat1_label: 'Theses delivered',
  hero_stat2_value: '24–48 h',
  hero_stat2_label: 'Usual turnaround',
  hero_stat3_value: '₹2',
  hero_stat3_label: 'Per B&W page',
  hero_stat4_value: '12',
  hero_stat4_label: 'Cover colours',

  about_heading: 'About Acadmify',
  about_para1:
    'Acadmify is the thesis printing brand of Hari Om Graphics, at Sector 19 Circle, Chopasni Housing Board, Jodhpur.',
  about_para2:
    'We print and hardbind theses and dissertations for research scholars across Jodhpur, and deliver them to your door or keep them ready for pickup.',
  about_para3:
    'We print exactly the file you send. Need your document formatted first? We offer thesis formatting too. We never write or change the academic content of your work.',

  why_heading: 'Why scholars choose Acadmify',
  why1_title: 'Exact price upfront',
  why1_text: 'See the full total, GST included, before you order. You pay only after we confirm your order on WhatsApp.',
  why2_title: 'Printed on 100 gsm paper',
  why2_text: 'Clean black & white and colour printing, hardbound with gold or silver lettering on the cover and spine.',
  why3_title: 'Usually ready in 24–48 hours',
  why3_text: 'Urgent job? Message us on WhatsApp before you order and we will tell you honestly what is possible.',
  why4_title: 'Your file stays private',
  why4_text: 'Opened only to print your order, never shared, and deleted 30 days after delivery.',

  paper_spec: '100 gsm bond paper / 100 gsm white paper',
  hardbound_desc: 'Hardback binding with gold or silver lettering on the cover and spine',
  softbound_desc: 'Softback binding with cover printing, for general books (not theses)',
  formatting_desc: 'Formatting of your thesis document before printing. Details agreed on WhatsApp.',
  delivery_note:
    'Doorstep delivery in Jodhpur by Rapido — rider fare paid on delivery. Shop pickup is free. Outside Jodhpur: courier, quoted on WhatsApp.',
  pricing_heading: 'Published prices, no surprises',
  pricing_note: 'GST is added to the total. The calculator above shows your exact amount.',

  contact_address: 'Sector 19 Circle, Chopasni Housing Board, Jodhpur, Rajasthan 342008',
  contact_phone: '+91 94600-46565',
  contact_whatsapp_number: '919460046565',
  contact_email: 'acadmify.support@gmail.com',
  contact_hours: 'Every day, 5 PM – 11 PM',
  map_query: '26.2594097,72.9740779',
  maps_link: 'https://maps.app.goo.gl/KzmYDok6VeRVzHXf7',

  google_reviews_url: 'https://maps.app.goo.gl/KzmYDok6VeRVzHXf7',
  elfsight_widget_id: '2ecb70bc-3b18-4c40-929f-b1ca11847144',
  // Shown only when the Elfsight widget id above is empty.
  // Paste a short excerpt copied from the real Google review.
  review1_name: 'V K',
  review1_meta: 'Local Guide, Google review',
  review1_text: '',
  review2_name: 'Isha Yadav',
  review2_meta: 'Google review',
  review2_text: '',
  review3_name: 'Natasha',
  review3_meta: 'Google review',
  review3_text: '',
  review4_name: '',
  review4_meta: '',
  review4_text: '',

  youtube_channel_url: 'https://www.youtube.com/@acadmify',
  youtube_video1_id: '',
  youtube_video1_title: '',
  youtube_video1_desc: '',
  youtube_video2_id: '',
  youtube_video2_title: '',
  youtube_video2_desc: '',
  youtube_video3_id: '',
  youtube_video3_title: '',
  youtube_video3_desc: '',

  footer_tagline: 'Thesis printing, hardbound binding and delivery for research scholars in Jodhpur.',
  footer_copyright: 'Acadmify. All rights reserved.',

  upi_id: '',
  upi_name: 'Hari Om Graphics',
  gstin: '08BFQPP6630D1Z7',

  social_instagram: 'https://www.instagram.com/acadmify/',
  social_facebook: 'https://www.facebook.com/acadmify',
  social_x: 'https://x.com/acadmify',
  social_linkedin: '',
  social_telegram: 'https://t.me/acadmify',
}

// Keys an admin may deliberately leave empty: an empty saved value hides the
// item instead of falling back to the default above.
const OPTIONAL = /^(announcement_text|hero_eyebrow|about_para3|review\d_|youtube_video\d_|elfsight_widget_id|upi_|gstin|social_)/

const CACHE_KEY = 'acadmify.content.v2'

function makeGetter(saved) {
  return (key) => {
    const v = saved[key]
    if (typeof v === 'string' && (v.trim() !== '' || (OPTIONAL.test(key) && key in saved))) return v.trim()
    return CONTENT_DEFAULTS[key] ?? ''
  }
}

const fallbackGetter = makeGetter({})
const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [saved, setSaved] = useState(() => readJson('localStorage', CACHE_KEY) || {})

  useEffect(() => {
    let alive = true
    publicSelect('site_content?select=key,value').then((rows) => {
      if (!alive || !Array.isArray(rows)) return
      const map = {}
      for (const row of rows) if (row && row.key) map[row.key] = row.value == null ? '' : String(row.value)
      writeJson('localStorage', CACHE_KEY, map)
      setSaved(map)
    })
    return () => {
      alive = false
    }
  }, [])

  const getter = useMemo(() => makeGetter(saved), [saved])
  return <ContentContext.Provider value={getter}>{children}</ContentContext.Provider>
}

export const useContent = () => useContext(ContentContext) || fallbackGetter

export const forgetContentCache = () => removeKey('localStorage', CACHE_KEY)
