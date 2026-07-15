import type {
  DpmDataFieldLocator,
  DpmEntityRef,
  DpmIdentityDataFieldDeclaration,
} from '../model/data-identity-types.js'
import { createDpmAuthoringIdentityIndexRows } from './postgres.js'
import { matchesDpmAuthoringLookup } from './query.js'
import type {
  DpmAuthoringFieldLookup,
  DpmAuthoringIdentityIndexKind,
  DpmAuthoringPublishedRevision,
} from './types.js'

/**
 * Reference-only states for the deferred cross-definition projection.
 * This module is intentionally not exported from the package public seam.
 */
export type DpmCrossDefinitionReadModelGenerationState = 'building' | 'ready' | 'stale' | 'failed'

export type DpmCrossDefinitionReadModelIdentity = {
  identityKind: DpmAuthoringIdentityIndexKind
  identityKey: string
}

export type DpmCrossDefinitionReadModelApiBinding = {
  bindingId: string
  identityKey: string
  direction: DpmAuthoringPublishedRevision['definitions']['apiBindings'][number]['direction']
}

export type DpmCrossDefinitionReadModelRow = {
  definitionId: string
  revisionId: string
  objectId: string
  freshnessIdentity: string
  field: {
    entity: DpmEntityRef
    locator: DpmDataFieldLocator
    name: string
    type: DpmIdentityDataFieldDeclaration['type']
    origin: DpmIdentityDataFieldDeclaration['origin']
    lifecycle: NonNullable<DpmIdentityDataFieldDeclaration['lifecycle']>
  }
  identities: readonly DpmCrossDefinitionReadModelIdentity[]
  apiBindings: readonly DpmCrossDefinitionReadModelApiBinding[]
}

export type DpmCrossDefinitionReadModelHit = DpmCrossDefinitionReadModelRow & {
  matchedIdentities: readonly DpmCrossDefinitionReadModelIdentity[]
}

export type DpmCrossDefinitionReadModelQuery =
  | {
      identity: DpmCrossDefinitionReadModelIdentity
    }
  | {
      field: DpmAuthoringFieldLookup
    }

export type DpmCrossDefinitionReadModelSearchInput = {
  definitionIds?: readonly string[]
  query: DpmCrossDefinitionReadModelQuery
  pageSize?: number
  cursor?: string
}

export type DpmCrossDefinitionReadModelSearchResult =
  | {
      status: 'ready'
      hits: readonly DpmCrossDefinitionReadModelHit[]
      nextCursor?: string
    }
  | {
      status: 'read-model-unavailable'
    }
  | {
      status: 'forbidden'
    }
  | {
      status: 'invalid-query'
      reason: string
    }

export type DpmCrossDefinitionReadModelAuthorization = (input: {
  requestedDefinitionIds?: readonly string[]
}) => {
  allowed: boolean
  definitionIds: readonly string[]
}

export type DpmCrossDefinitionReadModelReference = {
  upsert(input: {
    revision: DpmAuthoringPublishedRevision
    freshnessIdentity: string
    state?: DpmCrossDefinitionReadModelGenerationState
  }): void
  setGenerationState(input: {
    definitionId: string
    revisionId: string
    state: DpmCrossDefinitionReadModelGenerationState
  }): void
  search(input: DpmCrossDefinitionReadModelSearchInput): DpmCrossDefinitionReadModelSearchResult
}

export type DpmCrossDefinitionReadModelReferenceOptions = {
  authorization?: DpmCrossDefinitionReadModelAuthorization
}

type InternalRow = {
  field: DpmIdentityDataFieldDeclaration
  row: DpmCrossDefinitionReadModelRow
}

type InternalGeneration = {
  definitionId: string
  revisionId: string
  createdAt: string
  freshnessIdentity: string
  state: DpmCrossDefinitionReadModelGenerationState
  rows: readonly InternalRow[]
}

type CursorKey = [string, string, string, DpmAuthoringIdentityIndexKind, string]

const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100

