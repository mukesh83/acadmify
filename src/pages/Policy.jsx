import { Link } from '../lib/router.jsx'
import { usePageMeta } from '../lib/seo.js'
import { useContent } from '../lib/content.jsx'
import { analyticsEnabled } from '../lib/analytics.js'
import { getPolicy, POLICY_TITLES, POLICY_UPDATED } from './policies.js'

// Groups consecutive "- " lines into one bullet list
function Lines({ lines }) {
  const blocks = []
  for (const line of lines) {
    if (line.startsWith('- ')) {
      const last = blocks[blocks.length - 1]
      if (last && Array.isArray(last)) last.push(line.slice(2))
      else blocks.push([line.slice(2)])
    } else {
      blocks.push(line)
    }
  }
  return blocks.map((b, i) =>
    Array.isArray(b)
      ? <ul key={i}>{b.map((item) => <li key={item}>{item}</li>)}</ul>
      : <p key={i}>{b}</p>
  )
}

export default function Policy({ which }) {
  const c = useContent()
  const policy = getPolicy(which, { analytics: analyticsEnabled, gstin: c('gstin') })

  usePageMeta({ title: policy.title + ' — Acadmify', description: policy.description, path: '/' + which })

  return (
    <div className="page page-narrow">
      <article className="prose">
        <h1>{policy.title}</h1>
        <p className="hint">Last updated {POLICY_UPDATED} · Acadmify, a brand of Hari Om Graphics, Jodhpur</p>
        {policy.sections.map(([heading, lines]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <Lines lines={lines} />
          </section>
        ))}
        <hr />
        <p>
          Questions about this policy? Email <a href={'mailto:' + c('contact_email')}>{c('contact_email')}</a> or
          WhatsApp {c('contact_phone')}.
        </p>
        <nav aria-label="Other policies" className="policy-nav">
          {Object.entries(POLICY_TITLES).filter(([key]) => key !== which).map(([key, title]) => (
            <Link key={key} to={'/' + key}>{title}</Link>
          ))}
        </nav>
      </article>
    </div>
  )
}
