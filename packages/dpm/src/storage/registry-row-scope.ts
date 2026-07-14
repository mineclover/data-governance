import type {
  DpmRegistryRelationshipRow,
  DpmRegistryRowsToSnapshotInput,
} from './registry-repository-types.js'

export type DpmRegistryRowSnapshotScope = Pick<DpmRegistryRowsToSnapshotInput, 'datasetId' | 'registryVersion'>

export function assertDpmRegistryRowMatchesSnapshot(
  snapshot: DpmRegistryRowSnapshotScope,
  row: DpmRegistryRelationshipRow,
): void {
  if (row.datasetId === snapshot.datasetId && row.registryVersion === snapshot.registryVersion) return

  throw new Error(
    `Registry row ${row.datasetId}/${row.registryVersion}/${row.relationshipName}@${row.relationshipVersion} ` +
      `does not match requested snapshot ${snapshot.datasetId}@${snapshot.registryVersion}`,
  )
}
