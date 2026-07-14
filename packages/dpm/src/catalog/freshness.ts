import { createHash } from 'node:crypto'

import type {
  CatalogSnapshot,
} from './snapshot-record-types.js'
import type {
  CatalogSnapshotInput,
} from './snapshot-input-types.js'

export function computeCatalogFreshnessHash(
  input: Omit<CatalogSnapshot, 'freshness'> | Omit<CatalogSnapshotInput, 'sourceVersionHash'>,
): string {
  return `sha256:${createHash('sha256').update(stableStringify(input)).digest('hex')}`
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value))
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value

  const record = value as Record<string, unknown>
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(record).sort()) {
    const next = record[key]
    if (next !== undefined) sorted[key] = sortValue(next)
  }
  return sorted
}
