// ============================================================================
// src/constants/index.js
//
// IMPORTANT: everything in this file is sent to every visitor's browser.
// Never put a password, secret or API key here.
// The old ADMIN_PASSWORD has been removed -- logins now go through
// Supabase Auth, where the password lives on Supabase's servers.
// ============================================================================

// ---------------------------------------------------------------------------
// BRAND COLOURS
// ---------------------------------------------------------------------------
export const C = {
  maroon:    '#7A1E1E',                 // Academic Maroon - headings, buttons
  white:     '#FFFFFF',
  gray1:     '#F7F5F2',                 // Parchment Cream - section background
  gray2:     '#EEEBE6',
  gray3:     '#E5E0D8',                 // borders, inactive
  textBody:  '#4A1A1A',
  textMuted: '#7A5050',
  border:    'rgba(122,30,30,0.13)',
  dot:       '#C69A4A',                 // Antique Gold - decoration ONLY.
                                        // Never use for text: it fails
                                        // contrast checks badly on white.
}

// ---------------------------------------------------------------------------
// SOCIAL MEDIA LINKS
// Leave a url as '' and that icon simply will not appear in the footer.
// Add a platform on the day you actually start posting to it, not before.
// ---------------------------------------------------------------------------
export const SOCIALS = [
  { id: 'whatsapp',  label: 'WhatsApp',  url: 'https://wa.me/919460046565' },
  { id: 'youtube',   label: 'YouTube',   url: 'https://www.youtube.com/@acadmify' },
  { id: 'instagram', label: 'Instagram', url: '' },
  { id: 'facebook',  label: 'Facebook',  url: '' },
  { id: 'linkedin',  label: 'LinkedIn',  url: '' },
  { id: 'twitter',   label: 'X',         url: '' },
]

// ---------------------------------------------------------------------------
// BUSINESS DETAILS - single source of truth.
// These must match your Google Business Profile character for character.
// ---------------------------------------------------------------------------
export const BUSINESS = {
  brand:     'Acadmify',
  legalName: 'Hari Om Graphics',
  phone:     '+91 94600-46565',
  phoneRaw:  '919460046565',
  email:     'acadmify.support@gmail.com',
  address1:  'Sector 19 Circle, Chopasni Housing Board',
  address2:  'Jodhpur, Rajasthan 342008',
  // Replace with the exact link from Google Business Profile -> Ask for reviews
  googleReviewUrl: 'https://g.page/r/YOUR_REVIEW_LINK/review',
}

export const waLink = (msg) =>
  'https://wa.me/' + BUSINESS.phoneRaw + '?text=' + encodeURIComponent(
    msg || 'Hello Acadmify! I want to get my thesis printed.'
  )

// ---------------------------------------------------------------------------
// COVER COLOUR OPTIONS
// ---------------------------------------------------------------------------
export const COVERS = [
  { id: 'maroon', label: 'Maroon',     hex: '#7A1E1E' },
  { id: 'navy',   label: 'Navy',       hex: '#1B3A5C' },
  { id: 'black',  label: 'Black',      hex: '#2A2020' },
  { id: 'green',  label: 'Forest',     hex: '#1E4D2B' },
  { id: 'brown',  label: 'Brown',      hex: '#5C3010' },
  { id: 'royal',  label: 'Royal Blue', hex: '#2337A0' },
  { id: 'pink',   label: 'Pink',       hex: '#C2185B' },
  { id: 'orange', label: 'Orange',     hex: '#E65100' },
  { id: 'purple', label: 'Purple',     hex: '#6A1B9A' },
  { id: 'teal',   label: 'Teal',       hex: '#00695C' },
  { id: 'grey',   label: 'Grey',       hex: '#455A64' },
  { id: 'wine',   label: 'Wine',       hex: '#880E4F' },
]

// ---------------------------------------------------------------------------
// ORDER STATUS
// ---------------------------------------------------------------------------
export const STATUS_FLOW = [
  'received', 'printing', 'binding', 'dispatched', 'delivered',
]

export const STATUS_COLOURS = {
  received:   '#7A1E1E',
  printing:   '#1A5C9B',
  binding:    '#7A1E1E',
  dispatched: '#1E6B3A',
  delivered:  '#166638',
}

// ---------------------------------------------------------------------------
// Kept only so any older file that still imports it does not break the build.
// Safe to delete once you have confirmed nothing imports DEMO_ORDERS.
// ---------------------------------------------------------------------------
export const DEMO_ORDERS = []
