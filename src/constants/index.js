// ─── Brand Colours ────────────────────────────────────────────────────────────
export const C = {
  maroon:      '#7A1E1E',
  maroonL:     '#9B2A2A',
  maroonD:     '#5C1515',
  white:       '#FFFFFF',
  gray1:       '#F7F5F2',
  gray2:       '#EEEBE6',
  gray3:       '#E5E0D8',
  textPrimary: '#7A1E1E',
  textBody:    '#4A1A1A',
  textMuted:   '#7A5050',
  border:      'rgba(122,30,30,0.13)',
  borderLight: 'rgba(122,30,30,0.07)',
  dot:         '#C69A4A',
}

// ─── Binding — Hardbound only at ₹250 ────────────────────────────────────────
export const BINDINGS = [
  { id: 'hardbound', label: 'Hardbound', price: 250, desc: 'Buckram cloth cover, gold foil title stamping — archival quality' },
]

// ─── Cover Colours — expanded palette ────────────────────────────────────────
export const COVERS = [
  { id: 'maroon',  label: 'Maroon',     hex: '#7A1E1E' },
  { id: 'navy',    label: 'Navy',       hex: '#1B3A5C' },
  { id: 'black',   label: 'Black',      hex: '#2A2020' },
  { id: 'green',   label: 'Forest',     hex: '#1E4D2B' },
  { id: 'brown',   label: 'Brown',      hex: '#5C3010' },
  { id: 'royal',   label: 'Royal Blue', hex: '#2337A0' },
  { id: 'pink',    label: 'Pink',       hex: '#C2185B' },
  { id: 'orange',  label: 'Orange',     hex: '#E65100' },
  { id: 'purple',  label: 'Purple',     hex: '#6A1B9A' },
  { id: 'teal',    label: 'Teal',       hex: '#00695C' },
  { id: 'grey',    label: 'Grey',       hex: '#455A64' },
  { id: 'wine',    label: 'Wine',       hex: '#880E4F' },
]

// ─── Pricing Rules ────────────────────────────────────────────────────────────
export const PRICING = {
  bw:           2,     // ₹ per B&W page
  colorNormal:  10,    // ₹ per colour page (default)
  colorBulk:    6,     // ₹ per colour page (if colorPages > 10 AND copies > 2)
  ohp:          5,     // ₹ per OHP transparent sheet
  hardbound:    250,   // ₹ per copy
  delivery:     50,    // ₹ flat delivery charge
  freeAbove:    500,   // free delivery if subtotal >= this
  gst:          0.18,  // 18%
}

// ─── Order Status ─────────────────────────────────────────────────────────────
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

// ─── Demo orders ─────────────────────────────────────────────────────────────
export const DEMO_ORDERS = [
  { id:'ACD-2025-001', customer:'Dr. Priya Sharma',  thesis:'AIIMS Jodhpur',   pages:180, colorPages:12, binding:'hardbound', cover:'maroon', amount:1166, status:'printing',  date:'2025-04-18', phone:'9876543210' },
  { id:'ACD-2025-002', customer:'Rahul Verma',        thesis:'IIT Jodhpur',     pages:220, colorPages:30, binding:'hardbound', cover:'navy',   amount:1430, status:'binding',   date:'2025-04-18', phone:'9876543211' },
  { id:'ACD-2025-003', customer:'Anita Singh',        thesis:'JNVU Jodhpur',    pages:155, colorPages:5,  binding:'hardbound', cover:'black',  amount:916,  status:'dispatched',date:'2025-04-17', phone:'9876543212' },
  { id:'ACD-2025-004', customer:'Dev Patel',          thesis:'MBM University',  pages:198, colorPages:45, binding:'hardbound', cover:'green',  amount:1548, status:'received',  date:'2025-04-19', phone:'9876543213' },
  { id:'ACD-2025-005', customer:'Dr. Meera Joshi',   thesis:'JNVU Jodhpur',    pages:210, colorPages:8,  binding:'hardbound', cover:'maroon', amount:1180, status:'delivered', date:'2025-04-16', phone:'9876543214' },
]

export const ADMIN_PASSWORD = 'acadmify2025'
