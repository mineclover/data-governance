import {
  copyDiagnostic,
} from './snapshot-diagnostic-copy.js'
import {
  copyForeignKey,
  copyIndex,
  copyPrimaryKey,
  copyUniqueCandidate,
} from './snapshot-integrity-copy.js'
import {
  byColumn,
  byDiagnostic,
  bySchema,
  byTable,
  byTableName,
} from './snapshot-ordering.js'
import { copyProjectionEvidence } from './snapshot-projection-copy.js'
import type {
  CatalogSnapshotInput,
} from './snapshot-input-types.js'
import type {
  CatalogSnapshot,
} from './snapshot-record-types.js'
import {
  copySnapshotSource,
  sortSourceMap,
} from './snapshot-source-copy.js'
import {
  copyColumn,
  copySchema,
  copyTable,
} from './snapshot-structure-copy.js'

export function createCatalogSnapshotStructural(input: CatalogSnapshotInput): Omit<CatalogSnapshot, 'freshness'> {
  return {
    kind: 'dpm.catalog.snapshot.v1',
    source: copySnapshotSource(input.source),
    schemas: [...(input.schemas ?? [])].map(copySchema).sort(bySchema),
    tables: [...(input.tables ?? [])].map(copyTable).sort(byTable),
    columns: [...(input.columns ?? [])].map(copyColumn).sort(byColumn),
    primaryKeys: [...(input.primaryKeys ?? [])].map(copyPrimaryKey).sort(byTableName),
    foreignKeys: [...(input.foreignKeys ?? [])].map(copyForeignKey).sort(byTableName),
    indexes: [...(input.indexes ?? [])].map(copyIndex).sort(byTableName),
    uniqueCandidates: [...(input.uniqueCandidates ?? [])].map(copyUniqueCandidate).sort(byTableName),
    sources: sortSourceMap(input.sources ?? {}),
    diagnostics: [...(input.diagnostics ?? [])].map(copyDiagnostic).sort(byDiagnostic),
    ...(input.projection ? { projection: copyProjectionEvidence(input.projection) } : {}),
  }
}
