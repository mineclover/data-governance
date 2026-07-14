import type {
  DpmApiBindingDirection,
  DpmDataFieldType,
} from './data-types.js'
import type {
  DpmCatalogSnapshotRef,
  DpmDataFieldLocator,
  DpmDataSourceCoordinate,
  DpmEntityRef,
  DpmFieldLifecycle,
  DpmFieldOrigin,
  DpmIdentityApiObjectRef,
} from './data-identity-types.js'

export const DPM_NEUTRAL_DATA_BINDING_ARTIFACT_KIND = 'dpm.data-binding-artifact.v1' as const
export const DPM_NEUTRAL_DATA_BINDING_ARTIFACT_VERSIONS = ['1.0'] as const

export type DpmNeutralDataBindingArtifactVersion =
  typeof DPM_NEUTRAL_DATA_BINDING_ARTIFACT_VERSIONS[number]

export type DpmDataBindingApiArtifactFreshness = {
  artifactId: string
  versionHash: string
  provenanceVersionHash?: string
}

export type DpmDataBindingFreshness = {
  dataDefinitionVersion: '1.1'
  catalogSnapshots: readonly DpmCatalogSnapshotRef[]
  apiArtifacts: readonly DpmDataBindingApiArtifactFreshness[]
  identityHash: string
}

export type DpmNeutralDataBindingStorage = {
  identity: string
  table: string
  column: string
  catalog: DpmCatalogSnapshotRef
}

export type DpmNeutralDataBindingField = {
  identity: string
  objectId: string
  revisionId: string
  locator: DpmDataFieldLocator
  entity: DpmEntityRef
  name: string
  type: DpmDataFieldType
  origin: DpmFieldOrigin
  nullable?: boolean
  description?: string
  lifecycle: DpmFieldLifecycle
  aliases: readonly string[]
  supersededByObjectId?: string
  storage?: DpmNeutralDataBindingStorage
}

export type DpmNeutralDataBindingApi = DpmIdentityApiObjectRef & {
  identity: string
}

export type DpmNeutralDataBindingApiBinding = {
  identity: string
  bindingId: string
  dataField: {
    objectId: string
    revisionId: string
    identity: string
  }
  api: DpmNeutralDataBindingApi
  direction: DpmApiBindingDirection
  targetIdentity: string
}

export type DpmDataBindingApiArtifactLink = {
  artifactId: string
  versionHash: string
  sourceCoordinate?: DpmDataSourceCoordinate
}

export type DpmDataBindingBehaviorTraceLink = {
  behaviorId: string
  traceId?: string
  correlationId?: string
  recordRef?: string
  sourceCoordinate?: DpmDataSourceCoordinate
}

export type DpmDataBindingReviewLink = {
  reviewId: string
  recordRef?: string
  sourceCoordinate?: DpmDataSourceCoordinate
}

export type DpmNeutralDataBindingProvenance = {
  apiArtifacts: readonly DpmDataBindingApiArtifactLink[]
  catalogSnapshots: readonly DpmCatalogSnapshotRef[]
  behaviorTraces: readonly DpmDataBindingBehaviorTraceLink[]
  reviews: readonly DpmDataBindingReviewLink[]
}

export type DpmNeutralDataBindingArtifact = {
  kind: typeof DPM_NEUTRAL_DATA_BINDING_ARTIFACT_KIND
  version: DpmNeutralDataBindingArtifactVersion
  identity: string
  freshness: DpmDataBindingFreshness
  fields: readonly DpmNeutralDataBindingField[]
  apiBindings: readonly DpmNeutralDataBindingApiBinding[]
  provenance: DpmNeutralDataBindingProvenance
}
