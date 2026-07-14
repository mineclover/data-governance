import type { DpmRegistrySnapshotExportRequest } from './registry-repository-request-types.js'
import type { DpmRegistryRelationshipRow } from './registry-storage-row-types.js'
import type {
  DpmRegistryCanonicalKeyEncodingContract,
} from './registry-encoding-contract-types.js'

export type DpmRegistryRowsToSnapshotInput = DpmRegistrySnapshotExportRequest & {
  registryContract?: DpmRegistryCanonicalKeyEncodingContract
  rows: readonly DpmRegistryRelationshipRow[]
}
