import { useState } from 'react'
import { adminLogin } from '../utils/api.js'
import { C } from '../constants'
import { mono, serif, inputStyle, btn } from '../utils/styles'

export default function AdminLogin({ onLogin }) {
  const [pw,      setPw]      = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const tryLogin = async () => {
    if (!pw.trim()) return
    setLoading(true)
    setError(null)

    try {
      // Validate by hitting a protected admin endpoint with the secret
      await adminLogin(pw.trim())
      onLogin(pw.trim())  // pass secret up so Admin panel can use it
    } catch {
      setError('Incorrect password or server unreachable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 340, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '2.25rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: 32, marginBottom: '0.5rem' }}>🔐</div>
          <h2 style={{ ...serif, fontSize: '1.7rem', color: C.cream, marginBottom: '0.2rem' }}>Admin Access</h2>
          <div style={{ ...mono, fontSize: '0.65rem', color: C.muted }}>Acadmify Operations Panel</div>
        </div>

        <label style={{ display: 'block', ...mono, fontSize: '0.7rem', color: C.gold, marginBottom: 6 }}>
          PASSWORD
        </label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryLogin()}
          placeholder="Admin password"
          style={{ ...inputStyle, border: `1px solid ${error ? '#E74C3C' : C.border}`, marginBottom: error ? 4 : 12 }}
        />
        {error && (
          <div style={{ ...mono, fontSize: '0.65rem', color: '#E74C3C', marginBottom: 10 }}>{error}</div>
        )}

        <button onClick={tryLogin} disabled={loading}
          style={{ ...btn(loading ? 'rgba(201,168,76,0.4)' : C.gold), width: '100%' }}>
          {loading ? 'Verifying…' : 'Login'}
        </button>
      </div>
    </div>
  )
}
