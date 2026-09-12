import { Link, useLocation } from '../lib/router.jsx'
import { usePageMeta } from '../lib/seo.js'

export default function NotFound() {
  const { path } = useLocation()
  usePageMeta({ title: 'Page not found — Acadmify', description: 'This page does not exist.', path, noindex: true })

  return (
    <div className="page page-narrow center">
      <h1>Page not found</h1>
      <p>We couldn’t find that page. It may have moved.</p>
      <p className="btn-row center">
        <Link to="/" className="btn btn-primary">Go to the homepage</Link>
        <Link to="/upload" className="btn btn-outline">Upload your thesis</Link>
      </p>
    </div>
  )
}
