interface CacheEntry<T> {
  value: T
  expireAt: number
}

const cacheStore = new Map<string, CacheEntry<any>>()

/**
 * Mendapatkan nilai dari cache berdasarkan key. 
 * Mengembalikan null jika key tidak ditemukan atau sudah kadaluarsa.
 */
export function getCache<T>(key: string): T | null {
  const entry = cacheStore.get(key)
  if (!entry) return null
  
  if (entry.expireAt < Date.now()) {
    cacheStore.delete(key)
    return null
  }
  
  return entry.value
}

/**
 * Menyimpan nilai ke dalam cache dengan key tertentu dan durasi waktu hidup (TTL).
 */
export function setCache<T>(key: string, value: T, ttlMs: number = 5 * 60_000): void {
  cacheStore.set(key, {
    value,
    expireAt: Date.now() + ttlMs
  })
}

/**
 * Menghapus cache berdasarkan key spesifik.
 */
export function clearCache(key: string): void {
  cacheStore.delete(key)
}

/**
 * Menghapus semua cache yang diawali dengan prefix tertentu (misal 'stats:').
 */
export function clearCachePattern(pattern: string): void {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(pattern)) {
      cacheStore.delete(key)
    }
  }
}

/**
 * Mengosongkan seluruh cache store.
 */
export function clearAllCache(): void {
  cacheStore.clear()
}
