// ============================================================================
// src/App.REFERENCE.jsx  -- REFERENCE ONLY, DO NOT COPY OVER YOUR App.jsx
//
// Your real App.jsx has code I cannot see. Use this to work out which small
// pieces to add to yours. The important parts are marked NEW.
// ============================================================================

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

import Navbar   from './components/Navbar'
import Home     from './components/Home'
import Upload   from './components/Upload'
import Track    from './components/Track'
import AdminLogin from './components/AdminLogin'
import Admin      from './components/Admin'
import Policies from './components/Policies'   // NEW
import Footer   from './components/Footer'     // NEW

export default function App() {
  const [page, setPage]       = useState('home')
  const [session, setSession] = useState(null)   // NEW: replaces isLoggedIn

  // NEW: pick up an existing login on page load, and follow sign-in/out.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Your existing hidden admin route.
  useEffect(() => {
    if (window.location.hash === '#admin-mukesh') setPage('admin')
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar setPage={setPage} />

      <main style={{ flex: 1 }}>
        {page === 'home'   && <Home setPage={setPage} />}
        {page === 'upload' && <Upload setPage={setPage} />}
        {page === 'track'  && <Track />}

        {/* NEW: the four policy pages Razorpay requires */}
        {page === 'privacy'  && <Policies which="privacy"  />}
        {page === 'terms'    && <Policies which="terms"    />}
        {page === 'refund'   && <Policies which="refund"   />}
        {page === 'shipping' && <Policies which="shipping" />}

        {/* NEW: admin is gated on a real Supabase session, not a password */}
        {page === 'admin' && (
          session
            ? <Admin onSignOut={() => { setSession(null); setPage('home') }} />
            : <AdminLogin onSuccess={(s) => setSession(s)} />
        )}
      </main>

      {/* NEW: footer sits outside the page switch so it shows everywhere */}
      <Footer setPage={setPage} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// CHECKLIST FOR YOUR OWN App.jsx
//
//  [ ] import Policies and Footer at the top
//  [ ] import { supabase } from './lib/supabase'
//  [ ] add the session state + the useEffect that watches auth
//  [ ] add the four policy lines
//  [ ] change the admin condition from a password check to: session ? ... : ...
//  [ ] put <Footer setPage={setPage} /> at the bottom, outside the page switch
//  [ ] delete the old footer markup from the end of Home.jsx
//  [ ] in Home.jsx: import GoogleReviews and use it where Testimonials was
//  [ ] in Home.jsx and Upload.jsx: add <ConfidentialityNote />
//
// If your state setter is not called setPage (e.g. setCurrentPage, navigate),
// use YOUR name everywhere above. The names just have to match.
// ---------------------------------------------------------------------------
