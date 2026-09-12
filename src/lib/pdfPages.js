// Counts the pages in a PDF on the visitor's own device (nothing is uploaded).
// pdf-lib is large, so it is only downloaded when someone picks a file.
export async function countPdfPages(file) {
  try {
    const { PDFDocument } = await import('pdf-lib')
    const bytes = await file.arrayBuffer()
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false, throwOnInvalidObject: false })
    const n = doc.getPageCount()
    return n > 0 ? n : null
  } catch {
    return null // unreadable or protected PDF: the customer types the count instead
  }
}
