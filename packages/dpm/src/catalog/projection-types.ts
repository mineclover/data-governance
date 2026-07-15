import type {
  OpenApiProjectionProfile,
  SchemaRefEdge,
  SchemaTypeTarget,
} from '../contract/openapi-projection.js'

export type CatalogProjectionEvidence = {
  profile: OpenApiProjectionProfile
  versionHash: string
  refs: SchemaRefEdge[]
  typeTargets: SchemaTypeTarget[]
}
