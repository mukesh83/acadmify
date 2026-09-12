import { useEffect, useMemo, useState } from 'react'
import { Link } from '../lib/router.jsx'
import { useContent } from '../lib/content.jsx'
import { usePricing } from '../lib/usePricing.js'
import { usePageMeta, setJsonLd } from '../lib/seo.js'
import { buildFaq, faqJsonLd } from '../lib/faq.js'
import { useWaLink, telHref } from '../lib/whatsapp.js'
import { wakeServer } from '../lib/api.js'
import { readJson, writeJson, youtubeId } from '../lib/util.js'
import { rupees } from '../lib/format.js'
import { trackEvent } from '../lib/analytics.js'
import HeroBook from '../components/HeroBook.jsx'
import QuoteCalculator from '../components/QuoteCalculator.jsx'
import Gallery from '../components/Gallery.jsx'
import Reviews from '../components/Reviews.jsx'
import FAQ from '../components/FAQ.jsx'
import LiteYouTube from '../components/LiteYouTube.jsx'
import { IconWhatsApp, IconArrowRight, IconPin, IconClock, IconPhone, IconYouTube } from '../components/Icons.jsx'

export default function Home() {
  const c = useContent()
  const p = usePricing()
  const wa = useWaLink()

  usePageMeta({
    title: 'Acadmify — Thesis Printing & Hardbound Binding in Jodhpur',
    description:
      'Thesis printing and hardbound binding in Jodhpur. B&W ' + rupees(p.bw_per_page) + ' per page, hardbound ' +
      rupees(p.hard_binding) + ' per copy, 12 cover colours. Upload your PDF, see the exact price, pickup or doorstep delivery.',
    path: '/',
  })

  const [cover, setCover] = useState(() => readJson('sessionStorage', 'acadmify.cover') || 'maroon')
  const chooseCover = (id) => {
    setCover(id)
    writeJson('sessionStorage', 'acadmify.cover', id)
  }
  const [lettering, setLettering] = useState(() => readJson('sessionStorage', 'acadmify.lettering') || 'gold')
  const chooseLettering = (id) => {
    setLettering(id)
    writeJson('sessionStorage', 'acadmify.lettering', id)
  }

  const faq = useMemo(() => buildFaq(p, c), [p, c])
  useEffect(() => {
    setJsonLd('faq-ld', faqJsonLd(faq))
    return () => setJsonLd('faq-ld', null)
  }, [faq])

  // Render's free server sleeps; wake it now so ordering is quick later
  useEffect(() => {
    const t = setTimeout(wakeServer, 3000)
    return () => clearTimeout(t)
  }, [])

  const stats = [1, 2, 3, 4].map((n) => [c('hero_stat' + n + '_value'), c('hero_stat' + n + '_label')]).filter(([v, l]) => v && l)
  const why = [1, 2, 3, 4].map((n) => [c('why' + n + '_title'), c('why' + n + '_text')]).filter(([t]) => t)
  const about = [c('about_para1'), c('about_para2'), c('about_para3')].filter(Boolean)
  const videos = [1, 2, 3]
    .map((n) => ({ id: youtubeId(c('youtube_video' + n + '_id')), title: c('youtube_video' + n + '_title'), desc: c('youtube_video' + n + '_desc') }))
    .filter((v) => v.id)

  const deliveryRate = p.delivery_charge > 0
    ? rupees(p.delivery_charge) + (p.free_delivery_above > 0 ? ', free above ' + rupees(p.free_delivery_above) : '')
    : 'Pickup free'

  const priceRows = [
    ['Black & white printing', rupees(p.bw_per_page) + ' / page', c('paper_spec')],
    ['Colour printing', rupees(p.color_per_page) + ' / page',
      rupees(p.colour_bulk_rate) + ' / page when you print more than ' + p.colour_bulk_above + ' colour pages in total (colour pages × copies)'],
    ['OHP transparent sheet', rupees(p.ohp_per_sheet) + ' / sheet', 'Placed before the title page, certificates, declaration or chapter headings'],
    ['Hardbound thesis binding', rupees(p.hard_binding) + ' / copy', c('hardbound_desc')],
    p.formatting_fee > 0 ? ['Thesis formatting', rupees(p.formatting_fee) + ' / thesis', c('formatting_desc')] : null,
    p.softbound_enabled ? ['Book binding (softbound)', rupees(p.soft_binding) + ' / copy', c('softbound_desc')] : null,
    ['Delivery', deliveryRate, c('delivery_note')],
  ].filter(Boolean)

  const steps = [
    ['Upload your PDF', 'Share your thesis PDF (or a Google Drive link), then choose copies, colour pages and cover colour.'],
    ['See your price', 'The exact total, GST included, is shown as you type.'],
    ['Confirm on WhatsApp', 'We check your file and send payment details on WhatsApp (UPI or cash).'],
    ['Print & bind', 'Printed on ' + c('paper_spec').split('/')[0].trim() + ' and hardbound with gold or silver lettering. Usually ready in 24–48 hours.'],
    ['Pickup or delivery', 'Collect from our shop for free, or we send a Rapido rider anywhere in Jodhpur (fare paid on delivery).'],
  ]

  const waHello = wa('Hello Acadmify! I want to get my thesis printed and bound. Please share the details.')

  return (
    <>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            {c('hero_eyebrow') && <p className="eyebrow">{c('hero_eyebrow')}</p>}
            <h1 id="hero-title">
              {c('hero_title')} {c('hero_subtitle') && <em>{c('hero_subtitle')}</em>}
            </h1>
            <p className="lede">{c('hero_description')}</p>
            <div className="btn-row">
              <Link to="/upload" className="btn btn-primary btn-lg">
                Upload your thesis <IconArrowRight size={18} />
              </Link>
              <a className="btn btn-outline btn-lg" href={waHello} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { place: 'hero' })}>
                <IconWhatsApp size={18} /> WhatsApp us
              </a>
            </div>
            {stats.length > 0 && (
              <dl className="stats">
                {stats.map(([value, label]) => (
                  <div key={label} className="stat">
                    <dt>{label}</dt>
                    <dd className="num">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <HeroBook cover={cover} onChange={chooseCover} lettering={lettering} onLettering={chooseLettering} />
        </div>
      </section>

      {/* Services */}
      <section className="services-band" aria-label="Services">
        <ul className="container services-list">
          <li><strong>Thesis printing &amp; hardbound binding</strong> B&amp;W and colour, 12 cover colours, gold or silver lettering</li>
          {p.formatting_fee > 0 && <li><strong>Thesis formatting</strong> Your document formatted before printing, {rupees(p.formatting_fee)}</li>}
          {p.softbound_enabled && <li><strong>Book binding</strong> Softbound binding for general books</li>}
          <li><strong>Pickup or delivery</strong> Free pickup, or Rapido delivery anywhere in Jodhpur</li>
        </ul>
      </section>

      {/* Why */}
      <section className="section" aria-labelledby="why-title">
        <div className="container">
          <div className="section-head">
            <h2 id="why-title">{c('why_heading')}</h2>
          </div>
          <ul className="cards">
            {why.map(([title, text]) => (
              <li key={title} className="card">
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="section-alt-wrap">
        <QuoteCalculator />
      </div>

      {/* Process */}
      <section id="how-it-works" className="section" aria-labelledby="process-title">
        <div className="container">
          <div className="section-head">
            <h2 id="process-title">From PDF to bound thesis in five steps</h2>
          </div>
          <ol className="process">
            {steps.map(([title, text]) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="section-cta">
            <Link to="/upload" className="btn btn-primary">Start your order</Link>
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section section-alt" aria-labelledby="pricing-title">
        <div className="container">
          <div className="section-head">
            <h2 id="pricing-title">{c('pricing_heading')}</h2>
            <p>{c('pricing_note')}</p>
          </div>
          <div className="table-wrap">
            <table className="price-table">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Price</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {priceRows.map(([service, price, detail]) => (
                  <tr key={service}>
                    <th scope="row">{service}</th>
                    <td className="num price">{price}</td>
                    <td>{detail}</td>
                  </tr>
                ))}
                {p.gst_rate > 0 && (
                  <tr>
                    <th scope="row">GST</th>
                    <td className="num price">{p.gst_rate}%</td>
                    <td>Added to the total and shown on your quote</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Gallery />
      <Reviews />

      {/* About + visit */}
      <section id="about" className="section section-alt" aria-labelledby="about-title">
        <div className="container about-grid">
          <div>
            <h2 id="about-title">{c('about_heading')}</h2>
            {about.map((text) => <p key={text}>{text}</p>)}
          </div>
          <aside className="visit-card" aria-label="Visit us">
            <h3>Visit or message us</h3>
            <ul className="icon-list">
              <li><IconPin /> <span>{c('contact_address')}</span></li>
              <li><IconClock /> <span>{c('contact_hours')}</span></li>
              <li><IconPhone /> <a href={telHref(c('contact_phone'))}>{c('contact_phone')}</a></li>
            </ul>
            <div className="btn-row">
              <a className="btn btn-wa" href={waHello} target="_blank" rel="noopener noreferrer"><IconWhatsApp size={18} /> WhatsApp</a>
              <Link to="/contact" className="btn btn-outline">Map &amp; directions</Link>
            </div>
          </aside>
        </div>
      </section>

      {videos.length > 0 && (
        <section id="videos" className="section" aria-labelledby="videos-title">
          <div className="container">
            <div className="section-head">
              <h2 id="videos-title">Helpful videos</h2>
              <p>Short guides on getting your thesis ready for printing.</p>
            </div>
            <ul className="video-grid">
              {videos.map((v) => (
                <li key={v.id}>
                  <LiteYouTube id={v.id} title={v.title} />
                  {v.title && <h3>{v.title}</h3>}
                  {v.desc && <p>{v.desc}</p>}
                </li>
              ))}
            </ul>
            {/^https:\/\//.test(c('youtube_channel_url')) && (
              <p className="section-cta">
                <a className="btn btn-outline" href={c('youtube_channel_url')} target="_blank" rel="noopener noreferrer">
                  <IconYouTube size={18} /> More on our YouTube channel
                </a>
              </p>
            )}
          </div>
        </section>
      )}

      <FAQ items={faq} />
    </>
  )
}
