import { C } from '../constants'
import { mono, serif } from '../utils/styles'

export default function Navbar({ page, setPage, adminIn }) {
  return (
    <nav style={{
      background: '#FFFFFF',
      borderBottom: '1px solid ' + C.border,
      padding: '0 2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 70,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 8px rgba(122,30,30,0.07)',
    }}>

      {/* ── Logo — actual Acadmify image ─────────────────────────── */}
      <div
        onClick={() => setPage('home')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <img
          src="/acadmify-logo.jpg"
          alt="Acadmify — Print Bind Submit"
          style={{
            height: 48,        // fits navbar height neatly
            width: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* ── Nav Links ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {[
          ['home',   'Home'],
          ['upload', 'Upload Thesis'],
          ['track',  'Track Order'],
        ].map(([p, label]) => (
          <span
            key={p}
            onClick={() => setPage(p)}
            style={{
              cursor: 'pointer',
              ...serif,
              fontSize: '1.05rem',
              color: page === p ? C.maroon : C.textMuted,
              fontWeight: page === p ? 600 : 400,
              borderBottom: page === p ? '2px solid ' + C.maroon : '2px solid transparent',
              paddingBottom: 2,
              transition: 'all 0.15s',
            }}
          >
            {label}
          </span>
        ))}

        {/* Admin button — hidden (access via /#admin-mukesh) */}
        {adminIn && (
          <span
            onClick={() => setPage('admin')}
            style={{
              ...mono,
              cursor: 'pointer',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              color: '#fff',
              background: C.maroon,
              padding: '6px 14px',
              borderRadius: 3,
            }}
          >
            Admin Panel
          </span>
        )}
      </div>
    </nav>
  )
}
