import type { SchemaSourceCoordinate } from '@oa-sdk/openapi-projection-contract'

export type RegistryEvidence = {
  kind: string
  message: string
  score?: number
  source?: SchemaSourceCoordinate
  metadata?: Record<string, unknown>
}
