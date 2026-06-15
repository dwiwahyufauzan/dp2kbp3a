/**
 * Sanitasi string dari tag HTML berbahaya, script, dan javascript URI.
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return input
  
  // Hapus tag script beserta kontennya secara rekursif
  let clean = input.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
  
  // Hapus event handlers (onload, onerror, onclick, dsb.)
  clean = clean.replace(/on\w+\s*=\s*(['"])(.*?)\1/gi, '')
  clean = clean.replace(/on\w+\s*=\s*([^\s>]+)/gi, '')
  
  // Hapus javascript: uris
  clean = clean.replace(/javascript\s*:\s*([^\s>]+)/gi, '')
  
  return clean.trim()
}

/**
 * Menelusuri object secara mendalam untuk mensanitasi setiap properti string.
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj

  // Hindari memproses File, Buffer, atau instances khusus lainnya
  if (
    obj instanceof Blob || 
    (typeof File !== 'undefined' && obj instanceof File) ||
    (typeof Buffer !== 'undefined' && Buffer.isBuffer(obj)) ||
    obj instanceof Date
  ) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T
  }

  const result = {} as any
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = (obj as any)[key]
      if (typeof val === 'string') {
        result[key] = sanitizeHTML(val)
      } else if (typeof val === 'object' && val !== null) {
        result[key] = sanitizeObject(val)
      } else {
        result[key] = val
      }
    }
  }
  return result as T
}
