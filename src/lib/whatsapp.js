// WhatsApp and phone links. The number comes from Website text
// (contact_whatsapp_number); a missing or broken number falls back to the
// shop number, so a link can never become wa.me/?text=...
import { BUSINESS } from '../constants.js'
import { useContent } from './content.jsx'

export function waNumber(raw) {
  let digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 10) digits = '91' + digits
  return digits.length >= 11 && digits.length <= 15 ? digits : BUSINESS.phoneRaw
}

export const waLink = (message, number) =>
  'https://wa.me/' + waNumber(number) + (message ? '?text=' + encodeURIComponent(message) : '')

// const wa = useWaLink();  <a href={wa('Hello!')}>
export function useWaLink() {
  const c = useContent()
  const number = c('contact_whatsapp_number')
  return (message) => waLink(message, number)
}

export function telHref(display) {
  let digits = String(display || '').replace(/\D/g, '')
  if (digits.length === 10) digits = '91' + digits
  return 'tel:+' + (digits || BUSINESS.phoneRaw)
}
