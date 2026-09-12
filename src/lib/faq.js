// FAQ text, built from the live prices so the answers can never go out of date.
// The same items feed the visible FAQ and the FAQ structured data for Google.
import { calcQuote } from './pricing-core.js'
import { rupees } from './format.js'

export function buildFaq(p, c) {
  const example = calcQuote({ totalPages: 200, copies: 1 }, p)
  const gst = p.gst_rate > 0 ? ', and ' + p.gst_rate + '% GST is added' : ''
  const exampleSum = p.gst_rate > 0
    ? rupees(example.subtotal) + ' + ' + rupees(example.gst) + ' GST = ' + rupees(example.total)
    : rupees(example.total)

  const items = [
    {
      q: 'How much does thesis printing and hardbound binding cost?',
      a: 'Black & white printing is ' + rupees(p.bw_per_page) + ' per page and colour is ' + rupees(p.color_per_page) +
        ' per page (' + rupees(p.colour_bulk_rate) + ' per page when you print more than ' + p.colour_bulk_above +
        ' colour pages in total across all copies). Hardbound binding is ' + rupees(p.hard_binding) + ' per copy' + gst +
        '. For example, a 200-page black & white thesis, one copy, costs ' + exampleSum + '.',
    },
    {
      q: 'How long does it take?',
      a: 'Usually ready in 24–48 hours after we confirm your order and payment. Large or colour-heavy orders can take longer, ' +
        'and we will tell you before you pay. For an urgent job, message us on WhatsApp first.',
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
      a: 'We print on ' + c('paper_spec') + '. Hardbound covers come in twelve colours: maroon, navy, black, forest green, ' +
        'brown, royal blue, pink, orange, purple, teal, grey and wine, with gold or silver lettering on the cover and spine.',
    },
    p.formatting_fee > 0 ? {
      q: 'Do you format theses?',
      a: 'Yes. Thesis formatting is ' + rupees(p.formatting_fee) + ' per thesis. Tick “Format my thesis” when you order, or ask on ' +
        'WhatsApp, and we will agree the details with you. We never write or change the academic content of your work.',
    } : null,
    {
      q: 'My PDF is bigger than 50 MB. What do I do?',
      a: 'On the upload page, paste a Google Drive (or similar) link instead of uploading the file, or send the file to us on WhatsApp.',
    },
    {
      q: 'How do I pay?',
      a: 'After you order, we check your file and share payment details on WhatsApp (UPI or cash). Printing starts once payment is confirmed.',
    },
  ]

  if (p.softbound_enabled) {
    items.push({
      q: 'Do you bind books too?',
      a: 'Yes. Softbound book binding for general books (not theses) is ' + rupees(p.soft_binding) +
        ' per copy. Bring or send us the pages and we will confirm on WhatsApp.',
    })
  }

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
