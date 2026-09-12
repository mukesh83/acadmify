// Decides which page to show for the current address.
// Routes: /  /upload  /track  /contact  /privacy  /terms  /refund  /shipping  /admin
import { lazy, Suspense, useEffect, useRef } from 'react'
import { useLocation, navigate, scrollToTarget } from './lib/router.jsx'
import { ContentProvider } from './lib/content.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppFloat from './components/WhatsAppFloat.jsx'
import Home from './pages/Home.jsx'
import Upload from './pages/Upload.jsx'
import Track from './pages/Track.jsx'
import Contact from './pages/Contact.jsx'
import Policy from './pages/Policy.jsx'
import NotFound from './pages/NotFound.jsx'

// The admin panel (and the Supabase library it needs) downloads only when /admin is opened
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'))

const PAGES = { '/': Home, '/upload': Upload, '/track': Track, '/contact': Contact }
const POLICIES = ['privacy', 'terms', 'refund', 'shipping']

export default function App() {
  const { path } = useLocation()
  const firstRender = useRef(true)

  // Old secret link acadmify.com/#admin-mukesh -> /admin
  useEffect(() => {
    if (window.location.hash === '#admin-mukesh') navigate('/admin', { replace: true })
    else if (window.location.hash) setTimeout(() => scrollToTarget(decodeURIComponent(window.location.hash.slice(1))), 300)
  }, [])

  // After moving to another page, put keyboard focus at the start of the content
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const main = document.getElementById('main')
    if (main) main.focus({ preventScroll: true })
  }, [path])

  const isAdmin = path === '/admin' || path.startsWith('/admin/')
  const policy = POLICIES.find((p) => path === '/' + p)
  const Page = PAGES[path]

  let page
  if (isAdmin) {
    page = (
      <Suspense fallback={<p className="page container">Loading admin…</p>}>
        <AdminApp />
      </Suspense>
    )
  } else if (Page) {
    page = <Page />
  } else if (policy) {
    page = <Policy which={policy} />
  } else {
    page = <NotFound />
  }

  return (
    <ContentProvider>
      {!isAdmin && <a className="skip-link" href="#main">Skip to content</a>}
      {!isAdmin && <Navbar />}
      <main id="main" tabIndex={-1}>
        {page}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && path !== '/upload' && <WhatsAppFloat />}
    </ContentProvider>
  )
}
