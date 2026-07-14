import { createHash } from 'node:crypto'

import type { CatalogSnapshot } from '../catalog/types.js'
import {
  createDpmDataFieldLocator,
  createDpmIdentityDatabaseColumnIdentity,
  createDpmIdentityDataDefinitions,
} from '../model/data-identity-normalize.js'
import type {
  DpmCatalogSnapshotRef,
  DpmDataSourceCoordinate,
  DpmIdentityDataDefinitions,
} from '../model/data-identity-types.js'
import type {
  DpmDataBindingApiArtifactFreshness,
  DpmDataBindingApiArtifactLink,
  DpmDataBindingBehaviorTraceLink,
  DpmDataBindingFreshness,
  DpmDataBindingReviewLink,
  DpmNeutralDataBindingApiBinding,
  DpmNeutralDataBindingArtifact,
  DpmNeutralDataBindingField,
  DpmNeutralDataBindingProvenance,
  DpmNeutralDataBindingStorage,
} from '../model/data-artifact-types.js'
import {
  computeDpmApiArtifactVersionHash,
  readDpmIdentityDataDefinitions,
} from '../validator/data-binding-validator.js'
import type { DpmApiArtifactInput } from '../validator/data-binding-types.js'
import { asRecord, asString } from '../validator/value-utils.js'

export function createDpmNeutralDataBindingArtifact(input: {
  manifest: Record<string, unknown>
  catalog: CatalogSnapshot
  apiArtifacts?: readonly DpmApiArtifactInput[]
  behaviorTraceLinks?: readonly DpmDataBindingBehaviorTraceLink[]
  reviewLinks?: readonly DpmDataBindingReviewLink[]
}): DpmNeutralDataBindingArtifact | undefined {
  const wire = asRecord(input.manifest.data_definitions)
  if (asString(wire.version) !== '1.1') return undefined

  const definitions = createDpmIdentityDataDefinitions(readDpmIdentityDataDefinitions(wire))
  const fields = definitions.fields
    .map(field => toNeutralField(field))
    .sort((left, right) => left.objectId.localeCompare(right.objectId))
  const fieldByObjectId = new Map(fields.map(field => [field.objectId, field]))
  const apiArtifacts = new Map<string, DpmApiArtifactInput>()
  for (const artifact of input.apiArtifacts ?? []) {
    if (!apiArtifacts.has(artifact.artifactId)) apiArtifacts.set(artifact.artifactId, artifact)
  }

  const apiBindings = definitions.apiBindings
    .map(binding => {
      const field = fieldByObjectId.get(binding.dataField.objectId)
      if (!field) {
        throw new Error(`neutral data binding artifact references unknown objectId ${binding.dataField.objectId}`)
      }
      return {
        identity: binding.identity,
        bindingId: binding.bindingId,
        dataField: {
          objectId: binding.dataField.objectId,
          revisionId: binding.dataField.revisionId,
          identity: field.identity,
        },
        api: {
          ...binding.api,
          identity: binding.targetIdentity,
        },
        direction: binding.direction,
        targetIdentity: binding.targetIdentity,
      } satisfies DpmNeutralDataBindingApiBinding
    })
    .sort((left, right) => left.bindingId.localeCompare(right.bindingId))

  const catalogSnapshots = collectCatalogSnapshots(input.manifest, input.catalog, definitions)
  const apiArtifactLinks = collectApiArtifactLinks(definitions, apiArtifacts)
  const provenance: DpmNeutralDataBindingProvenance = {
    apiArtifacts: apiArtifactLinks,
    catalogSnapshots,
    behaviorTraces: copyBehaviorTraceLinks(input.behaviorTraceLinks ?? []),
    reviews: copyReviewLinks(input.reviewLinks ?? []),
  }
  const apiArtifactFreshness = apiArtifactLinks
    .map(link => ({
      artifactId: link.artifactId,
      versionHash: link.versionHash,
      ...(apiArtifacts.get(link.artifactId)?.provenance?.versionHash
        ? { provenanceVersionHash: apiArtifacts.get(link.artifactId)!.provenance!.versionHash }
        : {}),
    } satisfies DpmDataBindingApiArtifactFreshness))
    .sort((left, right) => left.artifactId.localeCompare(right.artifactId))
  const identityHash = hashPayload({
    dataDefinitionVersion: '1.1',
    catalogSnapshots,
    apiArtifacts: apiArtifactFreshness,
    fields,
    apiBindings,
    provenance,
  })
  const freshness: DpmDataBindingFreshness = {
    dataDefinitionVersion: '1.1',
    catalogSnapshots,
    apiArtifacts: apiArtifactFreshness,
    identityHash,
  }
  const artifact: DpmNeutralDataBindingArtifact = {
    kind: 'dpm.data-binding-artifact.v1',
    version: '1.0',
    identity: `dpm.data-binding-artifact:${identityHash}`,
    freshness,
    fields,
    apiBindings,
    provenance,
  }

  return freezeDeep(artifact)
}

