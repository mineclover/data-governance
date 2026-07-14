import type {
  CatalogForeignKey,
  CatalogPrimaryKey,
  CatalogSnapshot,
  CatalogUniqueCandidate,
} from '../catalog/types.js'
import type { DiscoveryEvidence } from './discovery-evidence-types.js'
import type { RelationshipCandidateInput } from './discovery-relationship-candidate-types.js'
import type { RelationshipDiscoveryReport } from './discovery-report-types.js'
import type { DiscoveryThresholds } from './discovery-threshold-types.js'
import { createRelationshipDiscoveryReport } from './report-builder.js'

export type RelationshipDiscoveryCatalogInput = {
  datasetId: string
  catalog: CatalogSnapshot
  includedTables?: readonly string[]
  generatedAt?: string
  thresholds?: Partial<DiscoveryThresholds>
}

export function createRelationshipDiscoveryReportFromCatalog(
  input: RelationshipDiscoveryCatalogInput,
): RelationshipDiscoveryReport {
  return createRelationshipDiscoveryReport({
    datasetId: input.datasetId,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    ...(input.thresholds ? { thresholds: input.thresholds } : {}),
    candidates: input.catalog.foreignKeys
      .filter(foreignKey => isIncludedForeignKey(foreignKey, input.includedTables))
      .map(foreignKey => createForeignKeyRelationshipCandidate(input.catalog, foreignKey)),
  })
}

function createForeignKeyRelationshipCandidate(
  catalog: CatalogSnapshot,
  foreignKey: CatalogForeignKey,
): RelationshipCandidateInput {
  const parentUniqueEvidence = findParentUniqueEvidence(catalog, foreignKey)
  const sameColumnCount = foreignKey.columns.length === foreignKey.referencedColumns.length
  const confidenceScore = sameColumnCount && parentUniqueEvidence
    ? foreignKey.enforced ? 0.998 : 0.95
    : 0.88
  const warnings = [
    ...(!foreignKey.enforced ? ['unenforced-foreign-key'] : []),
    ...(!parentUniqueEvidence ? ['missing-parent-unique-candidate'] : []),
  ]

  return {
    id: `candidate:fk:${toIdentifier(foreignKey.table)}:${toIdentifier(foreignKey.name)}`,
    relationshipName: `rel_${toIdentifier(foreignKey.name.replace(/_fkey$/, ''))}`,
    type: 'one_to_many',
    parent: {
      table: foreignKey.referencedTable,
      columns: [...foreignKey.referencedColumns],
    },
    child: {
      table: foreignKey.table,
      columns: [...foreignKey.columns],
    },
    confidenceScore,
    evidence: [
      createForeignKeyEvidence(catalog, foreignKey),
      createColumnSimilarityEvidence(catalog, foreignKey, sameColumnCount),
      ...(parentUniqueEvidence ? [parentUniqueEvidence] : []),
    ],
    ...(warnings.length > 0 ? { warnings } : {}),
  }
}

function createForeignKeyEvidence(
  catalog: CatalogSnapshot,
  foreignKey: CatalogForeignKey,
): DiscoveryEvidence {
  const source = foreignKey.source
    ?? catalog.sources[`table:${foreignKey.table}`]
    ?? catalog.sources[`table:${foreignKey.referencedTable}`]

  return {
    kind: 'inclusion_dependency',
    score: foreignKey.enforced ? 1 : 0.95,
    message: `Catalog foreign key ${foreignKey.name} links ${foreignKey.table} to ${foreignKey.referencedTable}.`,
    ...(source ? { source } : {}),
    metadata: {
      foreignKeyName: foreignKey.name,
      enforced: foreignKey.enforced,
      ...(foreignKey.onDelete ? { onDelete: foreignKey.onDelete } : {}),
      ...(foreignKey.onUpdate ? { onUpdate: foreignKey.onUpdate } : {}),
    },
  }
}

