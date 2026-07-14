import type {
  OpenApiProjectionProfile,
  SchemaRefEdge,
  SchemaTypeTarget,
} from '@oa-sdk/openapi-projection-contract'

export type CatalogProjectionEvidence = {
  profile: OpenApiProjectionProfile
  versionHash: string
  refs: SchemaRefEdge[]
  typeTargets: SchemaTypeTarget[]
}
