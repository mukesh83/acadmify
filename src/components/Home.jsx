import { useState, useEffect } from 'react'
import { C } from '../constants'
import { mono, serif, btn, dividerStyle } from '../utils/styles'
import { useContent } from '../hooks/useContent.js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL      || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Fallback gallery — shown when Supabase not connected
// These are placeholder images that actually work
const FALLBACK_GALLERY = [
  { id:1,  name: 'AIIMS Jodhpur',                  image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/AIIMS_Jodhpur_logo.png/200px-AIIMS_Jodhpur_logo.png' },
  { id:2,  name: 'IIT Jodhpur',                     image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/57/IIT_Jodhpur_Logo.svg/200px-IIT_Jodhpur_Logo.svg.png' },
  { id:3,  name: 'JNVU Jodhpur',                    image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/14/JNVU_Logo.png/200px-JNVU_Logo.png' },
  { id:4,  name: 'MBM University',                  image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/MBM_Engineering_College_Logo.jpg/200px-MBM_Engineering_College_Logo.jpg' },
]

function Divider() {
  return (
    <div style={dividerStyle.wrap}>
      <span style={dividerStyle.line} />
      <span style={dividerStyle.dots}>◆ ◆ ◆</span>
      <span style={dividerStyle.line} />
    </div>
  )
}

function WAIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function YTIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

export default function Home({ setPage }) {
  const { c, loading } = useContent()

  // Load gallery from Supabase
  const [gallery, setGallery]     = useState([])
  const [galleryLoading, setGL]   = useState(true)

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      setGallery(FALLBACK_GALLERY)
      setGL(false)
      return
    }
    fetch(SUPABASE_URL + '/rest/v1/gallery?select=*&active=eq.true&order=sort_order.asc', {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON }
    })
      .then(r => r.json())
      .then(rows => {
        if (Array.isArray(rows) && rows.length > 0) setGallery(rows)
        else setGallery(FALLBACK_GALLERY)
      })
      .catch(() => setGallery(FALLBACK_GALLERY))
      .finally(() => setGL(false))
  }, [])

  const waUrl = 'https://wa.me/' + c('contact_whatsapp_number') +
    '?text=' + encodeURIComponent('Hello Acadmify! I want to get my thesis printed and bound. Please share the details.')

  const pricingRows = [
    ['Black & White Printing', '₹2 per print',     '100gsm bond paper'],
    ['Colour Printing',        '₹6-₹10 per print', '100gsm bond paper, print rate depends on no. of pages & no. copies of thesis'],
    ['Hardbound Binding',      '₹250 per copy',    'Thesis cover with spine printing'],
    ['Softbound Binding',      '₹150 per copy',     'Cover printing optional'],
    ['Spiral Binding',         '₹50 per copy',  'Spiral binding with plastic cover front & back'],
    ['Delivery',     'Rapido parcel/ courier charges apply',   'Doorstep delivery anywhere in Rajasthan'],
  ]

  const videos = [
    { id: c('youtube_video1_id'), title: c('youtube_video1_title'), desc: c('youtube_video1_desc') },
    { id: c('youtube_video2_id'), title: c('youtube_video2_title'), desc: c('youtube_video2_desc') },
    { id: c('youtube_video3_id'), title: c('youtube_video3_title'), desc: c('youtube_video3_desc') },
  ]

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...mono, fontSize: '0.8rem', color: C.textMuted }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Floating WhatsApp Button ─────────────────────────────────── */}
      <a href={waUrl} target="_blank" rel="noreferrer"
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, background: '#25D366', color: '#fff', width: 58, height: 58, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.45)', textDecoration: 'none' }}
        title="Chat on WhatsApp">
        <WAIcon size={26} color="#fff" />
      </a>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '5rem 3rem 4.5rem', borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.7rem', color: C.textMuted, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            {c('hero_eyebrow')}
          </p>
          <h1 style={{ ...serif, fontSize: 'clamp(2.8rem,5vw,4.5rem)', fontWeight: 600, color: C.maroon, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            {c('hero_title')}<br />
            <em style={{ fontWeight: 400, fontStyle: 'italic' }}>{c('hero_subtitle')}</em>
          </h1>
          <Divider />
          <p style={{ ...serif, fontSize: '1.2rem', color: C.textBody, lineHeight: 1.9, maxWidth: 620, marginBottom: '2.5rem' }}>
            {c('hero_description')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button onClick={() => setPage('upload')} style={btn('primary')}>Upload Your Thesis</button>
            <a href={waUrl} target="_blank" rel="noreferrer"
              style={{ ...btn('outline'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <WAIcon size={18} /> WhatsApp Us
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid ' + C.border, borderRadius: 4, overflow: 'hidden' }}>
            {[
              [c('hero_stat1_value'), c('hero_stat1_label')],
              [c('hero_stat2_value'), c('hero_stat2_label')],
              [c('hero_stat3_value'), c('hero_stat3_label')],
              [c('hero_stat4_value'), c('hero_stat4_label')],
            ].map(([v, l], i) => (
              <div key={i} style={{ padding: '1.25rem 1rem', textAlign: 'center', borderRight: i < 3 ? '1px solid ' + C.border : 'none' }}>
                <div style={{ ...serif, fontSize: '1.9rem', fontWeight: 600, color: C.maroon }}>{v}</div>
                <div style={{ ...mono, fontSize: '0.58rem', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Us ─────────────────────────────────────────────────── */}
      <section id="about" style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>About Us</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>{c('about_heading')}</h2>
          <Divider />
          <p style={{ ...serif, fontSize: '1.15rem', color: C.textBody, lineHeight: 1.9, marginBottom: '1.25rem' }}>{c('about_para1')}</p>
          <p style={{ ...serif, fontSize: '1.15rem', color: C.textBody, lineHeight: 1.9, marginBottom: '2rem' }}>{c('about_para2')}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer"
              style={{ ...btn('primary'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <WAIcon size={18} /> {c('contact_phone')}
            </a>
            <a href={'mailto:' + c('contact_email')} style={{ ...btn('outline'), textDecoration: 'none' }}>
              {c('contact_email')}
            </a>
          </div>
        </div>
      </section>

      {/* ── Why Choose ───────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Why Researchers Choose Acadmify</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>Built for Academic Excellence</h2>
          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
            {[
              ['Archival Print Quality',       'Every thesis printed on acid-free 70gsm bond paper, 600dpi laser. Your research preserved for decades.'],
              ['24-Hour Guaranteed Delivery',  'Order before midnight. Receive your professionally bound thesis at your doorstep by morning.'],
              ['University Compliant Binding', 'Meets specifications of IIT, AIIMS, JNVU, MBM, DU, JNU and all Rajasthan universities.'],
              ['Transparent Pricing',          'No hidden charges. Get an instant itemised quotation before you commit to anything.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: '1.5rem', background: C.gray1, border: '1px solid ' + C.border, borderTop: '3px solid ' + C.maroon, borderRadius: '0 0 4px 4px' }}>
                <h3 style={{ ...serif, fontSize: '1.2rem', fontWeight: 600, color: C.maroon, marginBottom: '0.6rem' }}>{title}</h3>
                <p style={{ ...serif, fontSize: '0.97rem', color: C.textBody, lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────────────── */}
      <section id="gallery" style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Gallery</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>Universities We Have Served</h2>
          <Divider />

          {galleryLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', ...mono, fontSize: '0.75rem', color: C.textMuted }}>Loading gallery...</div>
          ) : gallery.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed ' + C.border, borderRadius: 8 }}>
              <div style={{ fontSize: 32, marginBottom: '0.75rem' }}>🖼</div>
              <p style={{ ...serif, fontSize: '1.05rem', color: C.textMuted }}>No gallery photos yet.</p>
              <p style={{ ...mono, fontSize: '0.7rem', color: C.textMuted, marginTop: '0.5rem' }}>
                Add photos from Admin Panel → Gallery tab
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
              {gallery.map((item) => (
                <div key={item.id} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid ' + C.border, background: C.white, boxShadow: '0 1px 6px rgba(122,30,30,0.06)' }}>
                  <div style={{position: 'relative', height: 240, background: '#fff', overflow: 'hidden'}}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '8px', background: '#fff' }}
                      onError={e => {
                        e.target.style.display = 'none'
                        e.target.parentNode.querySelector('.img-fallback').style.display = 'flex'
                      }}
                    />
                    <div className="img-fallback" style={{ display: 'none', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, background: C.gray2 }}>
                      <div style={{ fontSize: 32 }}>🏛</div>
                      <div style={{ ...mono, fontSize: '0.62rem', color: C.textMuted }}>Image loading...</div>
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid ' + C.border, textAlign: 'center', background: C.gray1 }}>
                    <p style={{ ...serif, fontSize: '1.1rem', color: C.maroon, fontWeight: 700, margin: 0, textAlign: 'center' }}>{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>The Process</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>From Upload to Doorstep in 5 Steps</h2>
          <Divider />
          {[
            ['Upload',    'Share your thesis PDF and optional cover page through our secure portal. All files encrypted.'],
            ['Configure', 'Select binding — hardbound, softbound, or spiral. Choose cover colour and number of copies.'],
            ['Quotation', 'Receive an instant, fully itemised quotation. Completely transparent with no hidden charges.'],
            ['Payment',   'Pay securely via Razorpay — UPI, credit/debit cards, net banking. Confirmed immediately.'],
            ['Delivered', 'Bound thesis hand-delivered within 24 hours. Tracking link sent to your WhatsApp.'],
          ].map(([title, desc], i) => (
            <div key={title} style={{ display: 'flex', gap: '1.75rem', padding: '1.5rem 0', borderBottom: i < 4 ? '1px solid ' + C.border : 'none' }}>
              <div style={{ ...mono, fontSize: '1.6rem', color: C.gray3, fontWeight: 500, minWidth: 40, paddingTop: 2 }}>{'0' + (i + 1)}</div>
              <div>
                <h3 style={{ ...serif, fontSize: '1.25rem', fontWeight: 600, color: C.maroon, marginBottom: '0.35rem' }}>{title}</h3>
                <p style={{ ...serif, fontSize: '1rem', color: C.textBody, lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pricing Schedule</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>{c('pricing_heading')}</h2>
          <Divider />
          <table style={{ width: '100%', borderCollapse: 'collapse', ...serif, fontSize: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid ' + C.maroon }}>
                {['Service','Rate','Specification'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 1 ? 'center' : 'left', padding: '10px 0', color: C.maroon, fontWeight: 600, paddingLeft: i === 2 ? '1.5rem' : 0 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricingRows.map(([s, r, n], i) => (
                <tr key={s} style={{ borderBottom: '1px solid ' + C.border, background: i % 2 === 0 ? C.white : 'transparent' }}>
                  <td style={{ padding: '12px 0', color: C.maroon, fontWeight: 500 }}>{s}</td>
                  <td style={{ padding: '12px 0', textAlign: 'center', color: C.maroon, fontWeight: 600 }}>{r}</td>
                  <td style={{ padding: '12px 0 12px 1.5rem', color: C.textMuted, fontSize: '0.94rem' }}>{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button onClick={() => setPage('upload')} style={btn('primary')}>Calculate Your Quotation</button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2 style={{ ...serif, fontSize: '2.2rem', fontWeight: 600, color: C.maroon, textAlign: 'center', marginBottom: '2.25rem' }}>Trusted by Scholars Across India</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem' }}>
            {[
              ['Acadmify delivered my PhD thesis at 7 AM exactly when I needed it. Impeccable binding quality.', 'Dr. R. Mehta', 'University of Rajasthan'],
              ['The binding met all IIT Jodhpur specifications without any revision. Genuinely professional service.', 'Aakash Sharma', 'IIT Jodhpur'],
              ['Ordered at 11 PM, received by 8 AM. The gold embossing on the cover looked exceptionally professional.', 'Dr. Sunita Patel', 'MBM University, Jodhpur'],
            ].map(([quote, name, inst]) => (
              <div key={name} style={{ padding: '1.75rem', border: '1px solid ' + C.border, borderRadius: 4, background: C.gray1 }}>
                <p style={{ ...serif, fontSize: '1rem', color: C.textBody, lineHeight: 1.85, fontStyle: 'italic', marginBottom: '1.25rem' }}>"{quote}"</p>
                <div style={{ borderTop: '1px solid ' + C.border, paddingTop: '0.75rem' }}>
                  <div style={{ ...serif, fontSize: '0.97rem', color: C.maroon, fontWeight: 600 }}>{name}</div>
                  <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted, letterSpacing: '0.06em', marginTop: 3 }}>{inst}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── YouTube ──────────────────────────────────────────────────── */}
      <section id="resources" style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Helpful Resources</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>Thesis Formatting Guides</h2>
          <Divider />
          <p style={{ ...serif, fontSize: '1.1rem', color: C.textBody, lineHeight: 1.85, marginBottom: '2rem' }}>
            Watch our YouTube tutorials on thesis formatting, margin settings, binding selection, and university-specific requirements.
          </p>
          <a href={c('youtube_channel_url')} target="_blank" rel="noreferrer"
            style={{ ...btn('primary'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <YTIcon size={20} /> Visit Our YouTube Channel
          </a>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem' }}>
            {videos.map(({ id, title, desc }) => (
              <div key={title} style={{ border: '1px solid ' + C.border, borderRadius: 6, overflow: 'hidden', background: C.white }}>
                {id ? (
                  <iframe width="100%" height="160"
                    src={'https://www.youtube.com/embed/' + id}
                    title={title} frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen style={{ display: 'block' }} />
                ) : (
                  <div style={{ background: C.gray2, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <YTIcon size={36} />
                    <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted }}>Add video ID in Admin panel</div>
                  </div>
                )}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ ...serif, fontSize: '1rem', fontWeight: 600, color: C.maroon, marginBottom: '0.35rem' }}>{title}</h3>
                  <p style={{ ...serif, fontSize: '0.88rem', color: C.textMuted, lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section id="contact" style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Find Us</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>Contact and Location</h2>
          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            <div>
              {[
                ['Address',       c('contact_address')],
                ['WhatsApp/Call', c('contact_phone')],
                ['Email',         c('contact_email')],
                ['Hours',         c('contact_hours')],
              ].map(([label, value]) => (
                <div key={label} style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid ' + C.border }}>
                  <div style={{ ...mono, fontSize: '0.62rem', color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                  <div style={{ ...serif, fontSize: '1.05rem', color: C.maroon, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{value}</div>
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href={waUrl} target="_blank" rel="noreferrer"
                  style={{ ...btn('primary'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <WAIcon size={18} /> Chat on WhatsApp
                </a>
                <a href={'mailto:' + c('contact_email')} style={{ ...btn('outline'), textDecoration: 'none', textAlign: 'center' }}>
                  Send Email
                </a>
              </div>
            </div>
            <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid ' + C.border }}>
              <iframe
                title="Acadmify Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.8565883338!2d73.01261307543055!3d26.278828876958888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394c2bb0ae5ba885%3A0x78b4c75b9f64c0e!2sChopasni%20Housing%20Board%2C%20Jodhpur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1713900000000!5m2!1sen!2sin"
                width="100%" height="360"
                style={{ border: 0, display: 'block' }}
                allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div style={{ padding: '0.75rem 1rem', background: C.gray1, borderTop: '1px solid ' + C.border }}>
                <a href="https://maps.google.com/?q=Chopasni+Housing+Board+Jodhpur+Rajasthan"
                  target="_blank" rel="noreferrer"
                  style={{ ...mono, fontSize: '0.68rem', color: C.maroon, textDecoration: 'none' }}>
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ background: C.maroon, padding: '3rem 3rem 2rem' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <div>
              <div style={{ ...serif, fontSize: '1.5rem', color: '#fff', fontWeight: 600, marginBottom: 4 }}>acadmify</div>
              <div style={{ ...mono, fontSize: '0.52rem', color: '#C69A4A', letterSpacing: '0.22em', marginBottom: '1rem' }}>{c('footer_tagline')}</div>
              <p style={{ ...serif, fontSize: '0.92rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '0.5rem', whiteSpace: 'pre-line' }}>{c('contact_address')}</p>
              <a href={waUrl} target="_blank" rel="noreferrer"
                style={{ ...serif, fontSize: '0.92rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>
                {c('contact_phone')}
              </a>
            </div>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              {[
                ['Services', ['Thesis Printing','Hardbound Binding','Softbound Binding','Spiral Binding','Lamination']],
                ['Links',    ['Upload Thesis','Track Order','About Us','Contact Us','YouTube']],
              ].map(([heading, items]) => (
                <div key={heading}>
                  <div style={{ ...mono, fontSize: '0.6rem', color: '#C69A4A', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>{heading}</div>
                  {items.map(item => (
                    <div key={item} style={{ ...serif, fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', marginBottom: 5 }}>{item}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...mono, fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
            {c('footer_copyright')}
          </div>
        </div>
      </footer>

    </div>
  )
}
