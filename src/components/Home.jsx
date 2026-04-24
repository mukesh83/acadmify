import { C } from '../constants'
import { mono, serif, btn, DividerDots } from '../utils/styles'
import { useContent } from '../hooks/useContent.js'

const UNIVERSITIES = [
  { name: 'AIIMS Jodhpur',                img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUCmq2iE7eiXcYlvZwVZUnpFp6bfzBJdoPQLcIlAePtg6dIqTHZwVA10n-2m9jXMAakdNCd7gP6CnzQf3xGC2kHOqC8KIi7NQSGiqCqjeeuvUsaRI5PH_6SKSnwZ5TgEjJdR1pXdcHw6PMeLjLV6QalyqzCsSoTTSLYuD-TntPd5L2sFkxu3Zqp9oe0I4anTNCJ3XQmlQGe1an2LYwpXfHD9pd4rdFmLrhPJDsY=w640' },
  { name: 'IIT Jodhpur',                   img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUC8-wJmyfDEIhZJ0eHvdyqQAW4yDfEP1ok_zCvEV78f6VKbh4GzDxy4KrabLi9dhoSy8RYuWlCk_0kXRJiPqXUMbAd2pGdcM0iE04LB2YA4S8oTP2bKu4Y1cErKPobZh6M_sFtUVMhzhmVzJwdgdlzXtYmI-8VsRhiDtOUddwzP_c83FKfUYkOI0zki-57JI5WxxsIhEC15mD3z8SkZMjIE55DObGtWPmLy=w640' },
  { name: 'Faculty of Law, JNVU',          img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUBimG1fqehk6TuHxJIU1LvgxPl3k1z7BaXTDw39yPlny7JvmoNnpiU-mON0FkuD3hu4vGAc46uLtIleBgxyNRhjaGsc9E568wrqwXGJTjq7Ut8FvosXS-nJvqEkzV8QcVoAd34D7TcfbN_9VfxKThsECnq0XbwEKmHQsM46fRHPYNT_4M3-M5ryxPfphpx8Ik2NhbOGeXFjewDwxM0GonqlMPMydAxsCXDQ=w640' },
  { name: 'SN Medical College',            img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUAOsUxv0dywGFd5SFCOl7K08EaQax20nBSWNUBqn_Z6l9Tx-jPvaA08Y8BHCtJFB7b5ScjwcQUwQbfemfMVc9FEiO_1DgtLNDQ5iQVcxMvRjRZRv0b--aHKZHw81kxxM2Fe6k0LCfXwIEiyBZGC2ZHuSgLyiVpUXXqK-mX64Tb8hy3_P9AYSJn3N0fvQdZMcPoASLRu2eLuqlTLxVhQ2rWRZBBe_uq-xXWPlqo=w640' },
  { name: 'Maulana Azad University',       img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUDmx9azNFXVoUG0-TK1iS3KHkuHD3bGl_xTtjuE1RHAj84ZnAic6VY0dB_KmMF4NJCQnS7jwGU1MrZ6TD3AeWhMDEVdc_8PcNDmNKjjEtjEtXrJqxAXRmJoAy_6NqiLv6E7aV8kvIjdBQA1O4YzEHLpkHV7v6kO2fRhpF_rL3g7R3hblLSdK2Lz74q7WV5x3nqe_0=w640' },
  { name: 'Lachoo Memorial College',       img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUBRX_g7IdS6P13KfOW13_uouc8BbM7hEZo8deCndvcmypaZfmsSIvd4z5mRx0MKgcR9oWlnpYHta0vcqJu6y1bn_GR871JLQMZMlpsQJOIVEZxc27DqVlyOqvSE9WfpNcFJOWll5Rsaez8lDLxxMDbKvFOnT9nT54_zXVCJTTRFuiZV9pASemNz9auzxWxdkZDiqacoI4JpOCiuDFB0tdMPGKE69a_anRTU=w640' },
  { name: 'School of Public Health, AIIMS',img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUDbKx9p-vd7VfmiIhjTqOcQeg1pW1gszsvEEGYgOXt4RBBaFVE2tcS7NqMNCbL7KlaFB884VQmsREClHlwhx5SrQ9HxjT3Wbo_ynOc3coESIDj5fcTieoKocuBj51ItMhGLjoDRAeYi5g-VeBuRU5AbZ0liPP7gdlM9wSxTbksppWvV2SCJKZKUddxxMjso5cH2T2Nn6YmT_ImjTpSKabrNeHHyd22pSfXm=w640' },
  { name: 'Faculty of Commerce, JNVU',     img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUB-X34MkIUXKkx_6f_UWEWp-mZIGGkSUjn39CGKXzb81UJZV9_bqFkA4NfxBICHei-2CmxizmSNqjMuRsukUrATmqxqL1IyN1jdzndxQo6KsCIA_Y1xYxB564b_yK8hamjOy1Rcg4ForRf3i9K_AMaQJ6Zmby52KCDvj7mQK0PJ9i4ZL-s6UhJVZqFBCNqn1KgOsGuZlzXrT-FtnFKE2XVwOi9ub5VM57VYur4=w640' },
  { name: 'JNVU Physics Dept.',            img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUDBDzQdeZHe0Nizbocxafl_VydJIjAco-03EAzxoje8WcfasgHaYPOpyitUeIpbhNeKtxhXM9pmRvC-0v65VG2c33PmrBldWHE8r8jXiQlDPVPG8m5_WojFA-9xLot0z_5KVmp-rxaCsPe7Dka0d5DcCorhbyquy6pRTwgQD5WFhRBGDb9YEh-IwXy8LFT2TtdeTPfYx3RMHKiUfU_8sHX4dKPzuS0kprveyIw=w640' },
  { name: 'Mayurakshi College of Nursing', img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUByLiNYo6e7GvYkApMFEQBU_39rzfNVW0u-iYKaZPKbzjZzr7paP_n2TtzVoIWS-Zax8WsTZMVHC6E7GUaicl7Qiu0qTFJwVupzVyzTgirAKMZhfPE_GLFOqdCxXbSFmVn7NMVLxiX2mGMLmal4-buRrH568-82-fqUL66pmtoZ6fjmArS0wDOF8etx7UnXJdfanisQUgunBlwTUvmmA2n-qYwZyWX-SXxy6Cw=w640' },
  { name: 'FDDI Jodhpur',                  img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUBVi4bvmd8d-OAw0BHsN6ElBqJSxO92E-yHusTekFNDoXUjCrhVVQcoW89KrY3aSiDaXKXJef103eLs8Wph5wutSrlfxFJtEg1FBg1GHO90G3ktXFg6IjCHSyg9voWS1zX1AN_jc_58vF0FPP0IVBfhXjJ9wrVfEGMEIZzleR89kbcMoDS8je2lH8mZuawwsNcRPqml_hD9B6utlkOQEO9qSRlVlf5Gbec7=w640' },
  { name: 'IGNOU',                         img: 'https://lh3.googleusercontent.com/sitesv/AA5AbUCqUqMUi50IpPvP8fjHM1Dy9TuYwlWsGO14jJCEle_mrggtyJvXiqc_THR7j_M1LfiZt_iCWSeI7NTTQ4Wg6HA0f7Qy85JLNpCKBHn8szOizAPDMpWTSX_tAesLqE4Ua9I84JWK3NUf8mUCfkVhplJeB3ZBC9ohElIFSqCI0p2b5U0PO7AWb8tWeiZzFDhg5riEvmGHKc=w640' },
]

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

  const WA_URL = `https://wa.me/${c('contact_whatsapp_number')}?text=` +
    encodeURIComponent('Hello Acadmify! I want to get my thesis printed and bound. Please share the details.')

 const pricingRows = [
    ['Black & White Printing', '₹' + c('pricing_bw') + ' / page',     '70gsm acid-free bond, 600dpi laser, both sides'],
    ['Colour Printing',        '₹' + c('pricing_color') + ' / page',   '90gsm glossy coated, vivid full-colour reproduction'],
    ['Hardbound Binding',      '₹' + c('pricing_hard') + ' / copy',    'Buckram cloth cover, gold foil title and spine stamping'],
    ['Softbound Binding',      '₹' + c('pricing_soft') + ' / copy',    'Laminated cover, perfect-bound spine'],
    ['Spiral Binding',         '₹' + c('pricing_spiral') + ' / copy',  'Wire-o spiral, lay-flat opening'],
    ['Delivery (Jodhpur)',     '₹' + c('pricing_delivery') + ' flat',   'Free on orders above ₹' + c('pricing_free_above')],
  ]

  const videos = [
    { id: c('youtube_video1_id'), title: c('youtube_video1_title'), desc: c('youtube_video1_desc') },
    { id: c('youtube_video2_id'), title: c('youtube_video2_title'), desc: c('youtube_video2_desc') },
    { id: c('youtube_video3_id'), title: c('youtube_video3_title'), desc: c('youtube_video3_desc') },
  ]

  // Show loading skeleton only if content is still fetching
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...mono, fontSize: '0.8rem', color: C.textMuted }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Floating WhatsApp Button ───────────────────────────────────── */}
      <a href={WA_URL} target="_blank" rel="noreferrer"
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, background: '#25D366', color: '#fff', width: 58, height: 58, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,211,102,0.4)', textDecoration: 'none' }}
        title="WhatsApp Acadmify"
      >
        <WAIcon size={26} color="#fff" />
      </a>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '5rem 3rem 4.5rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.7rem', color: C.textMuted, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            {c('hero_eyebrow')}
          </p>
          <h1 style={{ ...serif, fontSize: 'clamp(2.8rem,5vw,4.5rem)', fontWeight: 600, color: C.maroon, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            {c('hero_title')}<br />
            <em style={{ fontWeight: 400, fontStyle: 'italic' }}>{c('hero_subtitle')}</em>
          </h1>
          <DividerDots />
          <p style={{ ...serif, fontSize: '1.2rem', color: C.textBody, lineHeight: 1.9, maxWidth: 620, marginBottom: '2.5rem' }}>
            {c('hero_description')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button onClick={() => setPage('upload')} style={btn('primary')}>Upload Your Thesis →</button>
            <a href={WA_URL} target="_blank" rel="noreferrer"
              style={{ ...btn('outline'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <WAIcon size={18} /> WhatsApp Us
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden' }}>
            {[
              [c('hero_stat1_value'), c('hero_stat1_label')],
              [c('hero_stat2_value'), c('hero_stat2_label')],
              [c('hero_stat3_value'), c('hero_stat3_label')],
              [c('hero_stat4_value'), c('hero_stat4_label')],
            ].map(([v, l], i) => (
              <div key={i} style={{ padding: '1.25rem 1.5rem', textAlign: 'center', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ ...serif, fontSize: '2rem', fontWeight: 600, color: C.maroon }}>{v}</div>
                <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Us ──────────────────────────────────────────────────── */}
      <section id="about" style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>About Us</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>{c('about_heading')}</h2>
          <DividerDots />
          <p style={{ ...serif, fontSize: '1.15rem', color: C.textBody, lineHeight: 1.9, marginBottom: '1.25rem' }}>{c('about_para1')}</p>
          <p style={{ ...serif, fontSize: '1.15rem', color: C.textBody, lineHeight: 1.9, marginBottom: '2rem' }}>{c('about_para2')}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href={WA_URL} target="_blank" rel="noreferrer"
              style={{ ...btn('primary'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <WAIcon size={18} /> {c('contact_phone')}
            </a>
            <a href={`mailto:${c('contact_email')}`}
              style={{ ...btn('outline'), textDecoration: 'none' }}>
              {c('contact_email')}
            </a>
          </div>
        </div>
      </section>

      {/* ── Why Choose Acadmify ───────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Why Researchers Choose Acadmify</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>Built for Academic Excellence</h2>
          <DividerDots />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(235px,1fr))', gap: '1.5rem' }}>
            {[
              ['Archival Print Quality',         'Every thesis is printed on acid-free, 70gsm bond paper using high-resolution 600dpi laser printing. Your research is preserved as it deserves — for decades.'],
              ['24-Hour Guaranteed Delivery',     'We understand submission deadlines. Place your order before midnight — receive your professionally bound thesis at your doorstep by morning.'],
              ['University Compliant Binding',    'Our specifications meet DU, JNU, IIT, AIIMS, and all Rajasthan university requirements including JNVU, MBM, and RTU. Accepted first time, every time.'],
              ['Transparent Pricing',             'No hidden charges. Get an instant itemised quotation before you commit to anything.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: '1.5rem', background: C.gray1, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.maroon}`, borderRadius: '0 0 4px 4px' }}>
                <h3 style={{ ...serif, fontSize: '1.2rem', fontWeight: 600, color: C.maroon, marginBottom: '0.6rem' }}>{title}</h3>
                <p style={{ ...serif, fontSize: '0.97rem', color: C.textBody, lineHeight: 1.8 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ───────────────────────────────────────────────────── */}
      <section id="gallery" style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Gallery</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>Universities We Have Served</h2>
          <DividerDots />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem' }}>
            {UNIVERSITIES.map(({ name, img }) => (
              <div key={name} style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.border}`, background: C.white }}>
                <img src={img} alt={name} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none' }} />
                <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${C.border}` }}>
                  <p style={{ ...serif, fontSize: '0.97rem', color: C.maroon, fontWeight: 600, margin: 0 }}>{name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>The Process</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>From Upload to Doorstep in 5 Steps</h2>
          <DividerDots />
          {[
            ['Upload',     'Share your thesis PDF and optional cover page through our secure portal. All files are encrypted and accessible only to our printing team.'],
            ['Configure',  'Select binding type — hardbound, softbound, or spiral. Choose your cover colour. Specify number of copies required.'],
            ['Quotation',  'Receive an instant, fully itemised quotation. Pricing is completely transparent with no hidden charges.'],
            ['Payment',    'Pay securely via Razorpay — UPI, credit/debit cards, and net banking accepted. Order confirmed immediately upon payment.'],
            ['Delivered',  'Your bound thesis is hand-delivered within 24 hours. A tracking link is sent to your registered WhatsApp number.'],
          ].map(([title, desc], i) => (
            <div key={title} style={{ display: 'flex', gap: '1.75rem', padding: '1.5rem 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ ...mono, fontSize: '1.6rem', color: C.gray3, fontWeight: 500, minWidth: 40, paddingTop: 3 }}>0{i + 1}</div>
              <div>
                <h3 style={{ ...serif, fontSize: '1.25rem', fontWeight: 600, color: C.maroon, marginBottom: '0.35rem' }}>{title}</h3>
                <p style={{ ...serif, fontSize: '1rem', color: C.textBody, lineHeight: 1.8 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pricing Schedule</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>{c('pricing_heading')}</h2>
          <DividerDots />
          <table style={{ width: '100%', borderCollapse: 'collapse', ...serif, fontSize: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.maroon}` }}>
                {['Service', 'Rate', 'Specification'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 1 ? 'center' : 'left', padding: '10px 0', color: C.maroon, fontWeight: 600, paddingLeft: i === 2 ? '1.5rem' : 0 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricingRows.map(([s, r, n], i) => (
                <tr key={s} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : 'transparent' }}>
                  <td style={{ padding: '12px 0', color: C.maroon, fontWeight: 500 }}>{s}</td>
                  <td style={{ padding: '12px 0', textAlign: 'center', color: C.maroon, fontWeight: 600 }}>{r}</td>
                  <td style={{ padding: '12px 0 12px 1.5rem', color: C.textMuted, fontSize: '0.94rem' }}>{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button onClick={() => setPage('upload')} style={btn('primary')}>Calculate Your Quotation →</button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2 style={{ ...serif, fontSize: '2.2rem', fontWeight: 600, color: C.maroon, textAlign: 'center', marginBottom: '2.25rem' }}>
            Trusted by Scholars Across India
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem' }}>
            {[
              ['"Acadmify delivered my PhD thesis at 7 AM — exactly when I needed it for library submission. Impeccable binding quality."', 'Dr. R. Mehta', 'University of Rajasthan'],
              ['"The binding met all IIT Jodhpur specifications without any revision. Prompt delivery, genuinely professional service."', 'Aakash Sharma', 'IIT Jodhpur'],
              ['"Ordered at 11 PM, received by 8 AM. The gold embossing on the cover looked exceptionally professional."', 'Dr. Sunita Patel', 'MBM University, Jodhpur'],
            ].map(([quote, name, inst]) => (
              <div key={name} style={{ padding: '1.75rem', border: `1px solid ${C.border}`, borderRadius: 4, background: C.gray1 }}>
                <p style={{ ...serif, fontSize: '1rem', color: C.textBody, lineHeight: 1.85, fontStyle: 'italic', marginBottom: '1.25rem' }}>{quote}</p>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem' }}>
                  <div style={{ ...serif, fontSize: '0.97rem', color: C.maroon, fontWeight: 600 }}>{name}</div>
                  <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted, letterSpacing: '0.06em', marginTop: 3 }}>{inst}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── YouTube / Resources ───────────────────────────────────────── */}
      <section id="resources" style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Helpful Resources</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>Thesis Formatting Guides</h2>
          <DividerDots />
          <p style={{ ...serif, fontSize: '1.1rem', color: C.textBody, lineHeight: 1.85, marginBottom: '2rem' }}>
            Watch our YouTube tutorials on thesis formatting, margin settings, binding selection,
            and university-specific requirements — made specifically for Indian research scholars.
          </p>
          <a href={c('youtube_channel_url')} target="_blank" rel="noreferrer"
            style={{ ...btn('primary'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <YTIcon size={20} /> Visit Our YouTube Channel
          </a>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem' }}>
            {videos.map(({ id, title, desc }) => (
              <div key={title} style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden', background: C.white }}>
                {id ? (
                  <iframe width="100%" height="160"
                    src={`https://www.youtube.com/embed/${id}`}
                    title={title} frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen style={{ display: 'block' }} />
                ) : (
                  <div style={{ background: C.gray2, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <YTIcon size={36} />
                    <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted }}>Add video ID in Admin → Edit Website</div>
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

      {/* ── Contact + Location ────────────────────────────────────────── */}
      <section id="contact" style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Find Us</p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>Contact & Location</h2>
          <DividerDots />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            <div>
              {[
                ['Address',         c('contact_address')],
                ['WhatsApp / Call', c('contact_phone')],
                ['Email',           c('contact_email')],
                ['Hours',           c('contact_hours')],
              ].map(([label, value]) => (
                <div key={label} style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ ...mono, fontSize: '0.62rem', color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                  <div style={{ ...serif, fontSize: '1.05rem', color: C.maroon, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{value}</div>
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href={WA_URL} target="_blank" rel="noreferrer"
                  style={{ ...btn('primary'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <WAIcon size={18} /> Chat on WhatsApp
                </a>
                <a href={`mailto:${c('contact_email')}`}
                  style={{ ...btn('outline'), textDecoration: 'none', textAlign: 'center' }}>
                  Send Email
                </a>
              </div>
            </div>
            <div style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <iframe
                title="Acadmify Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.8565883338!2d73.01261307543055!3d26.278828876958888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394c2bb0ae5ba885%3A0x78b4c75b9f64c0e!2sChopasni%20Housing%20Board%2C%20Jodhpur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1713900000000!5m2!1sen!2sin"
                width="100%" height="360"
                style={{ border: 0, display: 'block' }}
                allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div style={{ padding: '0.75rem 1rem', background: C.gray1, borderTop: `1px solid ${C.border}` }}>
                <a href="https://maps.google.com/?q=Chopasni+Housing+Board+Jodhpur+Rajasthan"
                  target="_blank" rel="noreferrer"
                  style={{ ...mono, fontSize: '0.68rem', color: C.maroon, textDecoration: 'none', letterSpacing: '0.06em' }}>
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{ background: C.maroon, padding: '3rem 3rem 2rem' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <div>
              <div style={{ ...serif, fontSize: '1.5rem', color: '#fff', fontWeight: 600, marginBottom: 4 }}>acadmify</div>
              <div style={{ ...mono, fontSize: '0.52rem', color: '#C69A4A', letterSpacing: '0.22em', marginBottom: '1rem' }}>{c('footer_tagline')}</div>
              <p style={{ ...serif, fontSize: '0.92rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '0.5rem', whiteSpace: 'pre-line' }}>
                {c('contact_address')}
              </p>
              <a href={WA_URL} target="_blank" rel="noreferrer"
                style={{ ...serif, fontSize: '0.92rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>
                {c('contact_phone')}
              </a>
            </div>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              {[
                ['Services', ['Thesis Printing','Hardbound Binding','Softbound Binding','Spiral Binding','Lamination']],
                ['Contact',  ['acadmify.com','WhatsApp Orders','B2B Institutional','Jodhpur Delivery']],
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
