export function isHoneypotTripped(payload: { website?: unknown }): boolean {
  return typeof payload.website === 'string' && payload.website.trim().length > 0
}

export function isTooFast(renderedAt: unknown, now: number, minMs = 2000): boolean {
  const t = Number(renderedAt)
  if (!Number.isFinite(t)) return true
  const elapsed = now - t
  if (elapsed < 0) return false // rozjazd zegara — nie karzemy
  return elapsed < minMs
}

const hits = new Map<string, number[]>()

export function rateLimit(
  ip: string,
  now: number,
  limit = 5,
  windowMs = 60_000,
): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length <= limit
}

export function _resetRateLimit(): void {
  hits.clear()
}
