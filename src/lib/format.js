// Indian-style money: 1234.5 -> "₹1,234.5"
export function rupees(n) {
  const v = Number(n) || 0
  return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many)

export function formatDate(value, withTime = false) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-IN', withTime
    ? { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatBytes(bytes) {
  if (!bytes) return ''
  return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB'
}
