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

import { useEffect } from 'react'
import { C } from '../constants'

export default function GoogleReviews() {
  useEffect(() => {
    // Load Elfsight platform script
    const s = document.createElement('script')
    s.src = 'https://elfsightcdn.com/platform.js'
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  return (
    <section style={{ background: C.gray1, padding: '64px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{
          color: C.maroon, textAlign: 'center',
          fontSize: 32, marginBottom: 8,
        }}>
          What scholars say about us
        </h2>
        <p style={{
          textAlign: 'center', color: C.textMuted,
          marginBottom: 36, fontSize: 16,
        }}>
          Verified reviews from our Google Business Profile
        </p>
        {/* Elfsight Google Reviews Widget */}
        <div 
          className="elfsight-app-2ecb70bc-3b18-4c40-929f-b1ca11847144" 
          data-elfsight-app-lazy
        ></div>
        <p style={{ textAlign: 'center', marginTop: 28 }}>
          href="https://www.google.com/maps/place/Acadmify/@26.2594145,72.971503"
              target="_blank"
            rel="noopener noreferrer"
            style={{ color: C.maroon, fontWeight: 600 }}
          >
            Read all our reviews on Google &rarr;
          </a>
        </p>
      </div>
    </section>
  )
}