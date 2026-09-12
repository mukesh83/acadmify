// A tiny router built on the browser's History API (no library needed).
//   const { path, query, hash } = useLocation()
//   navigate('/upload')          <Link to="/track">Track</Link>
import { useMemo, useSyncExternalStore } from 'react'
import { prefersReducedMotion } from './util.js'

const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())
if (typeof window !== 'undefined') window.addEventListener('popstate', emit)

const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const currentHref = () => window.location.pathname + window.location.search + window.location.hash

export function useLocation() {
  const href = useSyncExternalStore(subscribe, currentHref)
  return useMemo(() => {
    const url = new URL(href, window.location.origin)
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname
    return { path, query: url.searchParams, hash: url.hash }
  }, [href])
}

// Scroll to an element id, or to the top of the page for 'top'.
export function scrollToTarget(target) {
  if (!target) return
  if (target !== 'top') {
    const el = document.getElementById(target)
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
      return
    }
  }
  window.scrollTo(0, 0)
}

export function navigate(to, { replace = false } = {}) {
  const url = new URL(to, window.location.href)
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href)
    return
  }
  const pageChanged = url.pathname !== window.location.pathname
  const next = url.pathname + url.search + url.hash
  if (next !== currentHref()) window.history[replace ? 'replaceState' : 'pushState'](null, '', next)
  emit()

  const target = url.hash ? decodeURIComponent(url.hash.slice(1)) : pageChanged ? 'top' : null
  // Wait two frames so the new page is on screen before scrolling
  requestAnimationFrame(() => requestAnimationFrame(() => scrollToTarget(target)))
}

export function Link({ to, onClick, target, children, ...rest }) {
  function handleClick(e) {
    if (onClick) onClick(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || target) return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={handleClick} target={target} {...rest}>
      {children}
    </a>
  )
}