function toNeutralField(field: DpmIdentityDataDefinitions['fields'][number]): DpmNeutralDataBindingField {
  const locator = createDpmDataFieldLocator(field.locator)
  const storage = field.storageRef
    ? {
        identity: createDpmIdentityDatabaseColumnIdentity(field.storageRef),
        table: field.storageRef.table,
        column: field.storageRef.column,
        catalog: copyCatalogSnapshotRef(field.storageRef.catalog),
      } satisfies DpmNeutralDataBindingStorage
    : undefined

  return {
    identity: field.identity,
    objectId: field.objectId,
    revisionId: field.revisionId,
    locator,
    entity: { ...field.entity },
    name: field.name,
    type: field.type,
    origin: field.origin,
    ...(field.nullable === undefined ? {} : { nullable: field.nullable }),
    ...(field.description === undefined ? {} : { description: field.description }),
    lifecycle: field.lifecycle ?? 'active',
    aliases: [...(field.aliases ?? [])],
    ...(field.supersededByObjectId === undefined ? {} : { supersededByObjectId: field.supersededByObjectId }),
    ...(storage ? { storage } : {}),
  }
}

function collectCatalogSnapshots(
  manifest: Record<string, unknown>,
  catalog: CatalogSnapshot,
  definitions: DpmIdentityDataDefinitions,
): DpmCatalogSnapshotRef[] {
  const refs = definitions.fields
    .flatMap(field => field.storageRef ? [copyCatalogSnapshotRef(field.storageRef.catalog)] : [])
  const manifestCatalog = asRecord(manifest.catalog)
  const selectedSnapshotId = asString(manifestCatalog.snapshot_ref) || 'selected-catalog'
  refs.push({
    snapshotId: selectedSnapshotId,
    versionHash: catalog.freshness.versionHash,
  })
  const unique = new Map<string, DpmCatalogSnapshotRef>()
  for (const ref of refs) {
    const key = `${ref.snapshotId}@${ref.versionHash}`
    if (!unique.has(key)) unique.set(key, ref)
  }
  return [...unique.values()].sort((left, right) => {
    const leftKey = `${left.snapshotId}@${left.versionHash}`
    const rightKey = `${right.snapshotId}@${right.versionHash}`
    return leftKey.localeCompare(rightKey)
  })
}

function collectApiArtifactLinks(
  definitions: DpmIdentityDataDefinitions,
  apiArtifacts: ReadonlyMap<string, DpmApiArtifactInput>,
): DpmDataBindingApiArtifactLink[] {
  const unique = new Map<string, DpmDataBindingApiArtifactLink>()
  for (const binding of definitions.apiBindings) {
    const artifact = apiArtifacts.get(binding.api.artifactId)
    if (!artifact) {
      throw new Error(`neutral data binding artifact is missing API artifact ${binding.api.artifactId}`)
    }
    const versionHash = computeDpmApiArtifactVersionHash(artifact.document)
    if (!unique.has(binding.api.artifactId)) {
      unique.set(binding.api.artifactId, {
        artifactId: binding.api.artifactId,
        versionHash,
        ...(artifact.provenance?.sourceCoordinate
          ? { sourceCoordinate: copySourceCoordinate(artifact.provenance.sourceCoordinate) }
          : {}),
      })
    }
  }
  return [...unique.values()].sort((left, right) => left.artifactId.localeCompare(right.artifactId))
}

function copyCatalogSnapshotRef(ref: DpmCatalogSnapshotRef): DpmCatalogSnapshotRef {
  return {
    snapshotId: ref.snapshotId,
    versionHash: ref.versionHash,
    ...(ref.sourceCoordinate ? { sourceCoordinate: copySourceCoordinate(ref.sourceCoordinate) } : {}),
  }
}

function copySourceCoordinate(source: DpmDataSourceCoordinate): DpmDataSourceCoordinate {
  return source.kind === 'file'
    ? {
        kind: 'file',
        filePath: source.filePath,
        pointer: source.pointer,
        ...(source.line === undefined ? {} : { line: source.line }),
        ...(source.column === undefined ? {} : { column: source.column }),
      }
    : {
        kind: 'db',
        entity: source.entity,
        id: source.id,
        pointer: source.pointer,
      }
}

function copyBehaviorTraceLinks(
  links: readonly DpmDataBindingBehaviorTraceLink[],
): DpmDataBindingBehaviorTraceLink[] {
  return [...links]
    .map(link => ({
      behaviorId: link.behaviorId,
      ...(link.traceId === undefined ? {} : { traceId: link.traceId }),
      ...(link.correlationId === undefined ? {} : { correlationId: link.correlationId }),
      ...(link.recordRef === undefined ? {} : { recordRef: link.recordRef }),
      ...(link.sourceCoordinate ? { sourceCoordinate: copySourceCoordinate(link.sourceCoordinate) } : {}),
    }))
    .sort((left, right) => left.behaviorId.localeCompare(right.behaviorId))
}

function copyReviewLinks(links: readonly DpmDataBindingReviewLink[]): DpmDataBindingReviewLink[] {
  return [...links]
    .map(link => ({
      reviewId: link.reviewId,
      ...(link.recordRef === undefined ? {} : { recordRef: link.recordRef }),
      ...(link.sourceCoordinate ? { sourceCoordinate: copySourceCoordinate(link.sourceCoordinate) } : {}),
    }))
    .sort((left, right) => left.reviewId.localeCompare(right.reviewId))
}

function hashPayload(value: unknown): string {
  return `sha256:${createHash('sha256').update(stableStringify(value)).digest('hex')}`
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

function freezeDeep<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value as Record<string, unknown>)) freezeDeep(child)
  return Object.freeze(value)
}
