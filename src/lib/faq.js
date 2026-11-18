// FAQ text, built from the live prices so the answers can never go out of date.
// The same items feed the visible FAQ and the FAQ structured data for Google.
import { calcQuote } from './pricing-core.js'
import { rupees } from './format.js'

export function buildFaq(p, c) {
  const example = calcQuote({ totalPages: 200, copies: p.min_copies, binding: 'hardbound' }, p)
  const gst = p.gst_rate > 0 ? ', and ' + p.gst_rate + '% GST is added' : ''
  const exampleSum = p.gst_rate > 0
    ? rupees(example.subtotal) + ' + ' + rupees(example.gst) + ' GST = ' + rupees(example.total)
    : rupees(example.total)

  const items = [
    {
      q: 'How much does thesis printing and hardbound binding cost?',
      a: 'Printing is ' + rupees(p.print_per_page) + ' per page, colour or black & white, on 100 gsm paper. Hardbound binding is ' +
        rupees(p.hard_binding) + ' per copy and softbound binding is ' + rupees(p.soft_binding) + ' per copy' + gst +
        '. These prices apply to theses of ' + p.min_pages + ' or more pages and ' + p.min_copies + ' or more copies. ' +
        'For example, a 200-page thesis in ' + p.min_copies + ' hardbound copies costs ' + exampleSum + '. For smaller orders, message us for a price.',
    },
    {
      q: 'How long does it take?',
      a: 'Usually ready in 24–48 hours after your payment is received. Large or colour-heavy orders can take longer. ' +
        'For an urgent job, message us on WhatsApp before you order.',
    },
    {
      q: 'Do you deliver? What does delivery cost?',
      a: 'Yes, anywhere in Jodhpur, including IIT Jodhpur, AIIMS Jodhpur, JNVU, MBM University and FDDI. We book a Rapido rider ' +
        'and you pay the rider’s fare when your thesis arrives. Pickup from our shop at Sector 19, Chopasni Housing Board is free. ' +
        'Outside Jodhpur we send by courier; ask for a quote on WhatsApp.',
    },
    {
      q: 'When is the shop open?',
      a: c('contact_hours') + '. You can place an order on this website at any time.',
    },
    {
      q: 'Is my thesis kept confidential?',
      a: 'Yes. Your file is kept in private, access-restricted storage and opened only to print your order. We never share or ' +
        'reuse your work, and we delete files 30 days after delivery, or sooner if you ask.',
    },
    {
      q: 'What paper, cover colours and lettering do you offer?',
      a: 'We print on ' + c('paper_spec') + '. Covers come in maroon, black, navy blue, light blue, orange, red, or a laminated colour-printed cover made from your design, ' +
        'with gold, silver or black lettering on the cover and spine.',
    },
    p.formatting_fee > 0 ? {
      q: 'Do you format theses?',
      a: 'Yes. Thesis formatting is ' + rupees(p.formatting_fee) + ' per thesis, and we need your Word file. Tick “Format my thesis” when you order, ' +
        'or ask on WhatsApp. We never write or change the academic content of your work.',
    } : null,
    {
      q: 'My file is bigger than 50 MB. What do I do?',
      a: 'On the order page, paste a Google Drive (or similar) link instead of uploading the file, or send the file to us on WhatsApp.',
    },
    {
      q: 'How do I pay?',
      a: 'Online, when you place your order: UPI, debit or credit card, net banking or wallet, through Razorpay\'s secure checkout. ' +
        'Payment is required to confirm your order, and printing starts once it is received. If you could not pay at the time, ' +
        'use the Track page to pay later. If your file turns out to need a different page count, we settle the difference on WhatsApp.',
    },
  ]

  return items.filter(Boolean)
}

export function faqJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}
