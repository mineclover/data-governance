import { createDpmAuthoringIdentityIndexRows } from './postgres.js'
import { lookupDpmAuthoringRevision } from './query.js'
import type {
  DpmAuthoringIdentityIndexKind,
  DpmAuthoringPublishedRevision,
} from './types.js'
import type {
  DpmCrossDefinitionReadModelIdentity,
  DpmCrossDefinitionReadModelQuery,
  DpmCrossDefinitionReadModelSearchResult,
} from './read-model-contract.js'

/**
 * Private-only shadow comparison. This module is intentionally not exported from the package
 * public seam and does not enable read-model consumers.
 */
export type DpmCrossDefinitionReadModelShadowFailure = {
  status: Exclude<DpmCrossDefinitionReadModelSearchResult['status'], 'ready'>
  reason?: string
}

export type DpmCrossDefinitionReadModelShadowParityInput = {
  revisions: readonly DpmAuthoringPublishedRevision[]
  definitionIds: readonly string[]
  query: DpmCrossDefinitionReadModelQuery
  freshnessIdentityByDefinitionId: Readonly<Record<string, string>>
  actual: DpmCrossDefinitionReadModelSearchResult
  pageSize?: number
  expectedFailure?: DpmCrossDefinitionReadModelShadowFailure
}

export type DpmCrossDefinitionReadModelShadowParityIssue = {
  code:
    | 'status'
    | 'reason'
    | 'source'
    | 'result-order'
    | 'identity-parity'
    | 'freshness-parity'
    | 'api-binding-parity'
    | 'cursor-bound'
  message: string
}

export type DpmCrossDefinitionReadModelShadowParityReport = {
  status: 'match' | 'mismatch'
  expectedStatus: DpmCrossDefinitionReadModelSearchResult['status']
  observedStatus: DpmCrossDefinitionReadModelSearchResult['status']
  expectedHitKeys: readonly string[]
  observedHitKeys: readonly string[]
  issues: readonly DpmCrossDefinitionReadModelShadowParityIssue[]
}

const DEFAULT_SHADOW_PAGE_SIZE = 100

export function compareDpmCrossDefinitionReadModelShadow(
  input: DpmCrossDefinitionReadModelShadowParityInput,
): DpmCrossDefinitionReadModelShadowParityReport {
  const pageSize = input.pageSize ?? DEFAULT_SHADOW_PAGE_SIZE
  const issues: DpmCrossDefinitionReadModelShadowParityIssue[] = []

  if (input.expectedFailure) {
    compareFailure(input.actual, input.expectedFailure, issues)
    return createReport(input.actual, input.expectedFailure.status, [], issues)
  }

  const expectedHits = createExpectedHits(input)
  if (expectedHits.sourceMissing.length > 0) {
    issues.push({
      code: 'source',
      message: `missing latest published revision for ${expectedHits.sourceMissing.join(', ')}`,
    })
  }

  if (input.actual.status !== 'ready') {
    issues.push({
      code: 'status',
      message: `expected ready shadow result but observed ${input.actual.status}`,
    })
    return createReport(input.actual, 'ready', expectedHits.hits.map(hit => hit.key), issues)
  }

  const expectedPage = expectedHits.hits.slice(0, pageSize)
  const expectedHasNextCursor = expectedHits.hits.length > pageSize
  const observedHitKeys = input.actual.hits.map(hit => hitKey(hit.definitionId, hit.revisionId, hit.objectId))
  const expectedHitKeys = expectedPage.map(hit => hit.key)

  if (!sameStringArray(observedHitKeys, expectedHitKeys)) {
    issues.push({
      code: 'result-order',
      message: `expected hit order ${expectedHitKeys.join(',')} but observed ${observedHitKeys.join(',')}`,
    })
  }

  if ((input.actual.nextCursor !== undefined) !== expectedHasNextCursor) {
    issues.push({
      code: 'cursor-bound',
      message: `expected nextCursor=${expectedHasNextCursor} but observed ${input.actual.nextCursor !== undefined}`,
    })
  }

  for (let index = 0; index < Math.min(input.actual.hits.length, expectedPage.length); index += 1) {
    const actual = input.actual.hits[index]!
    const expected = expectedPage[index]!
    if (!sameIdentities(actual.identities, expected.identities) ||
      !sameIdentities(actual.matchedIdentities, expected.matchedIdentities)) {
      issues.push({
        code: 'identity-parity',
        message: `identity mismatch for ${expected.key}`,
      })
    }
    if (actual.freshnessIdentity !== expected.freshnessIdentity) {
      issues.push({
        code: 'freshness-parity',
        message: `freshness mismatch for ${expected.key}`,
      })
    }
    if (JSON.stringify(actual.apiBindings) !== JSON.stringify(expected.apiBindings)) {
      issues.push({
        code: 'api-binding-parity',
        message: `API binding mismatch for ${expected.key}`,
      })
    }
  }

  return createReport(input.actual, 'ready', expectedHitKeys, issues, observedHitKeys)
}

type ExpectedHit = {
  key: string
  freshnessIdentity: string
  identities: readonly DpmCrossDefinitionReadModelIdentity[]
  matchedIdentities: readonly DpmCrossDefinitionReadModelIdentity[]
  apiBindings: readonly {
    bindingId: string
    identityKey: string
    direction: DpmAuthoringPublishedRevision['definitions']['apiBindings'][number]['direction']
  }[]
}

