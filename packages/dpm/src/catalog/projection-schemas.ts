import type {
  CatalogSchema,
  CatalogTable,
} from './structure-types.js'

export function collectProjectionSchemas(tables: readonly CatalogTable[]): CatalogSchema[] {
  const names = new Map<string, CatalogSchema>()
  for (const table of tables) {
    if (!names.has(table.schema)) {
      names.set(table.schema, {
        name: table.schema,
      })
    }
  }
  return [...names.values()]
}
