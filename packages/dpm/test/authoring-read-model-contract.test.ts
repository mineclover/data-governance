import { describe, expect, it } from 'vitest'

import {
  createDpmApiObjectCanonicalIdentity,
  createDpmIdentityDataDefinitions,
  type DpmAuthoringPublishedRevision,
} from '../src/index.js'
import {
  createDpmCrossDefinitionReadModelReference,
  projectDpmCrossDefinitionReadModelRows,
} from '../src/authoring/read-model-contract.js'

describe('DPM deferred cross-definition read-model contract', () => {
  it('projects canonical identities without copying raw definition content', () => {
    const revision = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    const row = projectDpmCrossDefinitionReadModelRows(revision, 'sha256:orders-freshness')
      .find(candidate => candidate.objectId === 'customer-number')

    expect(row).toMatchObject({
      definitionId: 'orders-definition',
      revisionId: 'revision-1',
      objectId: 'customer-number',
      freshnessIdentity: 'sha256:orders-freshness',
      field: {
        name: 'customerNo',
        type: 'string',
        origin: 'persisted',
        lifecycle: 'active',
      },
    })
    expect(row?.identities.map(identity => identity.identityKind)).toEqual(['api', 'db', 'object'])
    expect(row?.apiBindings).toEqual([{
      bindingId: 'customer-number-response',
      identityKey: expect.stringContaining('api:commerce-api@'),
      direction: 'response',
    }])
    expect(JSON.stringify(row)).not.toContain('private description')
    expect(Object.isFrozen(row)).toBe(true)
    expect(Object.isFrozen(row?.identities)).toBe(true)
  })

  it('proves bounded cross-definition lookup, duplicate collapse, and deterministic cursors', () => {
    const allowed = new Set(['billing-definition', 'orders-definition'])
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: ({ requestedDefinitionIds }) => {
        const definitionIds = requestedDefinitionIds ?? [...allowed]
        return {
          allowed: definitionIds.every(definitionId => allowed.has(definitionId)),
          definitionIds,
        }
      },
    })
    const orders = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    const billing = createRevision('billing-definition', 'revision-1', 'billing-catalog-1', '2026-07-15T00:00:02.000Z')
    reference.upsert({ revision: orders, freshnessIdentity: 'sha256:orders-freshness' })
    reference.upsert({ revision: billing, freshnessIdentity: 'sha256:billing-freshness' })

    expect(reference.search({
      definitionIds: ['billing-definition', 'orders-definition'],
      query: { field: { name: 'customerNo' } },
    })).toEqual({ status: 'read-model-unavailable' })

    reference.setGenerationState({ definitionId: orders.definitionId, revisionId: orders.revisionId, state: 'ready' })
    reference.setGenerationState({ definitionId: billing.definitionId, revisionId: billing.revisionId, state: 'ready' })

    const apiIdentity = createDpmApiObjectCanonicalIdentity({
      artifactId: 'commerce-api',
      versionHash: 'sha256:api-1',
      pointer: '#/components/schemas/Customer/properties/customerNo',
    })
    const firstPage = reference.search({
      query: { identity: { identityKind: 'api', identityKey: apiIdentity } },
      pageSize: 1,
    })
    expect(firstPage.status).toBe('ready')
    expect(firstPage.hits).toHaveLength(1)
    expect(firstPage.hits[0]?.definitionId).toBe('billing-definition')
    expect(firstPage.hits[0]?.matchedIdentities).toEqual([{ identityKind: 'api', identityKey: apiIdentity }])
    expect(firstPage.nextCursor).toBeDefined()

    const secondPage = reference.search({
      query: { identity: { identityKind: 'api', identityKey: apiIdentity } },
      pageSize: 1,
      cursor: firstPage.nextCursor,
    })
    expect(secondPage.status).toBe('ready')
    expect(secondPage.hits.map(hit => hit.definitionId)).toEqual(['orders-definition'])
    expect(secondPage.nextCursor).toBeUndefined()

    const fieldResults = reference.search({
      definitionIds: ['billing-definition', 'orders-definition'],
      query: { field: { name: 'customerNo' } },
    })
    expect(fieldResults.status).toBe('ready')
    expect(fieldResults.hits).toHaveLength(2)
    expect(fieldResults.hits[0]?.matchedIdentities.map(identity => identity.identityKind))
      .toEqual(['api', 'db', 'object'])
    expect('total' in fieldResults).toBe(false)
    expect(JSON.stringify(fieldResults)).not.toContain('private description')
  })

  it('keeps interrupted rebuilds unavailable and publishes a complete retry atomically', () => {
    const revision = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    const rows = projectDpmCrossDefinitionReadModelRows(revision, 'sha256:orders-freshness')
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: ({ requestedDefinitionIds }) => ({
        allowed: requestedDefinitionIds?.every(definitionId => definitionId === 'orders-definition') ?? false,
        definitionIds: requestedDefinitionIds ?? [],
      }),
    })

    const interrupted = reference.beginRebuild({
      revision,
      freshnessIdentity: 'sha256:orders-freshness',
    })
    interrupted.append({ objectId: 'customer-email' })
    expect(reference.search({
      definitionIds: ['orders-definition'],
      query: { field: { name: 'customerNo' } },
    })).toEqual({ status: 'read-model-unavailable' })
    interrupted.fail()
    expect(reference.search({
      definitionIds: ['orders-definition'],
      query: { field: { name: 'customerNo' } },
    })).toEqual({ status: 'read-model-unavailable' })

    const retry = reference.beginRebuild({
      revision,
      freshnessIdentity: 'sha256:orders-freshness',
    })
    for (const row of rows) retry.append({ objectId: row.objectId })
    retry.complete()

    const result = reference.search({
      definitionIds: ['orders-definition'],
      query: { field: { name: 'customerNo' } },
    })
    expect(result.status).toBe('ready')
    expect(result.hits.map(hit => hit.objectId)).toEqual(['customer-number'])
  })

  it('fails closed for unauthorized scopes, stale generations, and unbounded queries', () => {
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: ({ requestedDefinitionIds }) => ({
        allowed: requestedDefinitionIds?.every(definitionId => definitionId === 'orders-definition') ?? true,
        definitionIds: requestedDefinitionIds ?? ['orders-definition'],
      }),
    })
    const orders = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    reference.upsert({ revision: orders, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })

    expect(reference.search({
      query: { field: { name: 'customerNo' } },
    })).toEqual({ status: 'invalid-query', reason: 'field query requires an explicit definition scope' })
    expect(reference.search({
      definitionIds: ['billing-definition'],
      query: { field: { name: 'customerNo' } },
    })).toEqual({ status: 'forbidden' })
    expect(reference.search({
      pageSize: 101,
      definitionIds: ['orders-definition'],
      query: { field: { name: 'customerNo' } },
    })).toEqual({ status: 'invalid-query', reason: 'pageSize must be an integer from 1 to 100' })
    expect(reference.search({
      definitionIds: ['orders-definition'],
      query: { field: {} },
    })).toEqual({ status: 'invalid-query', reason: 'field query must include at least one bounded predicate' })

    reference.setGenerationState({ definitionId: orders.definitionId, revisionId: orders.revisionId, state: 'stale' })
    expect(reference.search({
      definitionIds: ['orders-definition'],
      query: { field: { name: 'customerNo' } },
    }))
      .toEqual({ status: 'read-model-unavailable' })
  })
})

