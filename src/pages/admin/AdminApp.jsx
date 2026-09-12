// acadmify.com/admin — sign in with Supabase Auth, then manage orders, website
// text, gallery and prices. Access is decided by the database (admin_users table
// + is_admin()), not by anything in this code.
import { useEffect, useState } from 'react'
import { supabase, adminConfigured } from '../../lib/supabaseAdmin.js'
import { usePageMeta } from '../../lib/seo.js'
import { readJson, writeJson } from '../../lib/util.js'
import AdminLogin, { SetNewPassword } from './AdminLogin.jsx'
import OrdersTab from './OrdersTab.jsx'
import ContentTab from './ContentTab.jsx'
import GalleryTab from './GalleryTab.jsx'
import PricingTab from './PricingTab.jsx'

const TABS = [
  ['orders', 'Orders'],
  ['content', 'Website text'],
  ['gallery', 'Gallery'],
  ['pricing', 'Pricing'],
]

export default function AdminApp() {
  usePageMeta({ title: 'Admin — Acadmify', description: 'Acadmify admin panel', path: '/admin', noindex: true })

  const [session, setSession] = useState(undefined) // undefined = checking, null = signed out
  const [message, setMessage] = useState('')
  const [recovering, setRecovering] = useState(false)
  const [tab, setTab] = useState(() => readJson('sessionStorage', 'acadmify.admin.tab') || 'orders')

  async function checkAdmin(s) {
    if (!s) {
      setSession(null)
      return
    }
    const { data, error } = await supabase.rpc('is_admin')
    if (error || data !== true) {
      await supabase.auth.signOut()
      setSession(null)
      setMessage(error
        ? 'Could not check admin access (' + error.message + '). Has migration 010 been run in Supabase?'
        : 'This account is not an Acadmify admin.')
      return
    }
    setMessage('')
    setSession(s)
  }

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => checkAdmin(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      if (event === 'SIGNED_OUT') setSession(null)
      if (event === 'TOKEN_REFRESHED' && s) setSession(s)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  function chooseTab(id) {
    setTab(id)
    writeJson('sessionStorage', 'acadmify.admin.tab', id)
  }

  if (!adminConfigured) {
    return (
      <div className="admin-wrap">
        <div className="alert-card alert-warn">
          <h1>Admin is not set up</h1>
          <p>
            The website is missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Add both in Vercel → Settings →
            Environment Variables, then redeploy.
          </p>
        </div>
      </div>
    )
  }

  if (recovering) return <SetNewPassword onDone={() => setRecovering(false)} />
  if (session === undefined) return <p className="admin-wrap">Checking your login…</p>
  if (!session) return <AdminLogin onSignedIn={checkAdmin} message={message} />

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-bar-inner">
          <strong>Acadmify admin</strong>
          <span className="hint">{session.user.email}</span>
          <a href="/" target="_blank" rel="noopener noreferrer">View website</a>
          <button type="button" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>
      <nav className="admin-tabs" aria-label="Admin sections">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className="admin-tab" aria-pressed={tab === id} onClick={() => chooseTab(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="admin-body">
        {tab === 'orders' && <OrdersTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'gallery' && <GalleryTab />}
        {tab === 'pricing' && <PricingTab />}
      </div>
    </div>
  )
}
