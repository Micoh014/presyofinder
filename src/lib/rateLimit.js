const timestamps = {}

export function isRateLimited(key, limitMs = 1000) {
  const now = Date.now()
  const last = timestamps[key] || 0
  if (now - last < limitMs) return true
  timestamps[key] = now
  return false
}