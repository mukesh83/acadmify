import { C } from '../constants'
import { mono, serif, btn, DividerDots } from '../utils/styles.jsx'

export default function Home({ setPage }) {
  return (
    <div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '5rem 3rem 4.5rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.7rem', color: C.textMuted, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Jodhpur, Rajasthan — India's Premier Academic Thesis Printing Service
          </p>

          <h1 style={{ ...serif, fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', fontWeight: 600, color: C.maroon, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Print. Bind. Submit.<br />
            <em style={{ fontWeight: 400, fontStyle: 'italic' }}>With Confidence.</em>
          </h1>

          <DividerDots />

          <p style={{ ...serif, fontSize: '1.2rem', color: C.textBody, lineHeight: 1.9, maxWidth: 620, marginBottom: '2.5rem' }}>
            Acadmify is Jodhpur's trusted thesis printing and binding service for PhD scholars,
            postgraduate researchers, and academic institutions. Upload your thesis tonight —
            receive a professionally bound copy at your doorstep within 24 hours.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button onClick={() => setPage('upload')} style={btn('primary')}>
              Upload Your Thesis →
            </button>
            <button onClick={() => setPage('track')} style={btn('outline')}>
              Track My Order
            </button>
          </div>

          {/* Stats row — institutional-style */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden' }}>
            {[['500+', 'Theses Printed'], ['24 hr', 'Doorstep Delivery'], ['98%', 'Quality Rate'], ['₹2/pg', 'B&W Printing']].map(([v, l], i) => (
              <div key={l} style={{ padding: '1.25rem 1.5rem', textAlign: 'center', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ ...serif, fontSize: '2rem', fontWeight: 600, color: C.maroon }}>{v}</div>
                <div style={{ ...mono, fontSize: '0.6rem', color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Acadmify ──────────────────────────────────────────────────── */}
      <section style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Why Researchers Choose Acadmify
          </p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>
            Built for Academic Excellence
          </h2>
          <DividerDots />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))', gap: '1.5rem' }}>
            {[
              ['Archival Print Quality', 'Every thesis is printed on acid-free, 70gsm bond paper using high-resolution 600dpi laser printing. Your research is preserved as it deserves to be — for decades.'],
              ['24-Hour Guaranteed Delivery', 'We understand submission deadlines. Place your order before midnight — receive your professionally bound thesis at your hostel or institution by morning.'],
              ['University Compliant Binding', 'Our binding specifications meet the requirements of DU, JNU, IIT, and all Rajasthan universities including MBM, JNVU, and RTU. Accepted first time, every time.'],
              ['Transparent Pricing', 'No hidden charges. B&W at ₹2/page, colour at ₹10/page. Get an instant itemised quotation before you commit to anything.'],
            ].map(([title, desc]) => (
              <div key={title} style={{
                padding: '1.5rem', background: C.white,
                border: `1px solid ${C.border}`,
                borderTop: `3px solid ${C.maroon}`,
                borderRadius: '0 0 4px 4px',
              }}>
                <h3 style={{ ...serif, fontSize: '1.2rem', fontWeight: 600, color: C.maroon, marginBottom: '0.6rem' }}>{title}</h3>
                <p style={{ ...serif, fontSize: '0.97rem', color: C.textBody, lineHeight: 1.8 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            The Process
          </p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>
            From Upload to Doorstep in 5 Steps
          </h2>
          <DividerDots />

          {[
            ['Upload',     'Share your thesis PDF and an optional cover page through our secure portal. All files are encrypted and accessible only to our printing team.'],
            ['Configure',  'Select your binding type — hardbound, softbound, or spiral. Choose your cover colour from our catalogue. Specify the number of copies required.'],
            ['Quotation',  'Receive an instant, fully itemised quotation. Pricing is completely transparent: B&W at ₹2/page, colour at ₹10/page, with no hidden charges.'],
            ['Payment',    'Pay securely via Razorpay — UPI, credit/debit cards, and net banking all accepted. Your order is confirmed immediately upon payment.'],
            ['Delivered',  'Your bound thesis is hand-delivered to your address within 24 hours of payment. A tracking link is sent to your registered WhatsApp number.'],
          ].map(([title, desc], i) => (
            <div key={title} style={{ display: 'flex', gap: '1.75rem', padding: '1.5rem 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ ...mono, fontSize: '1.6rem', color: C.gray3, fontWeight: 500, minWidth: 40, paddingTop: 3 }}>
                0{i + 1}
              </div>
              <div>
                <h3 style={{ ...serif, fontSize: '1.25rem', fontWeight: 600, color: C.maroon, marginBottom: '0.35rem' }}>{title}</h3>
                <p style={{ ...serif, fontSize: '1rem', color: C.textBody, lineHeight: 1.8 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section style={{ background: C.gray1, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...mono, fontSize: '0.65rem', color: C.textMuted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Pricing Schedule
          </p>
          <h2 style={{ ...serif, fontSize: '2.5rem', fontWeight: 600, color: C.maroon, marginBottom: '0.75rem' }}>
            Transparent, Research-Friendly Pricing
          </h2>
          <DividerDots />

          <table style={{ width: '100%', borderCollapse: 'collapse', ...serif, fontSize: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.maroon}` }}>
                {['Service', 'Rate', 'Specification'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Rate' ? 'center' : 'left', padding: '10px 0', color: C.maroon, fontWeight: 600, paddingLeft: h === 'Specification' ? '1.5rem' : 0 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Black & White Printing', '₹2 / page',    '70gsm acid-free bond, 600dpi laser, both sides'],
                ['Colour Printing',        '₹10 / page',   '90gsm glossy coated, vivid full-colour reproduction'],
                ['Hardbound Binding',      '₹350 / copy',  'Buckram cloth cover, gold foil title and spine stamping'],
                ['Softbound Binding',      '₹150 / copy',  'Laminated cover with perfect-bound spine'],
                ['Spiral Binding',         '₹100 / copy',  'Wire-o spiral, lay-flat, durable coil'],
                ['Delivery (Jodhpur)',     '₹50 flat',     'Free on orders above ₹500. Same-day if ordered before 10 PM'],
              ].map(([service, rate, note], i) => (
                <tr key={service} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : 'transparent' }}>
                  <td style={{ padding: '12px 0', color: C.maroon, fontWeight: 500 }}>{service}</td>
                  <td style={{ padding: '12px 0', textAlign: 'center', color: C.maroon, fontWeight: 600 }}>{rate}</td>
                  <td style={{ padding: '12px 0 12px 1.5rem', color: C.textMuted, fontSize: '0.94rem' }}>{note}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button onClick={() => setPage('upload')} style={btn('primary')}>
              Calculate Your Quotation →
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '4.5rem 3rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2 style={{ ...serif, fontSize: '2.2rem', fontWeight: 600, color: C.maroon, textAlign: 'center', marginBottom: '2.25rem' }}>
            Trusted by Scholars Across India
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              ['"Acadmify delivered my PhD thesis at 7 AM — precisely when I needed it for the library submission. The hardbound quality was impeccable."', 'Dr. R. Mehta', 'University of Rajasthan'],
              ['"The binding met all IIT Jodhpur specifications without any revision required. Prompt delivery, genuinely professional service."', 'Aakash Sharma', 'IIT Jodhpur'],
              ['"Ordered at 11 PM, received by 8 AM. The gold embossing on the maroon cover looked exactly as I had envisioned for my doctoral thesis."', 'Dr. Sunita Patel', 'MBM University, Jodhpur'],
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

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ background: C.maroon, padding: '3rem 3rem 2rem' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <div>
              <div style={{ ...serif, fontSize: '1.5rem', color: '#fff', fontWeight: 600, marginBottom: 4 }}>acadmify</div>
              <div style={{ ...mono, fontSize: '0.52rem', color: C.dot, letterSpacing: '0.22em', marginBottom: '1rem' }}>PRINT ◆ BIND ◆ SUBMIT</div>
              <p style={{ ...serif, fontSize: '0.92rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                Hari Om Graphics<br />Jodhpur, Rajasthan — 342001
              </p>
            </div>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              {[
                ['Services', ['Thesis Printing', 'Hardbound Binding', 'Softbound Binding', 'Spiral Binding', 'Lamination']],
                ['Contact',  ['acadmify.com', 'WhatsApp Orders', 'B2B Institutional', 'Jodhpur Delivery']],
              ].map(([heading, items]) => (
                <div key={heading}>
                  <div style={{ ...mono, fontSize: '0.6rem', color: C.dot, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>{heading}</div>
                  {items.map(item => (
                    <div key={item} style={{ ...serif, fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', marginBottom: 5 }}>{item}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...mono, fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
            © 2025 ACADMIFY. GST REGISTERED: HARI OM GRAPHICS, JODHPUR. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  )
}
