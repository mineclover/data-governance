import type { SchemaSourceCoordinate } from '../contract/openapi-projection.js'

import type {
  DiscoveryEvidenceKind,
} from './discovery-taxonomy.js'

export type DiscoveryEvidence = {
  kind: DiscoveryEvidenceKind
  score?: number
  message: string
  source?: SchemaSourceCoordinate
  metadata?: Record<string, unknown>
}
