import type { CatalogSnapshot } from '../catalog/types.js'
import {
  createDpmIdentityDataDefinitions,
} from '../model/data-identity-normalize.js'
import type {
  DpmIdentityDataDefinitions,
  DpmIdentityDataFieldDeclarationInput,
} from '../model/data-identity-types.js'

/**
 * The external logical-only artifact shape. This is structural on purpose: the
 * canonical DPM owner consumes a checked artifact without importing its private
 * TypeSpec compiler package or taking ownership of its wire format.
 */
export type TypespecLogicalErdArtifact = {
  kind: 'oa-sdk.logical-erd.v1'
  artifactId: string
  entities: readonly {
    id: string
    fields: readonly { id: string; name: string }[]
  }[]
  provenance: readonly TypespecLogicalErdProvenance[]
}

export type TypespecLogicalErdProvenance = {
  subject: `dataset:${string}` | `entity:${string}` | `field:${string}` | `relationship:${string}`
  span: {
    file: string
    line: number
    column: number
    endLine: number
    endColumn: number
  }
  decoratorSpan?: {
    file: string
    line: number
    column: number
    endLine: number
    endColumn: number
  }
}

export type DpmTypespecLogicalErdFieldCoverage =
  | {
      logicalFieldId: string
      kind: 'project'
      /** Every DPM identity and semantic value is owner-supplied, never name-derived. */
      dataField: DpmIdentityDataFieldDeclarationInput
    }
  | {
      logicalFieldId: string
      kind: 'exclude'
      /** An ERD field may be outside DPM policy scope, but omission must be reviewable. */
      reason: string
    }

export type DpmTypespecLogicalErdBridgeInput = {
  artifact: TypespecLogicalErdArtifact
  fields: readonly DpmTypespecLogicalErdFieldCoverage[]
}

export type DpmTypespecLogicalErdBridgeProjection = {
  kind: 'dpm.typespec-logical-erd-bridge.v1'
  artifact: {
    kind: 'oa-sdk.logical-erd.v1'
    artifactId: string
  }
  definitions: DpmIdentityDataDefinitions
  fields: readonly {
    logicalFieldId: string
    kind: 'project' | 'exclude'
    objectId?: string
    reason?: string
    provenance: readonly TypespecLogicalErdProvenance[]
  }[]
}

export type DpmTypespecLogicalErdCatalogEvidenceStatus = 'confirmed' | 'mismatch' | 'unbound' | 'unknown'

export type DpmTypespecLogicalErdCatalogEvidence = {
  artifactId: string
  fields: readonly {
    logicalFieldId: string
    status: DpmTypespecLogicalErdCatalogEvidenceStatus
    reason: string
  }[]
}

/**
 * Projects only explicitly supplied DPM field identities from a checked logical
 * ERD artifact. It is pure: it neither persists DPM data nor mutates a catalog.
 */
export function createDpmTypespecLogicalErdBridgeProjection(
  input: DpmTypespecLogicalErdBridgeInput,
): DpmTypespecLogicalErdBridgeProjection {
  assertArtifact(input.artifact)
  const artifactFieldIds = new Set(input.artifact.entities.flatMap(entity => entity.fields.map(field => field.id)))
  assertCompleteFieldCoverage(artifactFieldIds, input.fields)

  const projectedFields = input.fields
    .filter((coverage): coverage is Extract<DpmTypespecLogicalErdFieldCoverage, { kind: 'project' }> => coverage.kind === 'project')
    .map(coverage => coverage.dataField)
  const definitions = createDpmIdentityDataDefinitions({ version: '1.1', fields: projectedFields })
  const provenance = new Map<string, TypespecLogicalErdProvenance[]>()
  for (const entry of input.artifact.provenance) {
    if (!entry.subject.startsWith('field:')) continue
    const fieldId = entry.subject.slice('field:'.length)
    provenance.set(fieldId, [...(provenance.get(fieldId) ?? []), copyProvenance(entry)])
  }

  const fields = input.fields
    .map(coverage => {
      const entries = provenance.get(coverage.logicalFieldId) ?? []
      if (coverage.kind === 'project' && entries.length === 0) {
        throw new Error(`Projected logical ERD field ${coverage.logicalFieldId} has no TypeSpec provenance.`)
      }
      return {
        logicalFieldId: coverage.logicalFieldId,
        kind: coverage.kind,
        ...(coverage.kind === 'project' ? { objectId: coverage.dataField.objectId } : {}),
        ...(coverage.kind === 'exclude' ? { reason: requireNonEmpty(coverage.reason, `Excluded logical ERD field ${coverage.logicalFieldId} reason`) } : {}),
        provenance: entries,
      }
    })
    .sort((left, right) => left.logicalFieldId.localeCompare(right.logicalFieldId))

  return freezeDeep({
    kind: 'dpm.typespec-logical-erd-bridge.v1',
    artifact: { kind: input.artifact.kind, artifactId: input.artifact.artifactId },
    definitions,
    fields,
  })
}

/**
 * Compares projected persisted fields against an optional read-only catalog
 * snapshot. The caller supplies the snapshot identity because a catalog's
 * freshness hash alone is not a stable snapshot ID.
 */
