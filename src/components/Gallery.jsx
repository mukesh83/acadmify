// Photos uploaded in Admin -> Gallery. The whole section stays hidden until
// there is at least one photo.
import { useEffect, useState } from 'react'
import { publicSelect } from '../lib/supabasePublic.js'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [broken, setBroken] = useState(() => new Set())

  useEffect(() => {
    let alive = true
    publicSelect('gallery?select=id,name,image_url&active=eq.true&order=sort_order.asc,id.desc').then((rows) => {
      if (alive && Array.isArray(rows)) setItems(rows.filter((r) => r.image_url))
    })
    return () => {
      alive = false
    }
  }, [])

  const shown = items.filter((it) => !broken.has(it.id))
  if (shown.length === 0) return null

  return (
    <section id="gallery" className="section section-alt" aria-labelledby="gallery-title">
      <div className="container">
        <div className="section-head">
          <h2 id="gallery-title">Recent work</h2>
          <p>Theses we have printed and bound.</p>
        </div>
        <ul className="gallery-grid">
          {shown.map((it) => (
            <li key={it.id}>
              <figure>
                <img
                  src={it.image_url}
                  alt={it.name || 'Hardbound thesis printed by Acadmify'}
                  loading="lazy"
                  decoding="async"
                  onError={() => setBroken((s) => new Set(s).add(it.id))}
                />
                {it.name && <figcaption>{it.name}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
