import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import {
  asString,
} from './value-utils.js'

export function validateSafetyColumnUniquenessGates(
  columns: readonly Record<string, unknown>[],
): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []
  const firstIndexByCoordinate = new Map<string, number>()

  columns.forEach((column, index) => {
    const table = asString(column.table)
    const columnName = asString(column.column)
    if (!table || !columnName) return

    const coordinate = JSON.stringify([table, columnName])
    const firstIndex = firstIndexByCoordinate.get(coordinate)
    if (firstIndex === undefined) {
      firstIndexByCoordinate.set(coordinate, index)
      return
    }

    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'SAF013',
      message: `Column policy ${table}.${columnName} duplicates /columns/${firstIndex}; `
        + 'each (table, column) coordinate must have exactly one policy.',
      sourcePointer: `/columns/${index}`,
      catalogCoordinate: {
        table,
        column: columnName,
      },
    }))
  })

  return diagnostics
}
