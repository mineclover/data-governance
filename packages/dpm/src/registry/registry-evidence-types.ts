import type { SchemaSourceCoordinate } from '../contract/openapi-projection.js'

export type RegistryEvidence = {
  kind: string
  message: string
  score?: number
  source?: SchemaSourceCoordinate
  metadata?: Record<string, unknown>
}
