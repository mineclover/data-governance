import { readDpmCliStructuredFile } from './input-file.js'

export function readDpmCliEstimatedRows(path: string): Record<string, number> {
  const raw = readDpmCliStructuredFile(path)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('--estimated-rows must point to an object file')
  }
  const rows: Record<string, number> = {}
  for (const [table, count] of Object.entries(raw)) {
    if (typeof count !== 'number') {
      throw new Error(`estimated row count for ${table} must be a number`)
    }
    rows[table] = count
  }
  return rows
}
