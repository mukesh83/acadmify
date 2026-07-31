// ============================================================================
// src/components/Policies.jsx
// All four policy pages Razorpay requires, in one file.
//
// Usage in App.jsx:
//    {page === 'privacy'  && <Policies which="privacy"  />}
//    {page === 'terms'    && <Policies which="terms"    />}
//    {page === 'refund'   && <Policies which="refund"   />}
//    {page === 'shipping' && <Policies which="shipping" />}
//
// BEFORE YOU DEPLOY: read every line and change anything that does not match
// how you actually operate. Replace [DATE] with today's date in all four.
// These are working drafts, not legal advice.
// ============================================================================

import { C, BUSINESS } from '../constants'

const UPDATED = '[DATE]'

const PRIVACY = `Last updated: ` + UPDATED + `

Acadmify is a brand operated by Hari Om Graphics, Sector 19 Circle,
Chopasni Housing Board, Jodhpur, Rajasthan 342008, India.
Contact: acadmify.support@gmail.com | +91 94600-46565

WHAT WE COLLECT
When you place an order we collect your name, phone number, email address
(if given), university or college name, delivery address, and the thesis or
project document you upload for printing.

WHY WE COLLECT IT
Solely to print, bind and deliver your order, to contact you about that
order, and to keep the tax records the law requires us to keep. We do not
use your data for advertising, and we do not sell it.

YOUR DOCUMENTS
Your uploaded document is stored in encrypted, access-restricted storage.
It is opened only for the purpose of printing your order. We do not read,
copy, share, publish or reuse the content of your work in any way. We
permanently delete uploaded files 30 days after your order is delivered.
If you want your file deleted sooner, email or WhatsApp us and we will do
it within 48 hours and confirm.

WHO ELSE SEES YOUR DATA
- Our payment gateway, Razorpay, processes your payment. We never see or
  store your card, UPI or bank details.
- Our delivery staff see your name, phone number and address only.
- Our hosting providers (Vercel, Render, Supabase) store data on our behalf
  under their own security obligations.
Nobody else. We do not share your data with any other third party except
where the law requires it.

HOW LONG WE KEEP THINGS
Uploaded documents: 30 days after delivery.
Order and billing records: 8 years, as required under Indian tax law.

YOUR RIGHTS
Under the Digital Personal Data Protection Act, 2023, you may ask us to
show you the personal data we hold about you, correct anything that is
wrong, or erase it where we are not legally required to keep it. Write to
acadmify.support@gmail.com and we will respond within 30 days.

COOKIES
We use only what is necessary to make the website work, plus basic
anonymous visit statistics. We do not use advertising trackers.

CHANGES
If we change this policy we will update the date at the top of this page.

GRIEVANCES
Grievance Officer: Mukesh, Hari Om Graphics
acadmify.support@gmail.com | +91 94600-46565`

const TERMS = `Last updated: ` + UPDATED + `

By placing an order with Acadmify (operated by Hari Om Graphics, Jodhpur),
you agree to the following.

WHAT WE DO
We print and hardbind academic documents that you supply to us, and deliver
them. We are a printing and binding service. We do not write, research,
edit, format, proofread or otherwise contribute to the academic content of
your work.

WHAT YOU CONFIRM
You confirm that the document you upload is your own work, or that you have
the right to have it printed, and that printing it does not breach your
institution's rules or anyone's copyright.

ORDERS AND PRICING
Prices are shown on the website and in your quotation. Prices are exclusive
of GST unless stated otherwise. A quotation is valid for 7 days. We confirm
every order over WhatsApp before printing begins.

PROOFING
We print exactly the file you supply. We do not alter page order, margins,
fonts, page size or content. Please check your file carefully before
uploading. Reprints caused by errors in the supplied file are chargeable.

TURNAROUND
We aim to deliver within 24 to 48 hours of payment confirmation for standard
orders in Jodhpur city. Large or complex orders may take longer and we will
tell you before you pay.

PAYMENT
Full payment is required before printing begins.

LIMITS OF OUR LIABILITY
If we make a printing or binding error, we will reprint the affected copies
free of charge, or refund them. Our total liability for any order is limited
to the amount you paid for that order. We are not liable for missed academic
deadlines, and we strongly recommend you do not leave printing until the
final day.

CONFIDENTIALITY
We treat every document you send us as confidential. See our Privacy Policy
for exactly how we store and delete your files.

GOVERNING LAW
These terms are governed by the laws of India. Disputes are subject to the
jurisdiction of the courts at Jodhpur, Rajasthan.

PAYMENT DESCRIPTOR
Payments to Acadmify appear on your bank or card statement as
HARI OM GRAPHICS, which is our registered business name.`

