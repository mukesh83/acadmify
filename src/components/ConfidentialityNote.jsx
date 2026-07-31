// ============================================================================
// src/components/ConfidentialityNote.jsx
// Put this directly above the file upload box on the Upload page, and again
// in the "Why Choose Acadmify" section on the homepage.
//
// This addresses the single biggest reason a PhD scholar hesitates:
// "will my unpublished work leak?"
//
// ONLY SHIP THIS ONCE YOU ACTUALLY DELETE FILES AT 30 DAYS.
// A promise you do not keep is worse than no promise. Set a monthly phone
// reminder: Supabase -> Storage -> thesis-pdfs -> sort by date -> delete
// anything older than 30 days.
// ============================================================================

import { C } from '../constants'

export default function ConfidentialityNote({ compact = false }) {
  return (
    <div style={{
      background: C.gray1,
      border: '1px solid ' + C.gray3,
      borderLeft: '3px solid ' + C.maroon,
      padding: compact ? '14px 16px' : '18px 20px',
      marginBottom: 24,
    }}>
      <div style={{
        fontWeight: 600,
        color: C.maroon,
        marginBottom: 8,
        fontSize: compact ? 15 : 16,
      }}>
        Your research stays yours
      </div>
      <ul style={{
        margin: 0,
        paddingLeft: 18,
        color: C.textBody,
        fontSize: 14,
        lineHeight: 1.8,
      }}>
        <li>Your file is stored encrypted and opened only to print your order.</li>
        <li>We never read, copy, share or reuse your work.</li>
        <li>Files are permanently deleted 30 days after delivery.</li>
        <li>Want it deleted sooner? WhatsApp us and it is done within 48 hours.</li>
      </ul>
    </div>
  )
}
