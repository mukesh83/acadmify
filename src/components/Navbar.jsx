import { C } from '../constants'
import { mono, serif } from '../utils/styles.jsx'

export default function Navbar({ page, setPage, adminIn }) {
  return (
    <nav style={{
      background: '#FFFFFF',
      borderBottom: `1px solid ${C.border}`,
      padding: '0 3rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 68, position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 8px rgba(122,30,30,0.06)',
    }}>

      {/* Logo — matches the actual Acadmify logo style */}
      <div onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
        <div style={{ ...serif, fontSize: '1.65rem', color: C.maroon, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.01em' }}>
          acadmify
        </div>
        <div style={{ ...mono, fontSize: '0.52rem', color: C.dot, letterSpacing: '0.22em', marginTop: 2 }}>
          PRINT ◆ BIND ◆ SUBMIT
        </div>
      </div>

      {/* Navigation links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {[['home', 'Home'], ['upload', 'Upload Thesis'], ['track', 'Track Order']].map(([p, label]) => (
          <span
            key={p}
            onClick={() => setPage(p)}
            style={{
              cursor: 'pointer',
              ...serif,
              fontSize: '1.05rem',
              color: page === p ? C.maroon : C.textMuted,
              fontWeight: page === p ? 600 : 400,
              borderBottom: page === p ? `2px solid ${C.maroon}` : '2px solid transparent',
              paddingBottom: 2,
              transition: 'all 0.15s',
            }}
          >
            {label}
          </span>
        ))}

        <span
          onClick={() => setPage(adminIn ? 'admin' : 'adminlogin')}
          style={{
            ...mono,
            cursor: 'pointer',
            fontSize: '0.7rem',
            letterSpacing: '0.05em',
            color: '#fff',
            background: C.maroon,
            padding: '7px 16px',
            borderRadius: 3,
            transition: 'opacity 0.15s',
          }}
        >
          {adminIn ? 'Admin Panel' : 'Admin'}
        </span>
      </div>
    </nav>
  )
}
