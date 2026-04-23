import { useState } from 'react'
import { C, ADMIN_PASSWORD } from '../constants'
import { mono, serif, inputStyle, labelStyle, btn, cardStyle } from '../utils/styles'

export default function AdminLogin({ onLogin }) {
  const [pw,  setPw]  = useState('')
  const [err, setErr] = useState(false)

  const tryLogin = () => {
    if (pw.trim() === ADMIN_PASSWORD) {
      onLogin(pw.trim())
      setErr(false)
    } else {
      setErr(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.gray1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 380, ...cardStyle, padding: '2.5rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(122,30,30,0.08)',
            border: `1.5px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', fontSize: 22,
          }}>🔐</div>
          <h2 style={{ ...serif, fontSize: '1.9rem', fontWeight: 600, color: C.maroon, marginBottom: '0.25rem' }}>
            Admin Access
          </h2>
          <p style={{ ...serif, fontSize: '0.95rem', color: C.textMuted }}>Acadmify Operations Panel</p>
        </div>

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(false) }}
          onKeyDown={e => e.key === 'Enter' && tryLogin()}
          placeholder="Enter admin password"
          style={{ ...inputStyle, border: `1.5px solid ${err ? '#C0392B' : C.border}`, marginBottom: err ? 4 : 14 }}
        />
        {err && (
          <div style={{ ...mono, fontSize: '0.65rem', color: '#C0392B', marginBottom: 12 }}>
            Incorrect password. Please try again.
          </div>
        )}

        <button
          onClick={tryLogin}
          style={{ ...btn('primary'), width: '100%' }}
        >
          Sign In
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem', ...mono, fontSize: '0.62rem', color: C.textMuted }}>
          Password set in src/constants/index.js
        </div>
      </div>
    </div>
  )
}
