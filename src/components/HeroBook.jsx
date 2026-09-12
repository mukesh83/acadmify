// The hardbound thesis drawn in CSS. Tapping a colour swatch recolours the
// cover and the lettering switch shows gold or silver, so the hero doubles as
// a preview of the 12 cover colours and both lettering options.
import { COVERS, coverById, LETTERING } from '../constants.js'

export function Book({ cover = 'maroon', lettering = 'gold', size = 'lg' }) {
  const year = new Date().getFullYear()
  return (
    <div className={'book-scene book-' + size} aria-hidden="true">
      <div className={'book' + (lettering === 'silver' ? ' is-silver' : '')} style={{ '--cover': coverById(cover).hex }}>
        <div className="book-face book-front">
          <span className="foil foil-small">A thesis submitted for the degree of</span>
          <span className="foil foil-degree">Doctor of Philosophy</span>
          <span className="foil-rule" />
          <span className="foil foil-small">by</span>
          <span className="foil foil-name">Your Name</span>
          <span className="foil foil-foot">Your University · {year}</span>
        </div>
        <div className="book-face book-spine">
          <span className="foil">Ph.D. Thesis · {year}</span>
        </div>
        <div className="book-face book-top" />
      </div>
    </div>
  )
}

export function CoverPicker({ value, onChange, legend = 'Cover colour', name = 'cover' }) {
  const current = coverById(value)
  return (
    <fieldset className="cover-picker">
      <legend>
        {legend}: <strong>{current.label}</strong>
      </legend>
      <div className="swatches">
        {COVERS.map((c) => (
          <label key={c.id} className="swatch" style={{ '--swatch': c.hex }} title={c.label}>
            <input type="radio" name={name} value={c.id} checked={current.id === c.id} onChange={() => onChange(c.id)} />
            <span className="swatch-dot" />
            <span className="sr-only">{c.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function LetteringPicker({ value, onChange, name = 'lettering' }) {
  return (
    <fieldset className="lettering-picker">
      <legend>Lettering</legend>
      <div className="segmented segmented-sm">
        {LETTERING.map((l) => (
          <label key={l.id} className={value === l.id ? 'is-on' : ''}>
            <input type="radio" name={name} value={l.id} checked={value === l.id} onChange={() => onChange(l.id)} />
            <span className={'lettering-dot lettering-' + l.id} aria-hidden="true" />
            {l.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function HeroBook({ cover, onChange, lettering, onLettering }) {
  return (
    <div className="hero-book">
      <Book cover={cover} lettering={lettering} />
      <CoverPicker value={cover} onChange={onChange} legend="Try a cover colour" name="hero-cover" />
      <LetteringPicker value={lettering} onChange={onLettering} name="hero-lettering" />
    </div>
  )
}
