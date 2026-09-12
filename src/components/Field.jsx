// Label + input + hint/error, wired together for screen readers.
// The input itself is passed as children and should use the same id.
export default function Field({ id, label, hint, error, optional = false, className = '', children }) {
  return (
    <div className={'field ' + className + (error ? ' has-error' : '')}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="hint" id={id + '-hint'}>{hint}</p>}
      {error && <p className="field-error" id={id + '-hint'} role="alert">{error}</p>}
    </div>
  )
}
