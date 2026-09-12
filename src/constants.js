// Everything in this file is sent to every visitor's browser.
// Never put a password, secret or private key here.

export const BUSINESS = {
  brand: 'Acadmify',
  legalName: 'Hari Om Graphics',
  phoneDisplay: '+91 94600-46565',
  phoneRaw: '919460046565',
  email: 'acadmify.support@gmail.com',
  address1: 'Sector 19 Circle, Chopasni Housing Board',
  address2: 'Jodhpur, Rajasthan 342008',
  mapsLink: 'https://maps.app.goo.gl/KzmYDok6VeRVzHXf7',
  lat: 26.2594097,
  lng: 72.9740779,
}

// The 12 hardbound cover colours. Ids must match the backend (routes/orders.js).
export const COVERS = [
  { id: 'maroon', label: 'Maroon', hex: '#7A1E1E' },
  { id: 'navy', label: 'Navy', hex: '#1B3A5C' },
  { id: 'black', label: 'Black', hex: '#2A2020' },
  { id: 'green', label: 'Forest green', hex: '#1E4D2B' },
  { id: 'brown', label: 'Brown', hex: '#5C3010' },
  { id: 'royal', label: 'Royal blue', hex: '#2337A0' },
  { id: 'pink', label: 'Pink', hex: '#C2185B' },
  { id: 'orange', label: 'Orange', hex: '#E65100' },
  { id: 'purple', label: 'Purple', hex: '#6A1B9A' },
  { id: 'teal', label: 'Teal', hex: '#00695C' },
  { id: 'grey', label: 'Grey', hex: '#455A64' },
  { id: 'wine', label: 'Wine', hex: '#880E4F' },
]
export const coverById = (id) => COVERS.find((c) => c.id === id) || COVERS[0]

// Cover and spine lettering. Ids must match the backend (routes/orders.js).
export const LETTERING = [
  { id: 'gold', label: 'Gold' },
  { id: 'silver', label: 'Silver' },
]
export const letteringLabel = (id) => (LETTERING.find((l) => l.id === id) || LETTERING[0]).label

// Must match the backend list
export const DEGREES = ['PhD', 'MPhil', 'MTech', 'ME', 'MSc', 'MA', 'MCom', 'MBA', 'MD', 'MS', 'LLM', 'MEd', 'BTech', 'BE', 'Other']

export const STATUSES = ['received', 'printing', 'binding', 'ready', 'dispatched', 'delivered', 'cancelled']
export const STATUS_LABELS = {
  received: 'Order received',
  printing: 'Printing',
  binding: 'Binding',
  ready: 'Ready',
  dispatched: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const DELIVERY_METHODS = [
  { id: 'pickup', label: 'Pickup from our shop', note: 'Free. Sector 19, Chopasni Housing Board.' },
  { id: 'doorstep', label: 'Doorstep in Jodhpur', note: 'By Rapido. You pay the rider’s fare on delivery.' },
  { id: 'courier', label: 'Courier outside Jodhpur', note: 'Charges quoted on WhatsApp.' },
]

export const MAX_PDF_MB = 50 // Supabase free plan limit per file
export const MAX_COVER_MB = 10
