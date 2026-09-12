// Shows a thumbnail; the real YouTube player (heavy) loads only when tapped.
import { useState } from 'react'
import { IconYouTube } from './Icons.jsx'

export default function LiteYouTube({ id, title }) {
  const [playing, setPlaying] = useState(false)
  const label = title || 'Acadmify video'

  if (playing) {
    return (
      <div className="video-frame">
        <iframe
          src={'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0'}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button type="button" className="video-frame video-poster" onClick={() => setPlaying(true)} aria-label={'Play video: ' + label}>
      <img src={'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'} alt="" loading="lazy" decoding="async" />
      <span className="video-play" aria-hidden="true"><IconYouTube size={60} /></span>
    </button>
  )
}