export function projectDpmCrossDefinitionReadModelRows(
  revision: DpmAuthoringPublishedRevision,
  freshnessIdentity: string,
): readonly DpmCrossDefinitionReadModelRow[] {
  requireNonEmpty(freshnessIdentity, 'freshnessIdentity')

  const indexRowsByObjectId = new Map<string, ReturnType<typeof createDpmAuthoringIdentityIndexRows>>()
  for (const row of createDpmAuthoringIdentityIndexRows(revision)) {
    const rows = indexRowsByObjectId.get(row.objectId) ?? []
    indexRowsByObjectId.set(row.objectId, [...rows, row])
  }

  const bindingsByObjectId = new Map<string, DpmCrossDefinitionReadModelApiBinding[]>()
  for (const binding of revision.definitions.apiBindings) {
    const bindings = bindingsByObjectId.get(binding.dataField.objectId) ?? []
    bindingsByObjectId.set(binding.dataField.objectId, [...bindings, {
      bindingId: binding.bindingId,
      identityKey: binding.targetIdentity,
      direction: binding.direction,
    }])
  }

  const rows = revision.definitions.fields.map(field => {
    const identities = (indexRowsByObjectId.get(field.objectId) ?? [])
      .map(row => ({ identityKind: row.identityKind, identityKey: row.identityKey }))
      .sort(compareIdentities)
    const apiBindings = (bindingsByObjectId.get(field.objectId) ?? [])
      .sort((left, right) => left.bindingId.localeCompare(right.bindingId))

    return freezeDeep({
      definitionId: revision.definitionId,
      revisionId: revision.revisionId,
      objectId: field.objectId,
      freshnessIdentity,
      field: {
        entity: { ...field.entity },
        locator: { ...field.locator },
        name: field.name,
        type: field.type,
        origin: field.origin,
        lifecycle: field.lifecycle ?? 'active',
      },
      identities,
      apiBindings,
    })
  })

  return Object.freeze(rows.sort((left, right) => left.objectId.localeCompare(right.objectId)))
}

export function createDpmCrossDefinitionReadModelReference(
  options: DpmCrossDefinitionReadModelReferenceOptions = {},
): DpmCrossDefinitionReadModelReference {
  const generations = new Map<string, Map<string, InternalGeneration>>()
  const authorization = options.authorization ?? (() => ({ allowed: false, definitionIds: [] }))

  return {
    upsert(input) {
      const rows = projectDpmCrossDefinitionReadModelRows(input.revision, input.freshnessIdentity)
      const byRevision = generations.get(input.revision.definitionId) ?? new Map<string, InternalGeneration>()
      byRevision.set(input.revision.revisionId, {
        definitionId: input.revision.definitionId,
        revisionId: input.revision.revisionId,
        createdAt: input.revision.createdAt,
        freshnessIdentity: input.freshnessIdentity,
        state: input.state ?? 'building',
        rows: Object.freeze(rows.map(row => ({
          field: input.revision.definitions.fields.find(field => field.objectId === row.objectId)!,
          row,
        }))),
      })
      generations.set(input.revision.definitionId, byRevision)
    },
    setGenerationState(input) {
      const generation = generations.get(input.definitionId)?.get(input.revisionId)
      if (!generation) {
        throw new Error(`read-model generation not found: ${input.definitionId}/${input.revisionId}`)
      }
      generation.state = input.state
    },
    search(input) {
      const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE
      if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
        return { status: 'invalid-query', reason: `pageSize must be an integer from 1 to ${MAX_PAGE_SIZE}` }
      }

      const queryValidation = validateQuery(input.query)
      if (queryValidation) return { status: 'invalid-query', reason: queryValidation }
      if ('field' in input.query && input.definitionIds === undefined) {
        return { status: 'invalid-query', reason: 'field query requires an explicit definition scope' }
      }

      const decision = input.definitionIds === undefined
        ? authorization({})
        : authorization({ requestedDefinitionIds: input.definitionIds })
      if (!decision.allowed) return { status: 'forbidden' }
      const definitionIds = [...new Set(decision.definitionIds)].sort()
      if (definitionIds.length === 0) return { status: 'forbidden' }

      const currentGenerations: InternalGeneration[] = []
      for (const definitionId of definitionIds) {
        const generation = latestGeneration(generations.get(definitionId))
        if (!generation || generation.state !== 'ready') return { status: 'read-model-unavailable' }
        currentGenerations.push(generation)
      }

      let candidates = currentGenerations.flatMap(generation => generation.rows)
        .filter(candidate => matchesQuery(candidate, input.query))
        .map(candidate => ({
          candidate,
          matchedIdentities: matchedIdentities(candidate, input.query),
        }))
        .sort((left, right) => compareCursorKeys(
          createCursorKey(left.candidate.row, left.matchedIdentities),
          createCursorKey(right.candidate.row, right.matchedIdentities),
        ))

      if (input.cursor !== undefined) {
        const cursor = decodeCursor(input.cursor)
        if (!cursor) return { status: 'invalid-query', reason: 'cursor is invalid' }
        candidates = candidates.filter(candidate => compareCursorKeys(
          createCursorKey(candidate.candidate.row, candidate.matchedIdentities),
          cursor,
        ) > 0)
      }

      const page = candidates.slice(0, pageSize)
      const last = page.at(-1)
      const nextCursor = last && candidates.length > pageSize
        ? encodeCursor(createCursorKey(last.candidate.row, last.matchedIdentities))
        : undefined

      return {
        status: 'ready',
        hits: Object.freeze(page.map(candidate => freezeDeep({
          ...candidate.candidate.row,
          matchedIdentities: candidate.matchedIdentities,
        }))),
        ...(nextCursor === undefined ? {} : { nextCursor }),
      }
    },
  }
}

