/**
 * Simple in-memory rate limiter untuk login endpoint.
 * Batas: maksimal 5 percobaan per IP per menit.
 * Data dibersihkan otomatis setiap menit.
 */

interface RateEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateEntry>()
const WINDOW_MS = 60_000   // 1 menit
const MAX_ATTEMPTS = 5

// Bersihkan entry yang sudah kadaluarsa setiap 5 menit
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60_000)

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  let entry = store.get(ip)

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + WINDOW_MS }
    store.set(ip, entry)
    return { allowed: true, retryAfterSec: 0 }
  }

  entry.count++
  if (entry.count > MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfterSec }
  }

  return { allowed: true, retryAfterSec: 0 }
}

/** Dapatkan IP dari request Elysia (mendukung proxy) */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP
  return 'unknown'
}
