import type {
  OpenApiProjectionProfile,
} from '../contract/openapi-projection.js'

export type CatalogSnapshotSource =
  | {
      kind: 'postgresql'
      database: string
      capturedAt?: string
    }
  | {
      kind: 'openapi_projection'
      profile: OpenApiProjectionProfile
      projectionVersionHash: string
      projectionRef?: string
    }
