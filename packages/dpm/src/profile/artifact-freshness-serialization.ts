export function stableDpmProfileFreshnessStringify(value: unknown): string {
  return JSON.stringify(sortDpmProfileFreshnessValue(value))
}

function sortDpmProfileFreshnessValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDpmProfileFreshnessValue)
  if (!value || typeof value !== 'object') return value

  const record = value as Record<string, unknown>
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(record).sort()) {
    const next = record[key]
    if (next !== undefined) sorted[key] = sortDpmProfileFreshnessValue(next)
  }
  return sorted
}
