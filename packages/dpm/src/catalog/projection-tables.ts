import type {
  OpenApiProjectionResult,
  SchemaSourceCoordinate,
} from '../contract/openapi-projection.js'

import type {
  CatalogTable,
} from './structure-types.js'
import { catalogTableFromProjectionSource } from './projection-source-table.js'

export { collectProjectionSchemas } from './projection-schemas.js'

export function collectProjectionTables(
  projection: OpenApiProjectionResult<Record<string, unknown>>,
): CatalogTable[] {
  const byTable = new Map<string, CatalogTable>()

  for (const source of Object.values(projection.sources)) {
    addTableFromSource(source, byTable)
  }

  for (const target of projection.typeTargets ?? []) {
    if (target.source) addTableFromSource(target.source, byTable)
  }

  return [...byTable.values()]
}

function addTableFromSource(
  source: SchemaSourceCoordinate,
  byTable: Map<string, CatalogTable>,
): void {
  const table = catalogTableFromProjectionSource(source)
  if (!table) return
  if (byTable.has(table.table)) return

  byTable.set(table.table, table)
}
