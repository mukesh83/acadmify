// Google Analytics 4 — switched on only when VITE_GA_ID is set in Vercel.
// No ID = no Google script is loaded at all.
const GA_ID = import.meta.env.VITE_GA_ID || ''

export const analyticsEnabled = Boolean(GA_ID)

let started = false

export function initAnalytics() {
  if (!GA_ID || started) return
  started = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID)
  document.head.appendChild(s)
}

export function trackPage(path, title) {
  if (!GA_ID) return
  initAnalytics()
  window.gtag('event', 'page_view', { page_path: path, page_title: title, page_location: window.location.href })
}

export function trackEvent(name, params) {
  if (!GA_ID) return
  initAnalytics()
  window.gtag('event', name, params || {})
}
