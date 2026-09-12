import { useWaLink } from '../lib/whatsapp.js'
import { trackEvent } from '../lib/analytics.js'
import { IconWhatsApp } from './Icons.jsx'

export default function WhatsAppFloat() {
  const wa = useWaLink()
  return (
    <a
      className="wa-float"
      href={wa('Hello Acadmify! I want to get my thesis printed and bound.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Acadmify on WhatsApp"
      onClick={() => trackEvent('whatsapp_click', { place: 'floating_button' })}
    >
      <IconWhatsApp size={28} />
    </a>
  )
}
