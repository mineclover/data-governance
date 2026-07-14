import { describe, expect, it } from 'vitest'

import {
  assertDpmRegistryRowMatchesSnapshot,
} from '../src/storage/registry-row-scope.js'
import { approvedStorageRegistryRelationshipRow } from './support/storage-registry-approved-row-fixtures.js'
import {
  STORAGE_REGISTRY_DATASET_ID,
  STORAGE_REGISTRY_VERSION,
} from './support/storage-registry-snapshot-fixtures.js'

describe('DPM registry storage row scope guard', () => {
  it('refuses storage rows outside the requested dataset or registry version', () => {
    expect(() =>
      assertDpmRegistryRowMatchesSnapshot(
        {
          datasetId: STORAGE_REGISTRY_DATASET_ID,
          registryVersion: STORAGE_REGISTRY_VERSION,
        },
        {
          ...approvedStorageRegistryRelationshipRow,
          datasetId: 'other_dataset',
        },
      ),
    ).toThrow('Registry row other_dataset/reg-2026-07-01/rel_orders_customer@1 does not match requested snapshot commerce_ai@reg-2026-07-01')
  })
})