function matchesQuery(
  candidate: InternalRow,
  query: DpmCrossDefinitionReadModelQuery,
): boolean {
  if ('identity' in query) {
    return candidate.row.identities.some(identity =>
      identity.identityKind === query.identity.identityKind && identity.identityKey === query.identity.identityKey)
  }
  return matchesDpmAuthoringLookup(candidate.field, [], { field: query.field })
}

function matchedIdentities(
  candidate: InternalRow,
  query: DpmCrossDefinitionReadModelQuery,
): readonly DpmCrossDefinitionReadModelIdentity[] {
  if ('identity' in query) {
    return Object.freeze(candidate.row.identities.filter(identity =>
      identity.identityKind === query.identity.identityKind && identity.identityKey === query.identity.identityKey))
  }
  return candidate.row.identities
}

function validateQuery(query: DpmCrossDefinitionReadModelQuery): string | undefined {
  if ('identity' in query) {
    if (!query.identity.identityKey) return 'identityKey must be non-empty'
    return undefined
  }

  const field = query.field
  if (!field || Object.keys(field).length === 0) {
    return 'field query must include at least one bounded predicate'
  }
  return undefined
}

function latestGeneration(
  byRevision: Map<string, InternalGeneration> | undefined,
): InternalGeneration | undefined {
  return [...(byRevision?.values() ?? [])].sort((left, right) => {
    const byCreatedAt = right.createdAt.localeCompare(left.createdAt)
    return byCreatedAt || right.revisionId.localeCompare(left.revisionId)
  })[0]
}

function createCursorKey(
  row: DpmCrossDefinitionReadModelRow,
  identities: readonly DpmCrossDefinitionReadModelIdentity[],
): CursorKey {
  const identity = identities[0] ?? { identityKind: 'object' as const, identityKey: '' }
  return [row.definitionId, row.revisionId, row.objectId, identity.identityKind, identity.identityKey]
}

function compareCursorKeys(left: CursorKey, right: CursorKey): number {
  for (let index = 0; index < left.length; index += 1) {
    const comparison = left[index]!.localeCompare(right[index]!)
    if (comparison !== 0) return comparison
  }
  return 0
}

function encodeCursor(cursor: CursorKey): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

function decodeCursor(value: string): CursorKey | undefined {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as unknown
    if (!Array.isArray(parsed) || parsed.length !== 5 || parsed.some(item => typeof item !== 'string')) return undefined
    return parsed as CursorKey
  } catch {
    return undefined
  }
}

function compareIdentities(
  left: DpmCrossDefinitionReadModelIdentity,
  right: DpmCrossDefinitionReadModelIdentity,
): number {
  return left.identityKind.localeCompare(right.identityKind) || left.identityKey.localeCompare(right.identityKey)
}

function requireNonEmpty(value: string, label: string): void {
  if (!value) throw new Error(`${label} must be non-empty`)
}

function freezeDeep<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value as Record<string, unknown>)) freezeDeep(child)
  return Object.freeze(value)
}