const REFUND = `Last updated: ` + UPDATED + `

CANCELLING AN ORDER
Before printing has started: cancel by WhatsApp or phone for a full refund,
no questions asked.
After printing has started: we cannot cancel, because printed and bound work
cannot be resold. If we have not yet started, we will tell you honestly.

WHEN WE REFUND IN FULL
- We cancel your order for any reason.
- We fail to deliver within the agreed timeline and you no longer want the
  order.
- The printing or binding is defective and you would rather have your money
  back than a reprint.

WHEN WE REPRINT INSTEAD
If there is a printing error, a binding defect, missing pages, or the wrong
cover colour on our part, we will reprint the affected copies free of charge
and deliver them as fast as we can. This is usually faster and more useful
to you than a refund.

WHEN WE CANNOT REFUND
- The supplied file itself had errors (wrong version, missing chapters, bad
  formatting, wrong margins).
- You changed your mind after printing was completed.
- Delay was caused by an address or phone number that was wrong or
  unreachable.

HOW TO CLAIM
WhatsApp +91 94600-46565 within 48 hours of delivery with your order number
and a photo of the problem. We respond the same day.

HOW LONG REFUNDS TAKE
Approved refunds are sent back to your original payment method within 5 to 7
working days. Your bank may take a further 2 to 3 days to show it.`

const SHIPPING = `Last updated: ` + UPDATED + `

WHERE WE DELIVER
Free doorstep delivery anywhere within Jodhpur city limits, including
IIT Jodhpur, AIIMS Jodhpur, JNVU, MBM University and FDDI campuses.

Outside Jodhpur, we ship across India by courier. Charges are quoted before
you pay and depend on weight and destination.

HOW LONG IT TAKES
Standard orders within Jodhpur: 24 to 48 hours from payment confirmation.
Large orders (multiple copies, 400+ pages, or colour-heavy): 2 to 4 days.
We will tell you the timeline before you pay.
Outside Jodhpur: add 3 to 6 working days for courier transit.

DELIVERY CHARGES
Within Jodhpur: free on orders of Rs. 300 and above; Rs. 50 below that.
Outside Jodhpur: quoted individually.

TRACKING
You get an order number in the format ACD-YYYY-NNN. Track it at
acadmify.com/track using your order number and the last four digits of the
phone number you ordered with. We also send WhatsApp updates at each stage.

IF DELIVERY FAILS
We attempt delivery twice. If we cannot reach you on the phone number you
supplied, your order is held at our Chopasni Housing Board shop for
collection for 15 days.

URGENT ORDERS
Same-day delivery within Jodhpur may be possible for an additional charge.
WhatsApp us before ordering to check.`

const POLICIES = {
  privacy:  { title: 'Privacy Policy',                body: PRIVACY  },
  terms:    { title: 'Terms & Conditions',            body: TERMS    },
  refund:   { title: 'Refund & Cancellation Policy',  body: REFUND   },
  shipping: { title: 'Shipping & Delivery Policy',    body: SHIPPING },
}

export default function Policies({ which }) {
  const doc = POLICIES[which] || POLICIES.privacy

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px' }}>
      <h1 style={{ color: C.maroon, fontSize: 30, margin: '0 0 8px' }}>
        {doc.title}
      </h1>
      <p style={{ color: C.textMuted, fontSize: 14, margin: '0 0 34px' }}>
        {BUSINESS.brand} &mdash; a brand of {BUSINESS.legalName}, Jodhpur
      </p>

      <div style={{
        whiteSpace: 'pre-wrap',
        lineHeight: 1.75,
        color: C.textBody,
        fontSize: 16,
      }}>
        {doc.body}
      </div>

      <p style={{
        marginTop: 44,
        paddingTop: 20,
        borderTop: '1px solid ' + C.gray3,
        color: C.textMuted,
        fontSize: 14,
      }}>
        Questions about this policy? Email {BUSINESS.email} or
        WhatsApp {BUSINESS.phone}.
      </p>
    </div>
  )
}