function createColumnSimilarityEvidence(
  catalog: CatalogSnapshot,
  foreignKey: CatalogForeignKey,
  sameColumnCount: boolean,
): DiscoveryEvidence {
  const source = catalog.sources[`column:${foreignKey.table}.${foreignKey.columns[0]}`]
    ?? catalog.sources[`table:${foreignKey.table}`]

  return {
    kind: 'column_name_similarity',
    score: sameColumnCount ? averageColumnNameSimilarity(foreignKey.columns, foreignKey.referencedColumns) : 0.5,
    message: `Child columns ${foreignKey.columns.join(', ')} reference parent columns ${foreignKey.referencedColumns.join(', ')}.`,
    ...(source ? { source } : {}),
  }
}

function findParentUniqueEvidence(
  catalog: CatalogSnapshot,
  foreignKey: CatalogForeignKey,
): DiscoveryEvidence | undefined {
  const primaryKey = catalog.primaryKeys.find(key => isSameEndpoint(key, foreignKey.referencedTable, foreignKey.referencedColumns))
  if (primaryKey) {
    return createPrimaryKeyEvidence(catalog, primaryKey)
  }

  const uniqueCandidate = catalog.uniqueCandidates.find(candidate =>
    isSameEndpoint(candidate, foreignKey.referencedTable, foreignKey.referencedColumns),
  )
  if (uniqueCandidate) {
    return createUniqueCandidateEvidence(catalog, uniqueCandidate)
  }

  return undefined
}

function createPrimaryKeyEvidence(
  catalog: CatalogSnapshot,
  primaryKey: CatalogPrimaryKey,
): DiscoveryEvidence {
  const source = primaryKey.source ?? catalog.sources[`table:${primaryKey.table}`]

  return {
    kind: 'unique_candidate',
    score: 1,
    message: `Referenced parent endpoint ${primaryKey.table}.${primaryKey.columns.join(', ')} is backed by primary key ${primaryKey.name}.`,
    ...(source ? { source } : {}),
    metadata: {
      primaryKeyName: primaryKey.name,
    },
  }
}

function createUniqueCandidateEvidence(
  catalog: CatalogSnapshot,
  uniqueCandidate: CatalogUniqueCandidate,
): DiscoveryEvidence {
  const source = uniqueCandidate.source ?? catalog.sources[`table:${uniqueCandidate.table}`]

  return {
    kind: 'unique_candidate',
    score: uniqueCandidate.confidence,
    message: `Referenced parent endpoint ${uniqueCandidate.table}.${uniqueCandidate.columns.join(', ')} is a unique candidate ${uniqueCandidate.name}.`,
    ...(source ? { source } : {}),
    metadata: {
      uniqueCandidateName: uniqueCandidate.name,
      reason: uniqueCandidate.reason,
    },
  }
}

function isSameEndpoint(
  endpoint: { table: string; columns: string[] },
  table: string,
  columns: readonly string[],
): boolean {
  return endpoint.table === table
    && endpoint.columns.length === columns.length
    && endpoint.columns.every((column, index) => column === columns[index])
}

function isIncludedForeignKey(
  foreignKey: CatalogForeignKey,
  includedTables: readonly string[] | undefined,
): boolean {
  if (!includedTables || includedTables.length === 0) return true
  const scope = new Set(includedTables)
  return scope.has(foreignKey.table) && scope.has(foreignKey.referencedTable)
}

function averageColumnNameSimilarity(leftColumns: readonly string[], rightColumns: readonly string[]): number {
  if (leftColumns.length === 0 || leftColumns.length !== rightColumns.length) return 0.5
  const total = leftColumns.reduce((sum, column, index) => {
    const rightColumn = rightColumns[index] ?? ''
    return sum + (toIdentifier(column) === toIdentifier(rightColumn) ? 1 : 0.75)
  }, 0)
  return total / leftColumns.length
}

function toIdentifier(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'relationship'
}
