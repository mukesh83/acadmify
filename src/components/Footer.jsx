// ============================================================================
// src/components/Footer.jsx
// Social icons, policy links, contact details, legal-name disclosure.
//
// Needs "react-icons" in package.json (see package.json.SNIPPET.txt).
// Edit your social URLs in src/constants/index.js -> SOCIALS.
// Leave a URL as '' and that icon will not be shown.
// ============================================================================

import { C, SOCIALS, BUSINESS } from '../constants'
import {
  FaWhatsapp, FaYoutube, FaInstagram,
  FaFacebookF, FaLinkedinIn, FaXTwitter,
} from 'react-icons/fa6'

const ICONS = {
  whatsapp:  FaWhatsapp,
  youtube:   FaYoutube,
  instagram: FaInstagram,
  facebook:  FaFacebookF,
  linkedin:  FaLinkedinIn,
  twitter:   FaXTwitter,
}

export default function Footer({ setPage }) {
  const active = SOCIALS.filter((s) => s.url && s.url.trim() !== '')

  // Works whether or not a setPage function was passed in.
  const go = (p) => () => {
    if (typeof setPage === 'function') setPage(p)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }

  const linkStyle = {
    color: 'rgba(255,255,255,0.82)',
    textDecoration: 'none',
    fontSize: 14,
    display: 'block',
    marginBottom: 9,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    textAlign: 'left',
    fontFamily: 'inherit',
  }

  const headStyle = {
    color: C.white,
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 15,
    fontWeight: 600,
  }

  return (
    <footer style={{
      background: C.maroon,
      color: C.white,
      padding: '52px 20px 26px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 36,
          marginBottom: 40,
        }}>

          {/* Brand + social */}
          <div>
            <div style={{ fontSize: 25, marginBottom: 10 }}>acadmify</div>
            <p style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: 14,
              lineHeight: 1.65,
              margin: 0,
            }}>
              Thesis printing, hardbound binding and doorstep
              delivery for research scholars in Jodhpur.
            </p>

            {active.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                {active.map((s) => {
                  const Icon = ICONS[s.id]
                  if (!Icon) return null
                  return (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: C.white,
                        textDecoration: 'none',
                      }}
                    >
                      <Icon size={16} />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <div style={headStyle}>Services</div>
            <button style={linkStyle} onClick={go('upload')}>Upload Thesis</button>
            <button style={linkStyle} onClick={go('track')}>Track Order</button>
            <button style={linkStyle} onClick={go('home')}>Pricing</button>
          </div>

          {/* Policies */}
          <div>
            <div style={headStyle}>Policies</div>
            <button style={linkStyle} onClick={go('privacy')}>Privacy Policy</button>
            <button style={linkStyle} onClick={go('terms')}>Terms &amp; Conditions</button>
            <button style={linkStyle} onClick={go('refund')}>Refund &amp; Cancellation</button>
            <button style={linkStyle} onClick={go('shipping')}>Shipping &amp; Delivery</button>
          </div>

          {/* Contact */}
          <div>
            <div style={headStyle}>Contact</div>
            <a href={'tel:+' + BUSINESS.phoneRaw} style={linkStyle}>
              {BUSINESS.phone}
            </a>
            <a href={'mailto:' + BUSINESS.email} style={linkStyle}>
              {BUSINESS.email}
            </a>
            <p style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: 14,
              lineHeight: 1.6,
              marginTop: 12,
              marginBottom: 0,
            }}>
              {BUSINESS.address1}<br />
              {BUSINESS.address2}
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.18)',
          paddingTop: 20,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 10,
          fontSize: 13,
          color: 'rgba(255,255,255,0.68)',
        }}>
          <span>
            &copy; {new Date().getFullYear()} {BUSINESS.brand}. All rights reserved.
          </span>
          {/* This line prevents payment disputes: it explains why a bank
              statement says HARI OM GRAPHICS when they paid Acadmify. */}
          <span>A brand of {BUSINESS.legalName}, Jodhpur</span>
        </div>

      </div>
    </footer>
  )
}
