import { describe, expect, it } from 'vitest'

import {
  createDpmApiObjectCanonicalIdentity,
  createDpmIdentityDataDefinitions,
  type DpmAuthoringPublishedRevision,
} from '../src/index.js'
import { createDpmIdentityDatabaseColumnIdentity } from '../src/model/data-identity-normalize.js'
import {
  createDpmCrossDefinitionReadModelReference,
  projectDpmCrossDefinitionReadModelRows,
  type DpmCrossDefinitionReadModelQuery,
} from '../src/authoring/read-model-contract.js'
import { createDpmCrossDefinitionReadModelScopedAuthorization } from '../src/authoring/read-model-authorization.js'
import { compareDpmCrossDefinitionReadModelShadow } from '../src/authoring/read-model-shadow.js'

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

  it('reports shadow parity for fallback identity, freshness, ordering, and API context', () => {
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
    reference.upsert({ revision: orders, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
    reference.upsert({ revision: billing, freshnessIdentity: 'sha256:billing-freshness', state: 'ready' })

    const definitionIds = ['billing-definition', 'orders-definition'] as const
    const actual = reference.search({
      definitionIds,
      query: { field: { name: 'customerNo' } },
      pageSize: 100,
    })
    const report = compareDpmCrossDefinitionReadModelShadow({
      revisions: [orders, billing],
      definitionIds,
      query: { field: { name: 'customerNo' } },
      freshnessIdentityByDefinitionId: {
        'billing-definition': 'sha256:billing-freshness',
        'orders-definition': 'sha256:orders-freshness',
      },
      actual,
      pageSize: 100,
    })

    expect(report).toEqual({
      status: 'match',
      expectedStatus: 'ready',
      observedStatus: 'ready',
      expectedHitKeys: [
        'billing-definition/revision-1/customer-number',
        'orders-definition/revision-1/customer-number',
      ],
      observedHitKeys: [
        'billing-definition/revision-1/customer-number',
        'orders-definition/revision-1/customer-number',
      ],
      issues: [],
    })
  })

  it('reports strict error mapping during shadow verification', () => {
    const revision = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: ({ requestedDefinitionIds }) => ({
        allowed: requestedDefinitionIds?.every(definitionId => definitionId === 'orders-definition') ?? false,
        definitionIds: requestedDefinitionIds ?? [],
      }),
    })
    reference.upsert({ revision, freshnessIdentity: 'sha256:orders-freshness', state: 'stale' })
    const actual = reference.search({
      definitionIds: ['orders-definition'],
      query: { field: { name: 'customerNo' } },
    })

    const report = compareDpmCrossDefinitionReadModelShadow({
      revisions: [revision],
      definitionIds: ['orders-definition'],
      query: { field: { name: 'customerNo' } },
      freshnessIdentityByDefinitionId: { 'orders-definition': 'sha256:orders-freshness' },
      actual,
      expectedFailure: { status: 'read-model-unavailable' },
    })

    expect(report.status).toBe('match')
    expect(report.expectedStatus).toBe('read-model-unavailable')
    expect(report.observedStatus).toBe('read-model-unavailable')
    expect(report.issues).toEqual([])
  })

  it('keeps authorization scope isolated and denies empty or widened scopes', () => {
    const orders = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    const billing = createRevision('billing-definition', 'revision-1', 'billing-catalog-1', '2026-07-15T00:00:02.000Z')
    const billingDbIdentity = createDpmIdentityDatabaseColumnIdentity({
      table: 'public.customers',
      column: 'customer_no',
      catalog: {
        snapshotId: 'billing-catalog-1',
        versionHash: 'sha256:billing-catalog-1',
      },
    })
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition']),
    })
    reference.upsert({ revision: orders, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
    reference.upsert({ revision: billing, freshnessIdentity: 'sha256:billing-freshness', state: 'ready' })

    expect(reference.search({
      definitionIds: ['billing-definition'],
      query: { identity: { identityKind: 'db', identityKey: billingDbIdentity } },
    })).toEqual({ status: 'forbidden' })
    expect(reference.search({
      definitionIds: ['orders-definition', 'billing-definition'],
      query: { identity: { identityKind: 'db', identityKey: billingDbIdentity } },
    })).toEqual({ status: 'forbidden' })

    const outOfScopeWithoutRequestedScope = reference.search({
      query: { identity: { identityKind: 'db', identityKey: billingDbIdentity } },
    })
    expect(outOfScopeWithoutRequestedScope).toEqual({ status: 'ready', hits: [] })
    expect(JSON.stringify(outOfScopeWithoutRequestedScope)).not.toContain('billing-freshness')
    expect(JSON.stringify(outOfScopeWithoutRequestedScope)).not.toContain(billingDbIdentity)
    expect('total' in outOfScopeWithoutRequestedScope).toBe(false)

    const emptyScopeReference = createDpmCrossDefinitionReadModelReference({
      authorization: createDpmCrossDefinitionReadModelScopedAuthorization([]),
    })
    emptyScopeReference.upsert({ revision: orders, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
    expect(emptyScopeReference.search({
      definitionIds: [],
      query: { identity: { identityKind: 'db', identityKey: billingDbIdentity } },
    })).toEqual({ status: 'forbidden' })

    const defaultDenyReference = createDpmCrossDefinitionReadModelReference()
    defaultDenyReference.upsert({ revision: orders, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
    expect(defaultDenyReference.search({
      definitionIds: ['orders-definition'],
      query: { identity: { identityKind: 'db', identityKey: billingDbIdentity } },
    })).toEqual({ status: 'forbidden' })
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

  it.each(['building', 'stale', 'failed'] as const)(
    'does not serve old ready results when the latest authorized generation is %s', state => {
      const reference = createDpmCrossDefinitionReadModelReference({
        authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition']),
      })
      const old = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
      const latest = createRevision('orders-definition', 'revision-2', 'orders-catalog-2', '2026-07-15T00:00:02.000Z')
      // Insert the old revision last: latest selection must not depend on insertion order.
      reference.upsert({ revision: latest, freshnessIdentity: 'sha256:latest', state })
      reference.upsert({ revision: old, freshnessIdentity: 'sha256:old', state: 'ready' })
      expect(reference.search({
        definitionIds: ['orders-definition'],
        query: { field: { name: 'customerNo' } },
      })).toEqual({ status: 'read-model-unavailable' })
    },
  )

  it('returns unavailable rather than partial results when an authorized definition has no generation', () => {
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition', 'billing-definition']),
    })
    const orders = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    reference.upsert({ revision: orders, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
    expect(reference.search({
      definitionIds: ['orders-definition', 'billing-definition'],
      query: { field: { name: 'customerNo' } },
    })).toEqual({ status: 'read-model-unavailable' })
  })

  it('serves only the latest ready revision without changing its source artifacts', () => {
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition']),
    })
    const old = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    const latest = createRevision('orders-definition', 'revision-2', 'orders-catalog-2', '2026-07-15T00:00:02.000Z')
    const source = JSON.stringify([old, latest])
    reference.upsert({ revision: latest, freshnessIdentity: 'sha256:latest', state: 'ready' })
    reference.upsert({ revision: old, freshnessIdentity: 'sha256:old', state: 'ready' })

    const result = reference.search({
      definitionIds: ['orders-definition'],
      query: { field: { name: 'customerNo' } },
    })
    expect(result.status).toBe('ready')
    if (result.status !== 'ready') throw new Error('expected ready result')
    expect(result.hits).toHaveLength(1)
    expect(result.hits[0]).toMatchObject({ revisionId: 'revision-2', freshnessIdentity: 'sha256:latest' })
    expect(JSON.stringify([old, latest])).toBe(source)
  })

  it.each(['missing', 'ready', 'building', 'stale', 'failed'] as const)(
    'does not leak an unauthorized definition whose generation is %s', state => {
      const reference = createDpmCrossDefinitionReadModelReference({
        authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition']),
      })
      const orders = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
      reference.upsert({ revision: orders, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
      const input = {
        definitionIds: ['orders-definition'],
        query: { field: { type: 'string' as const } },
        pageSize: 1,
      }
      const withoutHiddenDefinition = reference.search(input)
      expect(withoutHiddenDefinition.status).toBe('ready')
      if (withoutHiddenDefinition.status !== 'ready') throw new Error('expected ready result')
      expect(withoutHiddenDefinition.nextCursor).toBeDefined()
      const continuationWithoutHiddenDefinition = reference.search({ ...input, cursor: withoutHiddenDefinition.nextCursor })
      expect(continuationWithoutHiddenDefinition).toMatchObject({
        status: 'ready', hits: [{ definitionId: 'orders-definition' }],
      })

      if (state !== 'missing') {
        const billing = createRevision('billing-definition', 'revision-secret', 'billing-secret', '2026-07-15T00:00:03.000Z')
        reference.upsert({ revision: billing, freshnessIdentity: 'sha256:secret-freshness', state })
      }

      expect(reference.search(input)).toEqual(withoutHiddenDefinition)
      expect(reference.search({ ...input, cursor: withoutHiddenDefinition.nextCursor }))
        .toEqual(continuationWithoutHiddenDefinition)
      expect(reference.search({ ...input, definitionIds: ['billing-definition'] }))
        .toEqual({ status: 'forbidden' })
      expect(reference.search({ ...input, definitionIds: ['orders-definition', 'billing-definition'] }))
        .toEqual({ status: 'forbidden' })
    },
  )

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 101])(
    'rejects invalid page size %s without returning hits or cursors', pageSize => {
      const reference = createDpmCrossDefinitionReadModelReference({
        authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition']),
      })
      expect(reference.search({
        definitionIds: ['orders-definition'], query: { field: { name: 'customerNo' } }, pageSize,
      })).toEqual({ status: 'invalid-query', reason: 'pageSize must be an integer from 1 to 100' })
    },
  )

  it('uses a default page size of 25 and paginates at the maximum of 100 without duplicates', () => {
    const definitionIds = Array.from({ length: 60 }, (_, index) => `scope${String(index).padStart(2, '0')}-definition`)
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: createDpmCrossDefinitionReadModelScopedAuthorization(definitionIds),
    })
    for (const definitionId of [...definitionIds].reverse()) {
      reference.upsert({
        revision: createRevision(definitionId, 'revision-1', `${definitionId}-catalog`, '2026-07-15T00:00:01.000Z'),
        freshnessIdentity: `sha256:${definitionId}`, state: 'ready',
      })
    }
    const input = { definitionIds, query: { field: { type: 'string' as const } } }
    const defaultPage = reference.search(input)
    const first = reference.search({ ...input, pageSize: 100 })
    expect(defaultPage.status).toBe('ready')
    expect(first.status).toBe('ready')
    if (defaultPage.status !== 'ready' || first.status !== 'ready') throw new Error('expected ready pages')
    expect(defaultPage.hits).toHaveLength(25)
    expect(defaultPage.nextCursor).toBeDefined()
    expect(first.hits).toHaveLength(100)
    expect(first.nextCursor).toBeDefined()
    expect(reference.search({ ...input, pageSize: 100 })).toEqual(first)

    const second = reference.search({ ...input, pageSize: 100, cursor: first.nextCursor })
    expect(second.status).toBe('ready')
    if (second.status !== 'ready') throw new Error('expected ready continuation')
    expect(second.hits).toHaveLength(20)
    expect(second.nextCursor).toBeUndefined()
    const keys = [...first.hits, ...second.hits].map(hit => `${hit.definitionId}/${hit.objectId}`)
    expect(new Set(keys).size).toBe(120)
    expect(keys).toEqual([...keys].sort((left, right) => left.localeCompare(right)))
  })

  it.each(['identity-parity', 'freshness-parity', 'api-binding-parity', 'result-order', 'cursor-bound'] as const)(
    'detects injected %s faults in the private shadow report', code => {
      const definitionIds = ['billing-definition', 'orders-definition']
      const revisions = definitionIds.map(definitionId =>
        createRevision(definitionId, 'revision-1', `${definitionId}-catalog`, '2026-07-15T00:00:01.000Z'))
      const reference = createDpmCrossDefinitionReadModelReference({
        authorization: createDpmCrossDefinitionReadModelScopedAuthorization(definitionIds),
      })
      for (const revision of revisions) {
        reference.upsert({ revision, freshnessIdentity: `sha256:${revision.definitionId}`, state: 'ready' })
      }
      const query = { field: { name: 'customerNo' } }
      const actual = reference.search({ definitionIds, query, pageSize: 100 })
      if (actual.status !== 'ready') throw new Error('expected ready result')
      const input = {
        revisions, definitionIds, query, actual, pageSize: 100,
        freshnessIdentityByDefinitionId: Object.fromEntries(definitionIds.map(id => [id, `sha256:${id}`])),
      }
      expect(compareDpmCrossDefinitionReadModelShadow(input).status).toBe('match')

      let contaminated = actual
      if (code === 'identity-parity') {
        contaminated = { ...actual, hits: actual.hits.map(hit => ({ ...hit, identities: [] })) }
      } else if (code === 'freshness-parity') {
        contaminated = { ...actual, hits: actual.hits.map(hit => ({ ...hit, freshnessIdentity: 'sha256:wrong' })) }
      } else if (code === 'api-binding-parity') {
        contaminated = { ...actual, hits: actual.hits.map(hit => ({ ...hit, apiBindings: [] })) }
      } else if (code === 'result-order') {
        contaminated = { ...actual, hits: [...actual.hits].reverse() }
      } else {
        contaminated = { ...actual, nextCursor: 'unexpected-cursor' }
      }

      const report = compareDpmCrossDefinitionReadModelShadow({ ...input, actual: contaminated })
      expect(report.status).toBe('mismatch')
      expect(report.issues.map(issue => issue.code)).toContain(code)
      expect(compareDpmCrossDefinitionReadModelShadow(input).status).toBe('match')
    },
  )

  it.each([
    ['empty entity', { field: { entity: {} } }],
    ['undefined predicate', { field: { name: undefined } }],
    ['unknown predicate', { field: { fullText: 'customer' } }],
    ['unknown nested predicate', { field: { entity: { fullText: 'customer' } } }],
    ['blank predicate', { field: { name: ' ' } }],
    ['invalid field type', { field: { type: 'sql' } }],
    ['invalid origin', { field: { origin: 'database' } }],
    ['invalid lifecycle', { field: { lifecycle: 'deleted' } }],
    ['incomplete locator', { field: { locator: { field: 'customerNo' } } }],
    ['mixed query', { field: { name: 'customerNo' }, identity: { identityKind: 'object', identityKey: 'customer-number' } }],
    ['missing query kind', {}],
    ['null query', null],
    ['null identity', { identity: null }],
    ['unsupported identity kind', { identity: { identityKind: 'sql', identityKey: 'customer-number' } }],
    ['non-string identity key', { identity: { identityKind: 'object', identityKey: 1 } }],
    ['blank identity key', { identity: { identityKind: 'object', identityKey: ' ' } }],
  ])('rejects %s rather than silently broadening or emptying a query', (_label, query) => {
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition']),
    })
    const revision = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    reference.upsert({ revision, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
    const result = reference.search({
      definitionIds: ['orders-definition'], query: query as unknown as DpmCrossDefinitionReadModelQuery,
    })
    expect(result).toEqual({ status: 'invalid-query', reason: expect.any(String) })
  })

  it.each([
    { entity: { datasetId: 'commerce' } },
    { entity: { namespace: 'orders' } },
    { entity: { name: 'customer' } },
    { locator: { datasetId: 'commerce', namespace: 'orders', entity: 'customer', field: 'customerNo' } },
    { name: 'customerNo' },
    { type: 'string' as const },
    { origin: 'persisted' as const },
    { lifecycle: 'active' as const },
  ])('preserves supported bounded field lookup %j', field => {
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition']),
    })
    const revision = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    reference.upsert({ revision, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
    const result = reference.search({ definitionIds: ['orders-definition'], query: { field } })
    expect(result.status).toBe('ready')
    if (result.status !== 'ready') throw new Error('expected ready result')
    expect(result.hits.some(hit => hit.objectId === 'customer-number')).toBe(true)
  })

  it.each([
    ['unsupported identity kind', ['orders-definition', 'revision-1', 'customer-number', 'sql', 'key']],
    ['empty definition', ['', 'revision-1', 'customer-number', 'object', 'key']],
    ['empty revision', ['orders-definition', '', 'customer-number', 'object', 'key']],
    ['empty object', ['orders-definition', 'revision-1', '', 'object', 'key']],
    ['blank key', ['orders-definition', 'revision-1', 'customer-number', 'object', ' ']],
    ['wrong tuple length', ['orders-definition', 'revision-1']],
    ['non-string member', ['orders-definition', 'revision-1', 1, 'object', 'key']],
  ])('rejects cursor with %s', (_label, tuple) => {
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition']),
    })
    const revision = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    reference.upsert({ revision, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
    expect(reference.search({
      definitionIds: ['orders-definition'], query: { field: { name: 'customerNo' } },
      cursor: Buffer.from(JSON.stringify(tuple)).toString('base64url'),
    })).toEqual({ status: 'invalid-query', reason: 'cursor is invalid' })
  })

  it('rejects malformed base64url without changing a valid cursor continuation', () => {
    const reference = createDpmCrossDefinitionReadModelReference({
      authorization: createDpmCrossDefinitionReadModelScopedAuthorization(['orders-definition']),
    })
    const revision = createRevision('orders-definition', 'revision-1', 'orders-catalog-1', '2026-07-15T00:00:01.000Z')
    reference.upsert({ revision, freshnessIdentity: 'sha256:orders-freshness', state: 'ready' })
    const input = { definitionIds: ['orders-definition'], query: { field: { type: 'string' as const } }, pageSize: 1 }
    const first = reference.search(input)
    if (first.status !== 'ready' || !first.nextCursor) throw new Error('expected cursor')
    const continuation = reference.search({ ...input, cursor: first.nextCursor })
    expect(continuation).toMatchObject({ status: 'ready', hits: [{ objectId: 'customer-number' }] })
    for (const cursor of ['', 'not-json', `${first.nextCursor}!`, ` ${first.nextCursor}`]) {
      expect(reference.search({ ...input, cursor })).toEqual({ status: 'invalid-query', reason: 'cursor is invalid' })
    }
    expect(reference.search({ ...input, cursor: first.nextCursor })).toEqual(continuation)
  })

  it('detects false empty success and incorrect failure reasons during shadow comparison', () => {
    const input = {
      revisions: [], definitionIds: ['orders-definition'],
      query: { field: { name: 'customerNo' } }, freshnessIdentityByDefinitionId: {},
    }
    const falseEmpty = compareDpmCrossDefinitionReadModelShadow({
      ...input, actual: { status: 'ready', hits: [] }, expectedFailure: { status: 'read-model-unavailable' },
    })
    expect(falseEmpty.status).toBe('mismatch')
    expect(falseEmpty.issues.map(issue => issue.code)).toEqual(['status'])

    const wrongReason = compareDpmCrossDefinitionReadModelShadow({
      ...input, actual: { status: 'invalid-query', reason: 'wrong reason' },
      expectedFailure: { status: 'invalid-query', reason: 'cursor is invalid' },
    })
    expect(wrongReason.status).toBe('mismatch')
    expect(wrongReason.issues.map(issue => issue.code)).toEqual(['reason'])
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
