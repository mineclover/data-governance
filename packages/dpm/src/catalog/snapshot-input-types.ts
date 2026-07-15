import type {
  SchemaSourceCoordinate,
} from '../contract/openapi-projection.js'
import type { CatalogDiagnostic } from './diagnostic-types.js'
import type {
  CatalogForeignKey,
  CatalogIndex,
  CatalogPrimaryKey,
  CatalogUniqueCandidate,
} from './integrity-types.js'
import type { CatalogProjectionEvidence } from './projection-types.js'
import type { CatalogSnapshotSource } from './source-types.js'
import type {
  CatalogColumn,
  CatalogSchema,
  CatalogTable,
} from './structure-types.js'

export type CatalogSnapshotInput = {
  source: CatalogSnapshotSource
  schemas?: readonly CatalogSchema[]
  tables?: readonly CatalogTable[]
  columns?: readonly CatalogColumn[]
  primaryKeys?: readonly CatalogPrimaryKey[]
  foreignKeys?: readonly CatalogForeignKey[]
  indexes?: readonly CatalogIndex[]
  uniqueCandidates?: readonly CatalogUniqueCandidate[]
  sources?: Readonly<Record<string, SchemaSourceCoordinate>>
  diagnostics?: readonly CatalogDiagnostic[]
  projection?: CatalogProjectionEvidence
  sourceVersionHash?: string
}

export type PostgresCatalogSnapshotInput = Omit<CatalogSnapshotInput, 'source'> & {
  database: string
  capturedAt?: string
}
