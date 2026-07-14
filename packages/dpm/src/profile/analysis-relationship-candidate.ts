import type { SchemaSourceCoordinate } from '@oa-sdk/openapi-projection-contract'

import type { RelationshipDiscoveryEndpoint } from '../discovery/discovery-endpoint-types.js'
import type { RelationshipCandidateInput } from '../discovery/discovery-relationship-candidate-types.js'
import type { DiscoveryRelationshipCandidateType } from '../discovery/discovery-taxonomy.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'
import type { DpmProfileRelationshipHintProposal } from './analysis-relationship-hint-types.js'
import type { DpmProfileNode } from './profile-graph-types.js'
import type { DpmProfileCoordinate } from './profile-source-types.js'

export type DpmProfileRelationshipCandidateBridgeInput = {
  profileArtifact: DpmProfileArtifact
  relationshipHint: DpmProfileRelationshipHintProposal
  relationshipName: string
  parent: RelationshipDiscoveryEndpoint
  child: RelationshipDiscoveryEndpoint
  type?: DiscoveryRelationshipCandidateType
  candidateId?: string
  confidenceScore?: number
  warnings?: string[]
}

export type DpmProfileRelationshipEndpointResolverOptions = {
  childTable?: string
  childTableBySourceId?: Record<string, string>
  childTableByPathPrefix?: Record<string, string>
  targetCatalogAuthority?: string
}

export type DpmProfileRelationshipEndpointResolverInput = {
  profileArtifact: DpmProfileArtifact
  relationshipHint: DpmProfileRelationshipHintProposal
} & DpmProfileRelationshipEndpointResolverOptions

export type DpmProfileRelationshipEndpointResolution = {
  parent: RelationshipDiscoveryEndpoint
  child: RelationshipDiscoveryEndpoint
  warnings: string[]
  targetRef?: DpmProfileRelationshipTargetRefResolution
}

export type DpmProfileRelationshipTargetRefResolution = {
  endpointRef: string
  catalogAuthority?: string
}

export type DpmProfileResolvedRelationshipCandidateBridgeInput =
  Omit<DpmProfileRelationshipCandidateBridgeInput, 'parent' | 'child'>
  & DpmProfileRelationshipEndpointResolverOptions

export function resolveDpmRelationshipCandidateEndpointsFromProfileHint(
  input: DpmProfileRelationshipEndpointResolverInput,
): DpmProfileRelationshipEndpointResolution {
  const sourceNode = findRelationshipHintSourceNode(input.profileArtifact, input.relationshipHint)
  const targetRef = parseRelationshipHintTargetEndpoint({
    relationshipHint: input.relationshipHint,
    ...(input.targetCatalogAuthority ? { expectedCatalogAuthority: input.targetCatalogAuthority } : {}),
  })
  const childTable = resolveRelationshipHintChildTable(input, sourceNode.coordinate)
  const childColumn = resolveProfileCoordinateColumn(input.relationshipHint, sourceNode.coordinate)

  return {
    parent: targetRef.endpoint,
    child: {
      table: childTable,
      columns: [childColumn],
    },
    warnings: targetRef.warnings,
    targetRef: targetRef.resolution,
  }
}

export function createDpmRelationshipCandidateInputFromResolvedProfileHint(
  input: DpmProfileResolvedRelationshipCandidateBridgeInput,
): RelationshipCandidateInput {
  const resolution = resolveDpmRelationshipCandidateEndpointsFromProfileHint(input)

  return createDpmRelationshipCandidateInputFromProfileHint({
    ...input,
    parent: resolution.parent,
    child: resolution.child,
    warnings: [...resolution.warnings, ...(input.warnings ?? [])],
  })
}

