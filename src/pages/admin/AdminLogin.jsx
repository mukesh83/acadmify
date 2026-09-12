// Admin sign-in with Supabase Auth. The password lives on Supabase's servers,
// never in this code.
import { useState } from 'react'
import { supabase } from '../../lib/supabaseAdmin.js'
import Field from '../../components/Field.jsx'

export default function AdminLogin({ onSignedIn, message }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function signIn(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    setBusy(false)
    if (err) {
      setError('Wrong email or password.')
      return
    }
    onSignedIn(data.session)
  }

  async function forgot() {
    setError('')
    if (!email.trim()) {
      setError('Type your email above first, then press “Forgot password?” again.')
      return
    }
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin + '/admin' })
    setInfo('If that email is an admin, a reset link is on its way. Open it on this device.')
  }

  return (
    <div className="admin-wrap">
      <form className="form-card" onSubmit={signIn}>
        <h1>Admin sign in</h1>
        {message && <p className="admin-msg error">{message}</p>}
        <Field id="a-email" label="Email">
          <input id="a-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field id="a-password" label="Password">
          <input id="a-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && <p className="admin-msg error" role="alert">{error}</p>}
        {info && <p className="admin-msg ok">{info}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="hint center"><button type="button" className="link-btn" onClick={forgot}>Forgot password?</button></p>
      </form>
    </div>
  )
}

export function SetNewPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault()
    if (password.length < 10) {
      setError('Use at least 10 characters.')
      return
    }
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (err) setError(err.message)
    else onDone()
  }

  return (
    <div className="admin-wrap">
      <form className="form-card" onSubmit={save}>
        <h1>Set a new password</h1>
        <Field id="a-new" label="New password" hint="At least 10 characters.">
          <input id="a-new" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p className="admin-msg error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
      </form>
    </div>
  )
}
