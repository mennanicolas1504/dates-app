const SIGNED_URL_TTL_SECONDS = 3600
// Expira no cache um pouco antes da URL em si vencer, pra nunca servir uma
// signed URL que o Storage já rejeitaria.
const CACHE_TTL_MS = (SIGNED_URL_TTL_SECONDS - 300) * 1000

interface CacheEntry {
  url: string
  expiresAt: number
}

const cache = new Map<string, CacheEntry>();

function cacheKey(bucket: string, path: string): string {
  return `${bucket}/${path}`
}

export function getCachedSignedUrl(bucket: string, path: string): string | null {
  const entry = cache.get(cacheKey(bucket, path))
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    cache.delete(cacheKey(bucket, path))
    return null
  }
  return entry.url
}

export function setCachedSignedUrl(bucket: string, path: string, url: string): void {
  cache.set(cacheKey(bucket, path), { url, expiresAt: Date.now() + CACHE_TTL_MS })
}

export function invalidateSignedUrl(bucket: string, path: string): void {
  cache.delete(cacheKey(bucket, path))
}

export const SIGNED_URL_EXPIRES_IN = SIGNED_URL_TTL_SECONDS