export function createDpmRelationshipCandidateInputFromProfileHint(
  input: DpmProfileRelationshipCandidateBridgeInput,
): RelationshipCandidateInput {
  const sourceNode = findRelationshipHintSourceNode(input.profileArtifact, input.relationshipHint)
  const hintNode = input.relationshipHint.hintNodeId
    ? input.profileArtifact.nodes.find(node => node.id === input.relationshipHint.hintNodeId)
    : undefined
  const confidenceScore = input.confidenceScore ?? input.relationshipHint.confidence
  const targetRefMetadata = targetRefMetadataForCandidate(input.relationshipHint.targetRef)

  return {
    id: input.candidateId ?? `candidate:profile:${toIdentifier(input.relationshipHint.id)}`,
    relationshipName: input.relationshipName,
    type: input.type ?? 'one_to_many',
    parent: copyEndpoint(input.parent),
    child: copyEndpoint(input.child),
    confidenceScore,
    evidence: [{
      kind: 'service_code_hint',
      score: confidenceScore,
      message: input.relationshipHint.explanation,
      source: toRelationshipHintSourceCoordinate(input.relationshipHint, sourceNode.coordinate),
      metadata: {
        profileId: input.profileArtifact.profileId,
        profileVersion: input.profileArtifact.profileVersion,
        datasetId: input.profileArtifact.datasetId,
        relationshipHintId: input.relationshipHint.id,
        relationshipHintSource: input.relationshipHint.source,
        fromNodeId: input.relationshipHint.fromNodeId,
        ...(input.relationshipHint.hintNodeId ? { hintNodeId: input.relationshipHint.hintNodeId } : {}),
        ...(input.relationshipHint.targetRef ? { targetRef: input.relationshipHint.targetRef } : {}),
        ...(targetRefMetadata ? targetRefMetadata : {}),
        evidenceIds: [...input.relationshipHint.evidenceIds].sort(),
        sourceCoordinate: copyProfileCoordinate(sourceNode.coordinate),
        ...(hintNode ? { hintCoordinate: copyProfileCoordinate(hintNode.coordinate) } : {}),
      },
    }],
    warnings: [...(input.warnings ?? [])].sort(),
  }
}

function findRelationshipHintSourceNode(
  profileArtifact: DpmProfileArtifact,
  relationshipHint: DpmProfileRelationshipHintProposal,
): DpmProfileNode {
  const sourceNode = profileArtifact.nodes.find(node => node.id === relationshipHint.fromNodeId)
  if (!sourceNode) {
    throw new Error(`Profile relationship hint ${relationshipHint.id} references missing source node ${relationshipHint.fromNodeId}.`)
  }

  return sourceNode
}

function copyEndpoint(endpoint: RelationshipDiscoveryEndpoint): RelationshipDiscoveryEndpoint {
  return {
    table: endpoint.table,
    columns: [...endpoint.columns],
  }
}

function toRelationshipHintSourceCoordinate(
  relationshipHint: DpmProfileRelationshipHintProposal,
  coordinate: DpmProfileCoordinate,
): SchemaSourceCoordinate {
  return {
    kind: 'db',
    entity: 'profile_relationship_hint',
    id: relationshipHint.id,
    pointer: coordinate.pointer ?? coordinate.path,
  }
}

function copyProfileCoordinate(coordinate: DpmProfileCoordinate): DpmProfileCoordinate {
  return {
    kind: coordinate.kind,
    path: coordinate.path,
    ...(coordinate.sourceId ? { sourceId: coordinate.sourceId } : {}),
    ...(coordinate.pointer ? { pointer: coordinate.pointer } : {}),
    ...(coordinate.externalId ? { externalId: coordinate.externalId } : {}),
  }
}

function parseRelationshipHintTargetEndpoint(input: {
  relationshipHint: DpmProfileRelationshipHintProposal
  expectedCatalogAuthority?: string
}): {
  endpoint: RelationshipDiscoveryEndpoint
  resolution: DpmProfileRelationshipTargetRefResolution
  warnings: string[]
} {
  const { relationshipHint } = input
  const targetRef = relationshipHint.targetRef?.trim()
  if (!targetRef) {
    throw new Error(`Profile relationship hint ${relationshipHint.id} does not include targetRef for endpoint resolution.`)
  }

  const resolution = normalizeCatalogTargetEndpointRef(relationshipHint, targetRef)
  if (
    input.expectedCatalogAuthority &&
    resolution.catalogAuthority &&
    resolution.catalogAuthority !== input.expectedCatalogAuthority
  ) {
    throw new Error(
      `Profile relationship hint ${relationshipHint.id} targetRef ${targetRef} catalog authority `
      + `${resolution.catalogAuthority} does not match expected target catalog authority ${input.expectedCatalogAuthority}.`,
    )
  }
  const endpointRef = resolution.endpointRef
  const parts = endpointRef.split('.').filter(part => part.length > 0)
  if (parts.length < 3) {
    throw new Error(
      `Profile relationship hint ${relationshipHint.id} targetRef ${targetRef} must resolve to schema.table.column.`,
    )
  }
  const column = parts.at(-1)
  const table = parts.slice(0, -1).join('.')
  if (!column || table.length === 0) {
    throw new Error(
      `Profile relationship hint ${relationshipHint.id} targetRef ${targetRef} must resolve to schema.table.column.`,
    )
  }

  return {
    endpoint: {
      table,
      columns: [column],
    },
    resolution,
    warnings: targetCatalogAuthorityWarnings(resolution),
  }
}

