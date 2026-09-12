import { useEffect, useState } from 'react'
import { Link, useLocation } from '../lib/router.jsx'
import { useContent } from '../lib/content.jsx'
import { IconMenu, IconClose } from './Icons.jsx'

const LINKS = [
  ['/', 'Home'],
  ['/upload', 'Upload thesis'],
  ['/track', 'Track order'],
  ['/contact', 'Contact'],
]

export default function Navbar() {
  const { path } = useLocation()
  const c = useContent()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [path])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const announcement = c('announcement_text')

  return (
    <>
      {announcement && <div className="announce">{announcement}</div>}
      <header className="site-header">
        <div className="container nav">
          <Link to="/" className="brand">
            <img src="/logo.png" width="158" height="48" alt="Acadmify — Print, Bind, Submit" />
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconClose size={26} /> : <IconMenu size={26} />}
          </button>

          <nav
            id="site-menu"
            className={'nav-links' + (open ? ' is-open' : '')}
            aria-label="Main"
            onClick={(e) => e.target.closest('a') && setOpen(false)}
          >
            {LINKS.map(([to, label]) => (
              <Link key={to} to={to} aria-current={path === to ? 'page' : undefined}>
                {label}
              </Link>
            ))}
            <Link to="/#quote" className="btn btn-primary btn-sm nav-cta">
              Get a price
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}
