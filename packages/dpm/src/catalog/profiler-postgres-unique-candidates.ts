import type {
  CatalogIndex,
  CatalogPrimaryKey,
  CatalogUniqueCandidate,
} from './integrity-types.js'

export function primaryKeyToUniqueCandidate(primaryKey: CatalogPrimaryKey): CatalogUniqueCandidate {
  return {
    table: primaryKey.table,
    name: `${primaryKey.name}_unique_candidate`,
    columns: [...primaryKey.columns],
    reason: 'primary_key',
    confidence: 1,
    ...(primaryKey.source ? { source: primaryKey.source } : {}),
  }
}

export function indexToUniqueCandidate(index: CatalogIndex): CatalogUniqueCandidate {
  return {
    table: index.table,
    name: `${index.name}_unique_candidate`,
    columns: [...index.columns],
    reason: 'unique_index',
    confidence: 1,
    ...(index.source ? { source: index.source } : {}),
  }
}