function createRevision(
  definitionId: string,
  revisionId: string,
  catalogSnapshotId: string,
  createdAt: string,
): DpmAuthoringPublishedRevision {
  return {
    definitionId,
    revisionId,
    definitions: createDpmIdentityDataDefinitions({
      version: '1.1',
      fields: [{
        objectId: 'customer-number',
        revisionId: 'customer-number-rev-1',
        entity: { datasetId: 'commerce', namespace: definitionId.replace('-definition', ''), name: 'customer' },
        name: 'customerNo',
        type: 'string',
        origin: 'persisted',
        description: 'private description must not enter the read model',
        storageRef: {
          table: 'public.customers',
          column: 'customer_no',
          catalog: {
            snapshotId: catalogSnapshotId,
            versionHash: `sha256:${catalogSnapshotId}`,
          },
        },
      }, {
        objectId: 'customer-email',
        revisionId: 'customer-email-rev-1',
        entity: { datasetId: 'commerce', namespace: definitionId.replace('-definition', ''), name: 'customer' },
        name: 'email',
        type: 'string',
        origin: 'persisted',
        storageRef: {
          table: 'public.customers',
          column: 'email',
          catalog: {
            snapshotId: catalogSnapshotId,
            versionHash: `sha256:${catalogSnapshotId}`,
          },
        },
      }],
      apiBindings: [{
        bindingId: 'customer-number-response',
        dataField: { objectId: 'customer-number', revisionId: 'customer-number-rev-1' },
        api: {
          artifactId: 'commerce-api',
          versionHash: 'sha256:api-1',
          pointer: '#/components/schemas/Customer/properties/customerNo',
          operationId: 'getCustomer',
        },
        direction: 'response',
      }],
    }),
    reason: 'initial',
    createdBy: 'owner',
    createdAt,
  }
}
