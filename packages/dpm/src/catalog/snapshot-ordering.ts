import type {
  CatalogColumn,
  CatalogSchema,
  CatalogTable,
} from './structure-types.js'
import type { CatalogDiagnostic } from './diagnostic-types.js'

export function bySchema(left: CatalogSchema, right: CatalogSchema): number {
  return left.name.localeCompare(right.name)
}

export function byTable(left: CatalogTable, right: CatalogTable): number {
  return left.table.localeCompare(right.table)
}

export function byColumn(left: CatalogColumn, right: CatalogColumn): number {
  return `${left.table}.${left.ordinal}.${left.name}`.localeCompare(`${right.table}.${right.ordinal}.${right.name}`)
}

export function byTableName<T extends { table: string; name: string }>(left: T, right: T): number {
  return `${left.table}.${left.name}`.localeCompare(`${right.table}.${right.name}`)
}

export function byDiagnostic(left: CatalogDiagnostic, right: CatalogDiagnostic): number {
  return `${left.severity}.${left.code}.${left.message}`.localeCompare(`${right.severity}.${right.code}.${right.message}`)
}
