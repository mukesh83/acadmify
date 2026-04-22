// ─── Acadmify Academic Palette ────────────────────────────────────────────────
// Inspired by Oxford, Harvard, IISc institutional design.
// 3 colours only: Maroon + White + Warm Gray.
// Gold used exclusively for the logo tagline dot — nowhere else.

export const C = {
  // Core
  maroon:  '#7A1E1E',   // Academic Maroon — ALL text, headings, buttons
  maroonL: '#9B2A2A',   // Hover states
  maroonD: '#5C1515',   // Pressed / active states

  // Backgrounds (3 levels of warm gray — creates visual hierarchy without colour)
  white:   '#FFFFFF',   // Primary card / section background
  gray1:   '#F7F5F2',   // Secondary section background
  gray2:   '#EEEBE6',   // Tertiary — step indicators, zebra rows
  gray3:   '#E5E0D8',   // Border fills, inactive states

  // Text hierarchy
  textPrimary:  '#7A1E1E',   // Headings — maroon
  textBody:     '#4A1A1A',   // Body copy — dark maroon-brown
  textMuted:    '#7A5050',   // Captions, labels, meta

  // Borders
  border:       'rgba(122,30,30,0.13)',
  borderLight:  'rgba(122,30,30,0.07)',

  // Gold — used ONLY for logo dot decoration, not text
  dot: '#C69A4A',
}

export const BINDINGS = [
  { id: 'hardbound', label: 'Hardbound',  price: 350, desc: 'Buckram cloth cover, gold foil title stamping — the archival standard for doctoral theses' },
  { id: 'softbound', label: 'Softbound',  price: 150, desc: 'Laminated cover with perfect-bound spine — suitable for review and examiner copies' },
  { id: 'spiral',    label: 'Spiral',     price: 100, desc: 'Wire-o binding with lay-flat pages — ideal for working drafts and submissions' },
]

export const COVERS = [
  { id: 'maroon', label: 'Maroon',     hex: '#7A1E1E' },
  { id: 'navy',   label: 'Navy',       hex: '#1B3A5C' },
  { id: 'black',  label: 'Black',      hex: '#2A2020' },
  { id: 'green',  label: 'Forest',     hex: '#1E4D2B' },
  { id: 'brown',  label: 'Brown',      hex: '#5C3010' },
  { id: 'royal',  label: 'Royal Blue', hex: '#2337A0' },
]

export const STATUSES = ['received', 'printing', 'binding', 'dispatched', 'delivered']

export const STATUS_LABELS = {
  received:   'Order Received',
  printing:   'Printing in Progress',
  binding:    'Binding & Finishing',
  dispatched: 'Out for Delivery',
  delivered:  'Delivered',
}

export const STATUS_COLORS = {
  received:   '#7A1E1E',
  printing:   '#1A5C9B',
  binding:    '#7A1E1E',
  dispatched: '#1E6B3A',
  delivered:  '#166638',
}

export const DEMO_ORDERS = [
  { id:'ACD-2025-001', customer:'Dr. Priya Sharma',  thesis:'Impact of Climate Variability on Agricultural Productivity in Rajasthan',     pages:180, colorPages:12, binding:'hardbound', cover:'maroon', amount:930,  status:'printing',  date:'2025-04-18', phone:'9876543210' },
  { id:'ACD-2025-002', customer:'Rahul Verma',        thesis:'Blockchain Applications in Indian Healthcare Systems',                         pages:220, colorPages:30, binding:'hardbound', cover:'navy',   amount:1290, status:'binding',   date:'2025-04-18', phone:'9876543211' },
  { id:'ACD-2025-003', customer:'Anita Singh',        thesis:'Feminist Discourse in Rajasthani Folk Literature',                            pages:155, colorPages:5,  binding:'softbound', cover:'black',  amount:610,  status:'dispatched',date:'2025-04-17', phone:'9876543212' },
  { id:'ACD-2025-004', customer:'Dev Patel',          thesis:'Machine Learning Applications in Urban Traffic Systems',                      pages:198, colorPages:45, binding:'hardbound', cover:'green',  amount:1446, status:'received',  date:'2025-04-19', phone:'9876543213' },
  { id:'ACD-2025-005', customer:'Dr. Meera Joshi',   thesis:'Population Dynamics in Arid Zones of Western India',                          pages:210, colorPages:8,  binding:'hardbound', cover:'maroon', amount:1110, status:'delivered', date:'2025-04-16', phone:'9876543214' },
]

export const ADMIN_PASSWORD = 'acadmify2025'
