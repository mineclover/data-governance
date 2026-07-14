import { describe, expect, it } from 'vitest'

import {
  registryRowsToSnapshot,
} from '../src/index.js'
import {
  STORAGE_REGISTRY_DATASET_ID,
  STORAGE_REGISTRY_EXPORTED_AT,
  STORAGE_REGISTRY_VERSION,
} from './support/storage-registry-snapshot-fixtures.js'
import { storageRegistryRows } from './support/storage-registry-row-fixtures.js'
import {
  expectedStorageRegistryApprovedRelationship,
  expectedStorageRegistryApprovedRelationshipNames,
  expectedStorageRegistryNonExecutableStatuses,
  expectedStorageRegistryRelationshipIdentities,
  expectedStorageRegistrySnapshotIdentity,
} from './support/storage-registry-projection-fixtures.js'

describe('DPM registry storage row mapper', () => {
  it('exports storage rows to the existing registry snapshot contract', () => {
    const snapshot = registryRowsToSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      exportedAt: STORAGE_REGISTRY_EXPORTED_AT,
      rows: storageRegistryRows,
    })

    expect(snapshot.identity).toBe(expectedStorageRegistrySnapshotIdentity)
    expect(snapshot.canonicalKeyEncodingVersion).toBe('string-v1')
    expect(snapshot.relationships.map(relationship => relationship.identity)).toEqual([
      ...expectedStorageRegistryRelationshipIdentities,
    ])
    expect(snapshot.approvedRelationships.map(relationship => relationship.name))
      .toEqual([...expectedStorageRegistryApprovedRelationshipNames])
    expect(snapshot.nonExecutableRelationships.map(relationship => relationship.status))
      .toEqual([...expectedStorageRegistryNonExecutableStatuses])
    expect(snapshot.relationships[0]).toMatchObject(expectedStorageRegistryApprovedRelationship)
  })

  it('normalizes legacy missing row versions to string-v1 without allowing request relabeling', () => {
    const legacyRows = storageRegistryRows.map(row => {
      const legacy = { ...row }
      delete legacy.canonicalKeyEncodingVersion
      return legacy
    })

    expect(registryRowsToSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      rows: legacyRows,
    }).canonicalKeyEncodingVersion).toBe('string-v1')

    expect(() => registryRowsToSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      expectedCanonicalKeyEncodingVersion: 'typed-v2',
      rows: legacyRows,
    })).toThrow('expected canonical key encoding typed-v2, but stored rows use string-v1')
  })

  it('derives typed-v2 only from authoritative rows and rejects mixed snapshots', () => {
    const typedRows = storageRegistryRows.map(row => ({
      ...row,
      canonicalKeyEncodingVersion: 'typed-v2' as const,
    }))
    const typedSnapshot = registryRowsToSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      expectedCanonicalKeyEncodingVersion: 'typed-v2',
      rows: typedRows,
    })

    expect(typedSnapshot.canonicalKeyEncodingVersion).toBe('typed-v2')
    expect(typedSnapshot.identity).toBe(
      'dpm.relationship.registry-snapshot.typed-v2'
      + '|d|11:commerce_ai|r|14:reg-2026-07-01',
    )
    expect(() => registryRowsToSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      rows: [typedRows[0]!, storageRegistryRows[1]!],
    })).toThrow('mixes canonical key encodings typed-v2 and string-v1')
  })

  it('keeps an empty persisted registry at string-v1 unless a metadata port is introduced', () => {
    expect(registryRowsToSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      rows: [],
    }).canonicalKeyEncodingVersion).toBe('string-v1')

    expect(() => registryRowsToSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      expectedCanonicalKeyEncodingVersion: 'typed-v2',
      rows: [],
    })).toThrow('expected canonical key encoding typed-v2, but stored rows use string-v1')

    expect(registryRowsToSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      expectedCanonicalKeyEncodingVersion: 'typed-v2',
      registryContract: {
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: STORAGE_REGISTRY_VERSION,
        canonicalKeyEncodingVersion: 'typed-v2',
      },
      rows: [],
    }).canonicalKeyEncodingVersion).toBe('typed-v2')
  })

  it('rejects relationship rows that disagree with authoritative registry metadata', () => {
    expect(() => registryRowsToSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      registryContract: {
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: STORAGE_REGISTRY_VERSION,
        canonicalKeyEncodingVersion: 'typed-v2',
      },
      rows: storageRegistryRows,
    })).toThrow(
      'contract stores canonical key encoding typed-v2, but relationship rows use string-v1',
    )
  })
})
