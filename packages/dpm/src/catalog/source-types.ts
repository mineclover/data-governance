import type {
  OpenApiProjectionProfile,
} from '@oa-sdk/openapi-projection-contract'

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
