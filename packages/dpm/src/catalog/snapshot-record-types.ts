import type {
  SchemaSourceCoordinate,
} from '../contract/openapi-projection.js'
import type { CatalogDiagnostic } from './diagnostic-types.js'
import type { CatalogFreshness } from './snapshot-freshness-types.js'
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

export type CatalogSnapshot = {
  kind: 'dpm.catalog.snapshot.v1'
  source: CatalogSnapshotSource
  schemas: CatalogSchema[]
  tables: CatalogTable[]
  columns: CatalogColumn[]
  primaryKeys: CatalogPrimaryKey[]
  foreignKeys: CatalogForeignKey[]
  indexes: CatalogIndex[]
  uniqueCandidates: CatalogUniqueCandidate[]
  sources: Record<string, SchemaSourceCoordinate>
  diagnostics: CatalogDiagnostic[]
  projection?: CatalogProjectionEvidence
  freshness: CatalogFreshness
}
