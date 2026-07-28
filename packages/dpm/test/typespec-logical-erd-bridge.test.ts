import { describe, expect, it } from 'vitest'

import {
  createDpmTypespecLogicalErdBridgeProjection,
  inspectDpmTypespecLogicalErdCatalogEvidence,
  normalizeCatalogSnapshot,
  type TypespecLogicalErdArtifact,
} from '../src/index.js'

const artifact: TypespecLogicalErdArtifact = {
  kind: 'oa-sdk.logical-erd.v1',
  artifactId: 'logical-erd:commerce@sha256:4cb063b45107292e7ea0d42b7caddda0a5e79d09f4c75a8b0e10cf5ab84c1d9e',
  entities: [{
    id: 'commerce.customer',
    fields: [
      { id: 'commerce.customer.number', name: 'customerNumber' },
      { id: 'commerce.customer.search-key', name: 'searchKey' },
    ],
  }],
  provenance: [{
    subject: 'field:commerce.customer.number',
    span: { file: 'commerce.tsp', line: 12, column: 3, endLine: 14, endColumn: 28 },
    decoratorSpan: { file: 'commerce.tsp', line: 12, column: 3, endLine: 12, endColumn: 39 },
  }],
}

function catalog() {
  return normalizeCatalogSnapshot({
    source: { kind: 'postgresql', database: 'commerce' },
    tables: [{ schema: 'public', name: 'customers', table: 'public.customers', kind: 'table' }],
    columns: [{ table: 'public.customers', name: 'customer_number', dataType: 'text', nullable: false, ordinal: 1 }],
  })
}

function projection() {
  const snapshot = catalog()
  return createDpmTypespecLogicalErdBridgeProjection({
    artifact,
    fields: [
      {
        logicalFieldId: 'commerce.customer.number',
        kind: 'project',
        dataField: {
          objectId: 'customer-number',
          revisionId: 'customer-number-r1',
          entity: { datasetId: 'commerce', namespace: 'crm', name: 'customer' },
          name: 'customerNumber',
          type: 'string',
          origin: 'persisted',
          storageRef: {
            table: 'public.customers',
            column: 'customer_number',
            catalog: { snapshotId: 'commerce-2026-07-28', versionHash: snapshot.freshness.versionHash },
          },
        },
      },
      { logicalFieldId: 'commerce.customer.search-key', kind: 'exclude', reason: 'Search-only projection; no DPM policy is approved.' },
    ],
  })
}

describe('DPM TypeSpec logical ERD bridge', () => {
  it('projects only explicit DPM identities and preserves source provenance', () => {
    const result = projection()
    expect(result.definitions.fields).toHaveLength(1)
    expect(result.definitions.fields[0]).toMatchObject({
      objectId: 'customer-number',
      revisionId: 'customer-number-r1',
      entity: { datasetId: 'commerce', namespace: 'crm', name: 'customer' },
    })
    expect(result.fields).toContainEqual(expect.objectContaining({
      logicalFieldId: 'commerce.customer.number',
      objectId: 'customer-number',
      provenance: [expect.objectContaining({ subject: 'field:commerce.customer.number' })],
    }))
  })

  it('requires explicit coverage rather than silently inferring missing logical fields', () => {
    expect(() => createDpmTypespecLogicalErdBridgeProjection({
      artifact,
      fields: [{ logicalFieldId: 'commerce.customer.number', kind: 'exclude', reason: 'not in scope' }],
    })).toThrow('requires explicit coverage for logical ERD field commerce.customer.search-key')
  })

  it('reports catalog evidence without connecting to or mutating a database', () => {
    const snapshot = catalog()
    const result = inspectDpmTypespecLogicalErdCatalogEvidence({
      projection: projection(),
      catalog: { snapshotId: 'commerce-2026-07-28', snapshot },
    })
    expect(result.fields).toEqual([
      expect.objectContaining({ logicalFieldId: 'commerce.customer.number', status: 'confirmed' }),
      expect.objectContaining({ logicalFieldId: 'commerce.customer.search-key', status: 'unbound' }),
    ])

    const unknown = inspectDpmTypespecLogicalErdCatalogEvidence({ projection: projection() })
    expect(unknown.fields).toContainEqual(expect.objectContaining({
      logicalFieldId: 'commerce.customer.number',
      status: 'unknown',
    }))
  })

  it('does not confirm a storage binding whose supplied source coordinate disagrees with catalog evidence', () => {
    const snapshot = normalizeCatalogSnapshot({
      source: { kind: 'postgresql', database: 'commerce' },
      tables: [{ schema: 'public', name: 'customers', table: 'public.customers', kind: 'table' }],
      columns: [{
        table: 'public.customers',
        name: 'customer_number',
        dataType: 'text',
        nullable: false,
        ordinal: 1,
        source: { kind: 'db', entity: 'catalog_column', id: 'correct', pointer: '#/columns/correct' },
      }],
    })
    const bridge = createDpmTypespecLogicalErdBridgeProjection({
      artifact,
      fields: [{
        logicalFieldId: 'commerce.customer.number',
        kind: 'project',
        dataField: {
          objectId: 'customer-number',
          revisionId: 'customer-number-r1',
          entity: { datasetId: 'commerce', namespace: 'crm', name: 'customer' },
          name: 'customerNumber',
          type: 'string',
          origin: 'persisted',
          storageRef: {
            table: 'public.customers',
            column: 'customer_number',
            catalog: {
              snapshotId: 'commerce-2026-07-28',
              versionHash: snapshot.freshness.versionHash,
              sourceCoordinate: { kind: 'db', entity: 'catalog_column', id: 'wrong', pointer: '#/columns/wrong' },
            },
          },
        },
      }, { logicalFieldId: 'commerce.customer.search-key', kind: 'exclude', reason: 'not in scope' }],
    })
    expect(inspectDpmTypespecLogicalErdCatalogEvidence({
      projection: bridge,
      catalog: { snapshotId: 'commerce-2026-07-28', snapshot },
    }).fields).toContainEqual(expect.objectContaining({
      logicalFieldId: 'commerce.customer.number',
      status: 'mismatch',
      reason: expect.stringContaining('source coordinate'),
    }))
  })
})
