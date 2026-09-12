// The four policy pages. Lines starting with "- " become bullet points.
// These describe how Acadmify actually works (WhatsApp confirmation, UPI or cash,
// Rapido rider paid on delivery). If anything changes, change it here.
// Working drafts, not legal advice.
export const POLICY_UPDATED = '12 September 2026'

export const POLICY_TITLES = {
  privacy: 'Privacy policy',
  terms: 'Terms & conditions',
  refund: 'Refunds & cancellation',
  shipping: 'Shipping & delivery',
}

export function getPolicy(which, { analytics = false, gstin = '' } = {}) {
  const operator =
    'Acadmify is a brand of Hari Om Graphics, Sector 19 Circle, Chopasni Housing Board, Jodhpur, Rajasthan 342008, India' +
    (gstin ? ' (GSTIN ' + gstin + ')' : '') + '. Contact: acadmify.support@gmail.com · +91 94600-46565.'

  const policies = {
    privacy: {
      description: 'How Acadmify collects, uses, stores and deletes your personal data and thesis files.',
      sections: [
        ['Who we are', [operator]],
        ['What we collect', [
          'When you place an order we collect your name, phone number, email address (if given), university or college, degree, delivery address (if you choose delivery), any notes you add, and the document you upload or link for printing.',
        ]],
        ['Why we collect it', [
          'Only to print, bind and deliver your order, to contact you about it, and to keep the records the law requires. We do not use your data for advertising and we do not sell it.',
        ]],
        ['Your documents', [
          'Uploaded files are kept in private, access-restricted storage and opened only to print your order. We do not read, copy, share, publish or reuse your work.',
          'We delete uploaded files 30 days after your order is delivered. Want it deleted sooner? Email or WhatsApp us and we will do it within 48 hours and confirm.',
          'If you share a link (for example Google Drive) instead of uploading, the file stays in your own account and you control who can open it.',
        ]],
        ['Payments', [
          'We agree payment with you on WhatsApp, by UPI or cash. This website does not collect card, UPI or bank details.',
        ]],
        ['Who else sees your data', [
          '- A Rapido rider sees your name, phone number and address when you choose doorstep delivery.',
          '- A courier company sees the same when you choose courier delivery outside Jodhpur.',
          '- Our hosting providers (Vercel, Render and Supabase) store data on our behalf.',
          '- WhatsApp (Meta) carries the messages you send us there.',
          analytics ? '- Google Analytics counts visits to this website (see Cookies below).' : null,
          'Nobody else, except where the law requires it.',
        ]],
        ['How long we keep things', [
          '- Uploaded documents: 30 days after delivery.',
          '- Order and billing records: 8 years, as Indian tax law requires.',
        ]],
        ['Your rights', [
          'Under the Digital Personal Data Protection Act, 2023, you may ask us to show you the personal data we hold about you, correct anything that is wrong, or erase it where we are not legally required to keep it. Write to acadmify.support@gmail.com and we will respond within 30 days.',
        ]],
        ['Cookies and similar technology', [
          analytics
            ? 'We use Google Analytics to count visits and see which pages are useful. It sets cookies and sees your approximate location and device type. We do not use advertising trackers.'
            : 'We do not use advertising or tracking cookies. The website stores a few settings in your browser (such as the prices and text it last loaded) so pages open faster.',
          'Our reviews section loads a widget from Elfsight to show our Google reviews, and videos load from YouTube only when you press play. These services have their own privacy policies.',
        ]],
        ['Changes', ['If we change this policy we will update the date at the top of this page.']],
        ['Grievances', ['Grievance Officer: Mukesh, Hari Om Graphics · acadmify.support@gmail.com · +91 94600-46565']],
      ],
    },

    terms: {
      description: 'The terms that apply when you order thesis printing and binding from Acadmify.',
      sections: [
        ['Who we are', [operator, 'By placing an order with Acadmify you agree to the following.']],
        ['What we do', [
          'We print and bind documents that you supply, and deliver them. Thesis orders are printed and hardbound, with gold or silver lettering on the cover and spine. We also offer thesis formatting as a separate paid service, and softbound binding for general books.',
          'We do not write or research your work, and we do not change its academic content. When you order formatting, we change only the layout and presentation of your document, as agreed with you on WhatsApp.',
        ]],
        ['What you confirm', [
          'You confirm that the document you send is your own work, or that you have the right to have it printed, and that printing it does not breach your institution’s rules or anyone’s copyright.',
        ]],
        ['Orders and prices', [
          'Prices are shown on this website and in your order summary, with GST shown separately. We confirm every order on WhatsApp before printing begins. If your file differs from the details you entered (for example a different page count), we will tell you the corrected price before you pay. A price we quote is valid for 7 days.',
        ]],
        ['Your file', [
          'Unless you order formatting, we print exactly the file you supply: we do not change page order, margins, fonts, page size or content. Please check your file carefully before sending it. If you order formatting, please check and approve the formatted version before we print. Reprints caused by errors in a file you supplied or approved are chargeable.',
        ]],
        ['Turnaround', [
          'Orders are usually ready in 24 to 48 hours after we confirm your order and payment. Large or complex orders can take longer, and we will tell you before you pay. Our shop is open every day, 5 PM to 11 PM.',
        ]],
        ['Payment', [
          'Full payment is required before printing begins. We share payment details on WhatsApp; you can pay by UPI or cash.',
        ]],
        ['Delivery', [
          'Pickup from our shop is free. For doorstep delivery in Jodhpur we book a Rapido rider, and you pay the rider’s fare on delivery. Courier delivery outside Jodhpur is quoted on WhatsApp. See our Shipping & delivery policy.',
        ]],
        ['Limits of our liability', [
          'If we make a printing or binding error, we will reprint the affected copies free of charge, or refund them. Our total liability for any order is limited to the amount you paid for that order. We are not liable for missed academic deadlines, and we strongly recommend you do not leave printing until the final day.',
        ]],
        ['Confidentiality', ['We treat every document you send us as confidential. Our Privacy policy explains exactly how we store and delete your files.']],
        ['Governing law', ['These terms are governed by the laws of India. Disputes are subject to the jurisdiction of the courts at Jodhpur, Rajasthan.']],
        ['Business name on payments', ['UPI payments to us may show our registered business name, HARI OM GRAPHICS.']],
      ],
    },

    refund: {
      description: 'When Acadmify cancels, reprints or refunds a thesis printing order, and how to ask.',
      sections: [
        ['Cancelling an order', [
          'Before printing has started: cancel by WhatsApp or phone for a full refund of anything you have paid, no questions asked.',
          'After printing has started: we cannot cancel, because printed and bound work cannot be resold. If we have not yet started, we will tell you honestly.',
        ]],
        ['When we refund in full', [
          '- We cancel your order for any reason.',
          '- We fail to have your order ready within the time we agreed and you no longer want it.',
          '- The printing or binding is defective and you would rather have your money back than a reprint.',
        ]],
        ['When we reprint instead', [
          'If there is a printing error, a binding defect, missing pages, or the wrong cover colour on our part, we will reprint the affected copies free of charge as fast as we can. This is usually faster and more useful to you than a refund.',
        ]],
        ['When we cannot refund', [
          '- The supplied file itself had errors (wrong version, missing chapters, bad formatting, wrong margins).',
          '- You changed your mind after printing was completed.',
          '- Delay was caused by an address or phone number that was wrong or unreachable.',
        ]],
        ['Delivery charges', [
          'For doorstep delivery the Rapido fare is paid by you directly to the rider, not to us. Courier charges are agreed with you on WhatsApp.',
        ]],
        ['How to ask', [
          'WhatsApp +91 94600-46565 within 48 hours of delivery or pickup, with your order number and a photo of the problem. We reply the same day.',
        ]],
        ['How refunds are paid', [
          'Approved refunds are paid back by UPI or bank transfer within 5 to 7 working days.',
        ]],
      ],
    },

    shipping: {
      description: 'Pickup, Rapido doorstep delivery in Jodhpur and courier delivery for Acadmify orders.',
      sections: [
        ['Pickup from our shop (free)', [
          'Collect your order from Sector 19 Circle, Chopasni Housing Board, Jodhpur. Open every day, 5 PM to 11 PM. We message you on WhatsApp when it is ready.',
        ]],
        ['Doorstep delivery in Jodhpur', [
          'We book a Rapido rider to bring your order to your door anywhere in Jodhpur, including IIT Jodhpur, AIIMS Jodhpur, JNVU, MBM University and FDDI. You pay the rider’s fare in cash on delivery.',
        ]],
        ['Outside Jodhpur', [
          'We send orders across India by courier. Charges depend on weight and destination and are quoted on WhatsApp before you pay. Allow 3 to 6 working days for courier transit.',
        ]],
        ['How long it takes', [
          'Orders are usually ready in 24 to 48 hours after we confirm your order and payment. Large orders (several copies, 400+ pages, or colour-heavy) can take longer, and we will tell you before you pay.',
        ]],
        ['Tracking', [
          'Your order number looks like ACD-2026-0012. Track it at acadmify.com/track with your order number and the last 4 digits of the phone number you ordered with. We also update you on WhatsApp.',
        ]],
        ['If delivery fails', [
          'If the rider cannot reach you on the phone number you gave, your order is held at our shop for collection for 15 days.',
        ]],
        ['Urgent orders', [
          'Need it urgently? WhatsApp us before ordering and we will tell you honestly what is possible.',
        ]],
      ],
    },
  }

  const policy = policies[which] || policies.privacy
  return {
    title: POLICY_TITLES[which] || POLICY_TITLES.privacy,
    description: policy.description,
    sections: policy.sections.map(([heading, lines]) => [heading, lines.filter(Boolean)]),
  }
}
