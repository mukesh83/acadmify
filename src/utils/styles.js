import { C } from '../constants'

export const mono  = { fontFamily: "'DM Mono', monospace" }
export const serif = { fontFamily: "'EB Garamond', Georgia, serif" }

export const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: '#FFFFFF',
  border: `1.5px solid ${C.border}`,
  borderRadius: 4,
  color: C.textBody,
  ...serif,
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
}

export const labelStyle = {
  display: 'block',
  ...mono,
  fontSize: '0.65rem',
  color: C.textMuted,
  marginBottom: 6,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
}

export const btn = (variant = 'primary') => {
  const variants = {
    primary: { background: C.maroon,      color: '#fff',    border: 'none' },
    outline: { background: 'transparent', color: C.maroon,  border: `1.5px solid ${C.maroon}` },
    ghost:   { background: C.gray1,       color: C.maroon,  border: `1px solid ${C.border}` },
  }
  const v = variants[variant] || variants.primary
  return {
    ...v,
    padding: '12px 28px',
    ...serif,
    fontSize: '1.05rem',
    fontWeight: 600,
    borderRadius: 4,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.15s',
    display: 'inline-block',
  }
}

export const cardStyle = {
  background: '#FFFFFF',
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: '2.25rem',
  boxShadow: '0 2px 16px rgba(122,30,30,0.06)',
}

// Decorative triple-dot divider — matches the logo tagline dots
export function DividerDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0.5rem 0 1.5rem' }}>
      <span style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ color: '#C69A4A', fontSize: 10, letterSpacing: 8 }}>◆ ◆ ◆</span>
      <span style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  )
}