function normalizeCatalogTargetEndpointRef(
  relationshipHint: DpmProfileRelationshipHintProposal,
  targetRef: string,
): DpmProfileRelationshipTargetRefResolution {
  try {
    const url = new URL(targetRef)
    if (url.protocol !== 'catalog:') {
      throw new Error(
        `Profile relationship hint ${relationshipHint.id} targetRef ${targetRef} must use catalog://... or schema.table.column.`,
      )
    }
    const pathRef = decodeURIComponent(url.pathname.replace(/^\/+/, ''))
    if (pathRef) {
      return {
        endpointRef: pathRef,
        ...(url.host ? { catalogAuthority: url.host } : {}),
      }
    }
  } catch {
    if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(targetRef)) {
      throw new Error(
        `Profile relationship hint ${relationshipHint.id} targetRef ${targetRef} must use catalog://... or schema.table.column.`,
      )
    }
    return {
      endpointRef: targetRef,
    }
  }

  return {
    endpointRef: targetRef,
  }
}

function targetRefMetadataForCandidate(targetRef: string | undefined): Record<string, string> | undefined {
  if (!targetRef) return undefined

  try {
    const url = new URL(targetRef)
    if (url.protocol !== 'catalog:') return undefined

    const endpointRef = decodeURIComponent(url.pathname.replace(/^\/+/, ''))
    return {
      ...(url.host ? { targetRefCatalogAuthority: url.host } : {}),
      ...(endpointRef ? { targetRefEndpointPath: endpointRef } : {}),
    }
  } catch {
    return undefined
  }
}

function targetCatalogAuthorityWarnings(
  resolution: DpmProfileRelationshipTargetRefResolution,
): string[] {
  return resolution.catalogAuthority
    ? [`target-ref-catalog-authority:${resolution.catalogAuthority}`]
    : []
}

function resolveRelationshipHintChildTable(
  input: DpmProfileRelationshipEndpointResolverInput,
  coordinate: DpmProfileCoordinate,
): string {
  if (isNonEmptyString(input.childTable)) return input.childTable
  if (coordinate.sourceId) {
    const table = input.childTableBySourceId?.[coordinate.sourceId]
    if (isNonEmptyString(table)) return table
  }

  const pathPrefixEntry = Object.entries(input.childTableByPathPrefix ?? {})
    .filter(([prefix, table]) => isCoordinatePathPrefix(coordinate.path, prefix) && isNonEmptyString(table))
    .sort(([left], [right]) => right.length - left.length)[0]
  if (pathPrefixEntry) return pathPrefixEntry[1]

  throw new Error(
    `Profile relationship hint ${input.relationshipHint.id} cannot resolve child table; `
    + 'provide childTable, childTableBySourceId, or childTableByPathPrefix.',
  )
}

function resolveProfileCoordinateColumn(
  relationshipHint: DpmProfileRelationshipHintProposal,
  coordinate: DpmProfileCoordinate,
): string {
  const pointerColumn = coordinate.pointer ? lastJsonPointerSegment(coordinate.pointer) : undefined
  if (pointerColumn) return pointerColumn

  const pathColumn = lastPathSegment(coordinate.path)
  if (pathColumn) return pathColumn

  throw new Error(
    `Profile relationship hint ${relationshipHint.id} cannot resolve child column from source coordinate ${coordinate.path}.`,
  )
}

function lastJsonPointerSegment(pointer: string): string | undefined {
  const lastSegment = pointer.split('/').filter(Boolean).at(-1)
  if (!lastSegment) return undefined

  return lastSegment.replace(/~1/g, '/').replace(/~0/g, '~')
}

function lastPathSegment(path: string): string | undefined {
  const lastSegment = path.split('.').filter(Boolean).at(-1)
  if (!lastSegment) return undefined

  try {
    return decodeURIComponent(lastSegment)
  } catch {
    return lastSegment
  }
}

function isCoordinatePathPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}.`)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function toIdentifier(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'relationship_hint'
}