function createExpectedHits(input: DpmCrossDefinitionReadModelShadowParityInput): {
  hits: readonly ExpectedHit[]
  sourceMissing: readonly string[]
} {
  const revisions = new Map<string, DpmAuthoringPublishedRevision>()
  for (const revision of input.revisions) {
    const current = revisions.get(revision.definitionId)
    if (!current || isLaterRevision(revision, current)) revisions.set(revision.definitionId, revision)
  }
  const sourceMissing: string[] = []
  const hits: ExpectedHit[] = []

  for (const definitionId of [...new Set(input.definitionIds)].sort()) {
    const revision = revisions.get(definitionId)
    if (!revision) {
      sourceMissing.push(definitionId)
      continue
    }
    const objectIds = matchingObjectIds(revision, input.query)
    const freshnessIdentity = input.freshnessIdentityByDefinitionId[definitionId]
    if (!freshnessIdentity) {
      sourceMissing.push(`${definitionId}:freshness`)
      continue
    }
    for (const objectId of objectIds) {
      const identities = createDpmAuthoringIdentityIndexRows(revision)
        .filter(row => row.objectId === objectId)
        .map(row => ({ identityKind: row.identityKind, identityKey: row.identityKey }))
        .sort(compareIdentities)
      const identityQuery = 'identity' in input.query ? input.query.identity : undefined
      const matchedIdentities = identityQuery
        ? identities.filter(identity => sameIdentity(identity, identityQuery))
        : identities
      const apiBindings = revision.definitions.apiBindings
        .filter(binding => binding.dataField.objectId === objectId)
        .map(binding => ({
          bindingId: binding.bindingId,
          identityKey: binding.targetIdentity,
          direction: binding.direction,
        }))
        .sort((left, right) => left.bindingId.localeCompare(right.bindingId))
      hits.push({
        key: hitKey(revision.definitionId, revision.revisionId, objectId),
        freshnessIdentity,
        identities,
        matchedIdentities,
        apiBindings,
      })
    }
  }

  return {
    hits: Object.freeze(hits.sort((left, right) => left.key.localeCompare(right.key))),
    sourceMissing: Object.freeze(sourceMissing),
  }
}

function matchingObjectIds(
  revision: DpmAuthoringPublishedRevision,
  query: DpmCrossDefinitionReadModelQuery,
): readonly string[] {
  if ('identity' in query) {
    return Object.freeze(createDpmAuthoringIdentityIndexRows(revision)
      .filter(row => sameIdentity(row, query.identity))
      .map(row => row.objectId)
      .filter((objectId, index, all) => all.indexOf(objectId) === index)
      .sort())
  }
  return Object.freeze(lookupDpmAuthoringRevision(revision, { field: query.field })
    .map(match => match.field.objectId)
    .sort())
}

function compareFailure(
  actual: DpmCrossDefinitionReadModelSearchResult,
  expected: DpmCrossDefinitionReadModelShadowFailure,
  issues: DpmCrossDefinitionReadModelShadowParityIssue[],
): void {
  if (actual.status !== expected.status) {
    issues.push({
      code: 'status',
      message: `expected ${expected.status} but observed ${actual.status}`,
    })
    return
  }
  if (expected.reason !== undefined && actual.status === 'invalid-query' && actual.reason !== expected.reason) {
    issues.push({
      code: 'reason',
      message: `expected failure reason ${expected.reason} but observed ${actual.reason}`,
    })
  }
}

function createReport(
  actual: DpmCrossDefinitionReadModelSearchResult,
  expectedStatus: DpmCrossDefinitionReadModelSearchResult['status'],
  expectedHitKeys: readonly string[],
  issues: readonly DpmCrossDefinitionReadModelShadowParityIssue[],
  observedHitKeys: readonly string[] = [],
): DpmCrossDefinitionReadModelShadowParityReport {
  return {
    status: issues.length === 0 ? 'match' : 'mismatch',
    expectedStatus,
    observedStatus: actual.status,
    expectedHitKeys: Object.freeze([...expectedHitKeys]),
    observedHitKeys: Object.freeze([...observedHitKeys]),
    issues: Object.freeze([...issues]),
  }
}

function hitKey(definitionId: string, revisionId: string, objectId: string): string {
  return `${definitionId}/${revisionId}/${objectId}`
}

function sameIdentities(
  left: readonly DpmCrossDefinitionReadModelIdentity[],
  right: readonly DpmCrossDefinitionReadModelIdentity[],
): boolean {
  return left.length === right.length && left.every((identity, index) => sameIdentity(identity, right[index]!))
}

function sameIdentity(
  left: { identityKind: DpmAuthoringIdentityIndexKind; identityKey: string },
  right: DpmCrossDefinitionReadModelIdentity,
): boolean {
  return left.identityKind === right.identityKind && left.identityKey === right.identityKey
}

function compareIdentities(
  left: DpmCrossDefinitionReadModelIdentity,
  right: DpmCrossDefinitionReadModelIdentity,
): number {
  return left.identityKind.localeCompare(right.identityKind) || left.identityKey.localeCompare(right.identityKey)
}

function sameStringArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function isLaterRevision(
  candidate: DpmAuthoringPublishedRevision,
  current: DpmAuthoringPublishedRevision,
): boolean {
  const byCreatedAt = candidate.createdAt.localeCompare(current.createdAt)
  return byCreatedAt > 0 || (byCreatedAt === 0 && candidate.revisionId.localeCompare(current.revisionId) > 0)
}
