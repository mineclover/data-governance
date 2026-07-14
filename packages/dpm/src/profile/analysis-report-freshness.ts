import { createHash } from 'node:crypto'

import type { DpmProfileAnalysisReport } from './analysis-report-types.js'

export function computeDpmProfileAnalysisReportHash(
  input: Omit<DpmProfileAnalysisReport, 'freshness'>,
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