export function inspectDpmTypespecLogicalErdCatalogEvidence(input: {
  projection: DpmTypespecLogicalErdBridgeProjection
  catalog?: { snapshotId: string; snapshot: CatalogSnapshot }
}): DpmTypespecLogicalErdCatalogEvidence {
  const projectedByObjectId = new Map(input.projection.definitions.fields.map(field => [field.objectId, field]))
  const fields = input.projection.fields
    .map(coverage => {
      if (coverage.kind === 'exclude') return { logicalFieldId: coverage.logicalFieldId, status: 'unbound' as const, reason: coverage.reason ?? 'Excluded from DPM policy scope.' }
      const field = coverage.objectId ? projectedByObjectId.get(coverage.objectId) : undefined
      if (!field) throw new Error(`Projected logical ERD field ${coverage.logicalFieldId} has no DPM field projection.`)
      if (field.origin !== 'persisted') return { logicalFieldId: coverage.logicalFieldId, status: 'unbound' as const, reason: `DPM origin ${field.origin} intentionally has no storage binding.` }
      if (!input.catalog) return { logicalFieldId: coverage.logicalFieldId, status: 'unknown' as const, reason: 'No read-only catalog snapshot was supplied.' }
      const storage = field.storageRef
      if (!storage) return { logicalFieldId: coverage.logicalFieldId, status: 'mismatch' as const, reason: 'Persisted DPM field has no storage reference.' }
      if (storage.catalog.snapshotId !== input.catalog.snapshotId) {
        return { logicalFieldId: coverage.logicalFieldId, status: 'mismatch' as const, reason: `Storage snapshot ${storage.catalog.snapshotId} differs from selected ${input.catalog.snapshotId}.` }
      }
      if (storage.catalog.versionHash !== input.catalog.snapshot.freshness.versionHash) {
        return { logicalFieldId: coverage.logicalFieldId, status: 'mismatch' as const, reason: `Storage freshness ${storage.catalog.versionHash} differs from selected ${input.catalog.snapshot.freshness.versionHash}.` }
      }
      const columnExists = input.catalog.snapshot.columns.some(column => column.table === storage.table && column.name === storage.column)
      const column = input.catalog.snapshot.columns.find(candidate => candidate.table === storage.table && candidate.name === storage.column)
      if (!columnExists || !column) {
        return { logicalFieldId: coverage.logicalFieldId, status: 'mismatch' as const, reason: `Catalog snapshot does not contain ${storage.table}#${storage.column}.` }
      }
      if (storage.catalog.sourceCoordinate && stableStringify(storage.catalog.sourceCoordinate) !== stableStringify(column.source)) {
        return { logicalFieldId: coverage.logicalFieldId, status: 'mismatch' as const, reason: `Catalog source coordinate does not match ${storage.table}#${storage.column}.` }
      }
      return { logicalFieldId: coverage.logicalFieldId, status: 'confirmed' as const, reason: 'Catalog snapshot confirms the storage table and column.' }
    })
    .sort((left, right) => left.logicalFieldId.localeCompare(right.logicalFieldId))

  return freezeDeep({ artifactId: input.projection.artifact.artifactId, fields })
}

function assertArtifact(artifact: TypespecLogicalErdArtifact): void {
  if (artifact.kind !== 'oa-sdk.logical-erd.v1') throw new Error(`Expected oa-sdk.logical-erd.v1 artifact, received ${artifact.kind}.`)
  requireNonEmpty(artifact.artifactId, 'Logical ERD artifact id')
  const seen = new Set<string>()
  for (const field of artifact.entities.flatMap(entity => entity.fields)) {
    requireNonEmpty(field.id, 'Logical ERD field id')
    if (seen.has(field.id)) throw new Error(`Logical ERD artifact contains duplicate field id ${field.id}.`)
    seen.add(field.id)
  }
}

function assertCompleteFieldCoverage(fieldIds: ReadonlySet<string>, coverage: readonly DpmTypespecLogicalErdFieldCoverage[]): void {
  const seen = new Set<string>()
  for (const entry of coverage) {
    if (!fieldIds.has(entry.logicalFieldId)) throw new Error(`DPM bridge references unknown logical ERD field ${entry.logicalFieldId}.`)
    if (seen.has(entry.logicalFieldId)) throw new Error(`DPM bridge has duplicate coverage for logical ERD field ${entry.logicalFieldId}.`)
    seen.add(entry.logicalFieldId)
  }
  for (const fieldId of fieldIds) {
    if (!seen.has(fieldId)) throw new Error(`DPM bridge requires explicit coverage for logical ERD field ${fieldId}.`)
  }
}

function requireNonEmpty(value: string, label: string): string {
  if (!value) throw new Error(`${label} must not be empty.`)
  return value
}

function copyProvenance(entry: TypespecLogicalErdProvenance): TypespecLogicalErdProvenance {
  return {
    subject: entry.subject,
    span: { ...entry.span },
    ...(entry.decoratorSpan ? { decoratorSpan: { ...entry.decoratorSpan } } : {}),
  }
}

function freezeDeep<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value as Record<string, unknown>)) freezeDeep(child)
  return Object.freeze(value)
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value)) ?? 'null'
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    const next = (value as Record<string, unknown>)[key]
    if (next !== undefined) sorted[key] = sortValue(next)
  }
  return sorted
}
