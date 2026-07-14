export {
  STORAGE_REGISTRY_DATASET_ID,
  STORAGE_REGISTRY_EXPORTED_AT,
  STORAGE_REGISTRY_VERSION,
} from './storage-registry-snapshot-fixtures.js'
export { approvedStorageRegistryRelationshipRow } from './storage-registry-approved-row-fixtures.js'
export { rejectedStorageRegistryRelationshipRow } from './storage-registry-rejected-row-fixtures.js'

import { approvedStorageRegistryRelationshipRow } from './storage-registry-approved-row-fixtures.js'
import { rejectedStorageRegistryRelationshipRow } from './storage-registry-rejected-row-fixtures.js'

export const storageRegistryRows = [
  approvedStorageRegistryRelationshipRow,
  rejectedStorageRegistryRelationshipRow,
] as const
