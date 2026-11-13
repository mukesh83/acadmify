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

// Cover choices for a thesis. Ids must match the backend (routes/orders.js).
// "laminated" is a colour-printed laminated cover made from the customer's design.
export const COVERS = [
  { id: 'maroon', label: 'Maroon', hex: '#7A1E1E' },
  { id: 'black', label: 'Black', hex: '#2A2020' },
  { id: 'orange', label: 'Orange', hex: '#E65100' },
  { id: 'red', label: 'Red', hex: '#B71C1C' },
  { id: 'laminated', label: 'Laminated colour-printed cover', hex: '#2C6E8F', special: true },
]
export const coverById = (id) => COVERS.find((c) => c.id === id) || COVERS[0]

// Cover and spine lettering. Ids must match the backend (routes/orders.js).
export const LETTERING = [
  { id: 'gold', label: 'Gold' },
  { id: 'silver', label: 'Silver' },
  { id: 'black', label: 'Black' },
]

export const BINDINGS = [
  { id: 'hardbound', label: 'Hardbound' },
  { id: 'softbound', label: 'Softbound' },
]
export const bindingLabel = (id) => (BINDINGS.find((b) => b.id === id) || BINDINGS[0]).label
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
export const MAX_GUIDELINES_MB = 10
