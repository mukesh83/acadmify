// ============================================================================
// src/components/AdminLogin.jsx
// Real login, using Supabase Auth.
//
// The password is NOT in this file and is not anywhere in your code.
// It lives on Supabase's servers. That is the whole point of this change.
//
// CHECK ONE THING: your old AdminLogin received a prop. If it was called
// something other than onSuccess (e.g. onLogin, setLoggedIn), rename it
// on the two lines marked PROP NAME below so it matches Admin.jsx / App.jsx.
// ============================================================================

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C } from '../constants'

const wrap = {
  maxWidth: 400,
  margin: '80px auto',
  padding: '0 20px',
}

const box = {
  background: C.white,
  border: '1px solid ' + C.gray3,
  borderTop: '3px solid ' + C.maroon,
  padding: '32px 28px',
}

const label = {
  display: 'block',
  fontSize: 13,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: C.textMuted,
  marginBottom: 6,
}

const input = {
  width: '100%',
  padding: '11px 12px',
  fontSize: 16,          // 16px stops iPhones zooming in on focus
  border: '1px solid ' + C.gray3,
  borderRadius: 2,
  background: C.white,
  color: C.textBody,
  fontFamily: 'inherit',
  marginBottom: 18,
}

const button = {
  width: '100%',
  padding: '12px 16px',
  fontSize: 16,
  fontFamily: 'inherit',
  background: C.maroon,
  color: C.white,
  border: 'none',
  borderRadius: 2,
  cursor: 'pointer',
  marginTop: 4,
}

export default function AdminLogin({ onSuccess }) {   // <-- PROP NAME
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  async function handleLogin() {
    if (busy) return
    setError('')
    setBusy(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    setBusy(false)

    if (error) {
      // Deliberately vague: never reveal whether the email exists.
      setError('Wrong email or password.')
      return
    }

    if (typeof onSuccess === 'function') {
      onSuccess(data.session)                          // <-- PROP NAME
    }
  }

  const onKeyDown = (e) => { if (e.key === 'Enter') handleLogin() }

  return (
    <div style={wrap}>
      <div style={box}>
        <h2 style={{ color: C.maroon, margin: '0 0 6px', fontSize: 24 }}>
          Admin Login
        </h2>
        <p style={{ color: C.textMuted, fontSize: 14, margin: '0 0 26px' }}>
          Acadmify website management
        </p>

        <label style={label} htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          style={input}
          type="email"
          value={email}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck="false"
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <label style={label} htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          style={input}
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKeyDown}
        />

        {error && (
          <p style={{
            color: '#B02020',
            background: '#FDF4F4',
            padding: '9px 12px',
            fontSize: 14,
            margin: '0 0 14px',
          }}>
            {error}
          </p>
        )}

        <button
          style={{ ...button, opacity: busy ? 0.65 : 1 }}
          onClick={handleLogin}
          disabled={busy}
        >
          {busy ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{
          color: C.textMuted,
          fontSize: 12,
          marginTop: 18,
          marginBottom: 0,
          lineHeight: 1.6,
        }}>
          Forgot the password? Reset it in Supabase:
          Authentication &rarr; Users &rarr; your user &rarr; Reset password.
        </p>
      </div>
    </div>
  )
}
