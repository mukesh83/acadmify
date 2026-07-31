// ============================================================================
// src/components/GoogleReviews.jsx
// Your real Google reviews, shown on the homepage.
//
// HOW TO ADD A REVIEW
//   Open your Google Business Profile, copy the review text WORD FOR WORD,
//   and add an entry to the REVIEWS list below. Newest at the top.
//   Do not edit or improve the wording. Do not invent reviews.
//
// Then set GOOGLE_REVIEW_URL in src/constants/index.js -> BUSINESS.
// That link is what makes these credible: a visitor can verify in one click.
//
// PREFER AN AUTOMATIC WIDGET? See the note at the bottom of this file.
// ============================================================================

import { C, BUSINESS } from '../constants'
import { FaStar, FaGoogle } from 'react-icons/fa6'

const REVIEWS = [
  {
    name: 'REPLACE WITH REAL NAME',
    stars: 5,
    when: '2 months ago',
    text: 'Replace this with the exact text of a real Google review.',
  },
  {
    name: 'REPLACE WITH REAL NAME',
    stars: 5,
    when: '3 months ago',
    text: 'Replace this with the exact text of a real Google review.',
  },
  {
    name: 'REPLACE WITH REAL NAME',
    stars: 5,
    when: '4 months ago',
    text: 'Replace this with the exact text of a real Google review.',
  },
  // Add up to 6. More than 6 on one page stops being read.
]

function Stars({ n }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 11 }}
         aria-label={n + ' out of 5 stars'}>
      {Array.from({ length: n }).map((_, i) => (
        <FaStar key={i} size={14} color="#F5A623" />
      ))}
    </div>
  )
}

export default function GoogleReviews() {
  const usable = REVIEWS.filter((r) => !r.name.startsWith('REPLACE'))
  if (usable.length === 0) return null   // shows nothing until you add real ones

  return (
    <section style={{ background: C.gray1, padding: '64px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <h2 style={{
          color: C.maroon,
          textAlign: 'center',
          fontSize: 32,
          margin: '0 0 8px',
        }}>
          What scholars say about us
        </h2>

        <p style={{
          textAlign: 'center',
          color: C.textMuted,
          fontSize: 15,
          margin: '0 0 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <FaGoogle size={14} /> Verified reviews from our Google Business Profile
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {usable.map((r, i) => (
            <div key={i} style={{
              background: C.white,
              border: '1px solid ' + C.gray3,
              borderTop: '3px solid ' + C.maroon,
              padding: '22px 22px 20px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <Stars n={r.stars} />
              <p style={{
                color: C.textBody,
                fontSize: 15,
                lineHeight: 1.65,
                flex: 1,
                margin: '0 0 18px',
              }}>
                {r.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: C.maroon, color: C.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 600, flexShrink: 0,
                }}>
                  {r.name.trim().charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textBody }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{r.when}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, marginBottom: 0 }}>
          <a
            href={BUSINESS.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: C.maroon,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            Read all our reviews on Google &rarr;
          </a>
        </p>

      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// WANT IT TO UPDATE AUTOMATICALLY?
//
// Sign up free at featurable.com, connect your Google Business Profile, and
// it gives you a <div> plus a <script>. Then replace the <div> grid above with
// the Featurable div, and load its script inside a useEffect:
//
//   useEffect(() => {
//     const s = document.createElement('script')
//     s.src = 'PASTE_FEATURABLE_SCRIPT_URL'
//     s.async = true
//     document.body.appendChild(s)
//     return () => document.body.removeChild(s)
//   }, [])
//
// Why not call Google's own API directly? It returns a maximum of 5 reviews,
// no matter how many you have, and that limit has never changed.
// ---------------------------------------------------------------------------
