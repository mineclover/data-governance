import type { CatalogSnapshot } from '../catalog/types.js'

export type RelationshipCatalogGateContext = {
  scopeTables: ReadonlySet<string>
  catalogTables: ReadonlySet<string>
}

export function createRelationshipCatalogGateContext(input: {
  catalog: CatalogSnapshot
  scopeTables: readonly string[]
}): RelationshipCatalogGateContext {
  return {
    scopeTables: new Set(input.scopeTables),
    catalogTables: new Set(input.catalog.tables.map(table => table.table)),
  }
}

export function isRelationshipCatalogTableUsable(
  context: RelationshipCatalogGateContext,
  table: string | undefined,
): boolean {
  return Boolean(table && context.scopeTables.has(table) && context.catalogTables.has(table))
}
