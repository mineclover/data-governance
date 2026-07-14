import type {
  CatalogForeignKey,
  CatalogIndex,
  CatalogPrimaryKey,
  CatalogUniqueCandidate,
} from './integrity-types.js'
import { copySourceCoordinate } from './snapshot-source-copy.js'

export function copyPrimaryKey(primaryKey: CatalogPrimaryKey): CatalogPrimaryKey {
  return {
    table: primaryKey.table,
    name: primaryKey.name,
    columns: [...primaryKey.columns],
    ...(primaryKey.source ? { source: copySourceCoordinate(primaryKey.source) } : {}),
  }
}

export function copyForeignKey(foreignKey: CatalogForeignKey): CatalogForeignKey {
  return {
    table: foreignKey.table,
    name: foreignKey.name,
    columns: [...foreignKey.columns],
    referencedTable: foreignKey.referencedTable,
    referencedColumns: [...foreignKey.referencedColumns],
    enforced: foreignKey.enforced,
    ...(foreignKey.onDelete ? { onDelete: foreignKey.onDelete } : {}),
    ...(foreignKey.onUpdate ? { onUpdate: foreignKey.onUpdate } : {}),
    ...(foreignKey.source ? { source: copySourceCoordinate(foreignKey.source) } : {}),
  }
}

export function copyIndex(index: CatalogIndex): CatalogIndex {
  return {
    table: index.table,
    name: index.name,
    columns: [...index.columns],
    unique: index.unique,
    ...(index.method ? { method: index.method } : {}),
    ...(index.predicate ? { predicate: index.predicate } : {}),
    ...(index.source ? { source: copySourceCoordinate(index.source) } : {}),
  }
}

export function copyUniqueCandidate(candidate: CatalogUniqueCandidate): CatalogUniqueCandidate {
  return {
    table: candidate.table,
    name: candidate.name,
    columns: [...candidate.columns],
    reason: candidate.reason,
    confidence: candidate.confidence,
    ...(candidate.source ? { source: copySourceCoordinate(candidate.source) } : {}),
  }
}
