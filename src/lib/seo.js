// Per-page title, description and canonical link (the site is a single-page app,
// so these are updated when the page changes).
import { useEffect } from 'react'
import { trackPage } from './analytics.js'

export const SITE_URL = 'https://acadmify.com'

function setMeta(attr, name, content) {
  let el = document.head.querySelector('meta[' + attr + '="' + name + '"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta({ title, description, path, noindex = false }) {
  useEffect(() => {
    document.title = title
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
    }
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:url', SITE_URL + path)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = SITE_URL + path

    if (!noindex) trackPage(path, title)
  }, [title, description, path, noindex])
}

// Adds (or removes, when data is null) a JSON-LD block in <head>
export function setJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!data) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}
