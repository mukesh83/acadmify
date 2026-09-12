import { useContent } from '../lib/content.jsx'
import { usePageMeta } from '../lib/seo.js'
import { useWaLink, telHref } from '../lib/whatsapp.js'
import { IconPin, IconClock, IconPhone, IconMail, IconWhatsApp, IconExternal } from '../components/Icons.jsx'

export default function Contact() {
  const c = useContent()
  const wa = useWaLink()

  usePageMeta({
    title: 'Contact & location — Acadmify, Chopasni Housing Board, Jodhpur',
    description: 'Visit Acadmify at Sector 19 Circle, Chopasni Housing Board, Jodhpur. Open every day, 5 PM to 11 PM. Call or WhatsApp +91 94600-46565.',
    path: '/contact',
  })

  const mapSrc = 'https://maps.google.com/maps?q=' + encodeURIComponent(c('map_query')) + '&z=16&output=embed'

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <h1>Contact &amp; location</h1>
          <p>Message us any time on WhatsApp. The shop is open {c('contact_hours').replace(/^Every day/i, 'every day')}.</p>
        </header>

        <div className="contact-grid">
          <div className="form-card">
            <ul className="icon-list big">
              <li>
                <IconPin />
                <span><strong>Address</strong><br />{c('contact_address')}</span>
              </li>
              <li>
                <IconClock />
                <span><strong>Opening hours</strong><br />{c('contact_hours')}</span>
              </li>
              <li>
                <IconPhone />
                <span><strong>Call</strong><br /><a href={telHref(c('contact_phone'))}>{c('contact_phone')}</a></span>
              </li>
              <li>
                <IconMail />
                <span><strong>Email</strong><br /><a href={'mailto:' + c('contact_email')}>{c('contact_email')}</a></span>
              </li>
            </ul>
            <div className="btn-row">
              <a className="btn btn-wa" href={wa('Hello Acadmify!')} target="_blank" rel="noopener noreferrer">
                <IconWhatsApp size={18} /> WhatsApp us
              </a>
              <a className="btn btn-outline" href={c('maps_link')} target="_blank" rel="noopener noreferrer">
                Get directions <IconExternal size={16} />
              </a>
            </div>
            <p className="hint">{c('delivery_note')}</p>
          </div>

          <div className="map-frame">
            <iframe
              title="Map showing Acadmify, Sector 19 Circle, Chopasni Housing Board, Jodhpur"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
