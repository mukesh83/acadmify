// Real Google reviews. If an Elfsight widget id is set (Website text), the live
// widget loads when the section scrolls near the screen. Otherwise the short
// excerpts typed into Website text are shown. Never invent reviews here.
import { useEffect, useRef, useState } from 'react'
import { useContent } from '../lib/content.jsx'

const WIDGET_ID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i

export default function Reviews() {
  const c = useContent()
  const ref = useRef(null)
  const [loadWidget, setLoadWidget] = useState(false)

  const widgetId = WIDGET_ID_RE.test(c('elfsight_widget_id')) ? c('elfsight_widget_id') : ''
  const excerpts = [1, 2, 3, 4]
    .map((n) => ({ name: c('review' + n + '_name'), text: c('review' + n + '_text'), meta: c('review' + n + '_meta') }))
    .filter((r) => r.name && r.text)
  const reviewsUrl = c('google_reviews_url')

  useEffect(() => {
    if (!widgetId || !ref.current) return undefined
    if (!('IntersectionObserver' in window)) {
      setLoadWidget(true)
      return undefined
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setLoadWidget(true)
        io.disconnect()
      }
    }, { rootMargin: '600px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [widgetId])

  useEffect(() => {
    if (!loadWidget || document.querySelector('script[data-elfsight]')) return
    const s = document.createElement('script')
    s.src = 'https://elfsightcdn.com/platform.js'
    s.async = true
    s.dataset.elfsight = 'true'
    document.body.appendChild(s)
  }, [loadWidget])

  return (
    <section id="reviews" className="section" aria-labelledby="reviews-title" ref={ref}>
      <div className="container">
        <div className="section-head">
          <h2 id="reviews-title">What customers say</h2>
          <p>Reviews from our Google Business Profile.</p>
        </div>

        {widgetId ? (
          <div className="reviews-widget">
            {loadWidget && <div className={'elfsight-app-' + widgetId} data-elfsight-app-lazy="" />}
          </div>
        ) : excerpts.length > 0 ? (
          <ul className="review-grid">
            {excerpts.map((r) => (
              <li key={r.name} className="review-card">
                <blockquote>
                  <p>“{r.text}”</p>
                </blockquote>
                <p className="review-meta">
                  <strong>{r.name}</strong>
                  {r.meta ? ' · ' + r.meta : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {reviewsUrl && (
          <p className="section-cta">
            <a className="btn btn-outline" href={reviewsUrl} target="_blank" rel="noopener noreferrer">
              Read all reviews on Google
            </a>
          </p>
        )}
      </div>
    </section>
  )
}
