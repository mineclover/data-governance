export function countBy<T, K extends string>(items: readonly T[], selector: (item: T) => K): Partial<Record<K, number>> {
  const counts: Partial<Record<K, number>> = {}
  for (const item of items) {
    const key = selector(item)
    counts[key] = (counts[key] ?? 0) + 1
  }
  return sortRecord(counts)
}

export function byId<T extends { id: string }>(left: T, right: T): number {
  return left.id.localeCompare(right.id)
}

function sortRecord<T extends Record<string, unknown>>(record: T): T {
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(record).sort()) sorted[key] = record[key]
  return sorted as T
}
