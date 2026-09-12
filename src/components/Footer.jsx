import { Link } from '../lib/router.jsx'
import { useContent } from '../lib/content.jsx'
import { usePricing } from '../lib/usePricing.js'
import { useWaLink, telHref } from '../lib/whatsapp.js'
import { IconInstagram, IconFacebook, IconYouTube, IconX, IconLinkedIn, IconTelegram } from './Icons.jsx'

const SOCIALS = [
  ['social_instagram', 'Instagram', IconInstagram],
  ['social_facebook', 'Facebook', IconFacebook],
  ['youtube_channel_url', 'YouTube', IconYouTube],
  ['social_x', 'X (Twitter)', IconX],
  ['social_linkedin', 'LinkedIn', IconLinkedIn],
  ['social_telegram', 'Telegram', IconTelegram],
]

export default function Footer() {
  const c = useContent()
  const p = usePricing()
  const wa = useWaLink()

  const socials = SOCIALS.filter(([key]) => /^https:\/\//.test(c(key)))
  const services = [
    'Thesis printing (B&W and colour)',
    'Hardbound binding, gold or silver lettering',
    p.formatting_fee > 0 ? 'Thesis formatting' : null,
    'OHP transparent sheets',
    p.softbound_enabled ? 'Book binding (softbound)' : null,
    'Pickup or delivery in Jodhpur',
  ].filter(Boolean)

  const copyright = c('footer_copyright')
  const gstin = c('gstin')

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <p className="footer-logo">acadmify</p>
          <p className="footer-motto">Print <span aria-hidden="true">•</span> Bind <span aria-hidden="true">•</span> Submit</p>
          <p>{c('footer_tagline')}</p>
          {socials.length > 0 && (
            <ul className="socials" aria-label="Acadmify on social media">
              {socials.map(([key, label, Icon]) => (
                <li key={key}>
                  <a href={c(key)} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="footer-h">Services</h2>
          <ul className="footer-list">
            {services.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>

        <div>
          <h2 className="footer-h">Links</h2>
          <ul className="footer-list">
            <li><Link to="/upload">Upload thesis</Link></li>
            <li><Link to="/#quote">Price calculator</Link></li>
            <li><Link to="/track">Track order</Link></li>
            <li><Link to="/#faq">FAQ</Link></li>
            <li><Link to="/contact">Contact &amp; location</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="footer-h">Policies</h2>
          <ul className="footer-list">
            <li><Link to="/privacy">Privacy policy</Link></li>
            <li><Link to="/terms">Terms &amp; conditions</Link></li>
            <li><Link to="/refund">Refunds &amp; cancellation</Link></li>
            <li><Link to="/shipping">Shipping &amp; delivery</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="footer-h">Contact</h2>
          <address className="footer-list">
            <p>{c('contact_address')}</p>
            <p><a href={telHref(c('contact_phone'))}>{c('contact_phone')}</a></p>
            <p><a href={wa('Hello Acadmify!')} target="_blank" rel="noopener noreferrer">WhatsApp us</a></p>
            <p><a href={'mailto:' + c('contact_email')}>{c('contact_email')}</a></p>
            <p>{c('contact_hours')}</p>
          </address>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{copyright.startsWith('©') ? copyright : '© ' + new Date().getFullYear() + ' ' + copyright}</span>
        <span>A brand of Hari Om Graphics, Jodhpur{gstin ? ' · GSTIN ' + gstin : ''}</span>
      </div>
    </footer>
  )
}
