export default function FAQ({ items }) {
  return (
    <section id="faq" className="section section-alt" aria-labelledby="faq-title">
      <div className="container narrow">
        <div className="section-head">
          <h2 id="faq-title">Questions scholars ask</h2>
        </div>
        <div className="faq-list">
          {items.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
