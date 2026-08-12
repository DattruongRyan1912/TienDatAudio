const WINDOW_MS = 5 * 60 * 1000
const MAX_REQUESTS = 12
const buckets = new Map<string, { count: number; resetAt: number }>()

export function consumeAssistantRateLimit(key: string) {
  const now = Date.now()
  if (buckets.size > 2000) {
    for (const [bucketKey, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(bucketKey)
  }
  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    const resetAt = now + WINDOW_MS
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, retryAfter: 0 }
  }
  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
  }
  current.count += 1
  return { allowed: true, retryAfter: 0 }
}
