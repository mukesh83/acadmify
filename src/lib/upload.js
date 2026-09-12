// Uploads a file straight to Supabase Storage using a one-time signed URL
// from the backend. Uses XMLHttpRequest because fetch cannot report progress.
export function putFile(signedUrl, file, { contentType, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)
    xhr.setRequestHeader('Content-Type', contentType || file.type || 'application/octet-stream')
    xhr.setRequestHeader('x-upsert', 'true')
    xhr.timeout = 30 * 60 * 1000 // big files on slow connections
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error('The upload was refused (error ' + xhr.status + ').'))
    xhr.onerror = () => reject(new Error('The upload was interrupted. Please check your connection.'))
    xhr.ontimeout = () => reject(new Error('The upload took too long.'))
    xhr.send(file)
  })
}

export function pdfContentType(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name) ? 'application/pdf' : file.type
}
