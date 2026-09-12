// Reassurance shown next to the file upload. Keep these promises true:
// Admin -> Orders has a button that deletes files 30 days after delivery.
export default function ConfidentialityNote() {
  return (
    <aside className="note-box">
      <p className="note-title">Your research stays yours</p>
      <ul>
        <li>Your file is kept in private storage and opened only to print your order.</li>
        <li>We never share, copy or reuse your work.</li>
        <li>Files are deleted 30 days after delivery. Want it sooner? WhatsApp us and we will do it within 48 hours.</li>
      </ul>
    </aside>
  )
}
