import type {
  DpmProfileEdgeKind,
  DpmProfileMetricKind,
  DpmProfileNodeKind,
} from './profile-taxonomy.js'
import type { DpmProfileCoordinate } from './profile-source-types.js'

export type DpmProfileNode = {
  id: string
  kind: DpmProfileNodeKind
  label: string
  coordinate: DpmProfileCoordinate
  dataType?: string
  shape?: Record<string, string | number | boolean | null>
}

export type DpmProfileEdge = {
  id: string
  kind: DpmProfileEdgeKind
  fromNodeId: string
  toNodeId: string
  evidenceIds: string[]
  confidence?: number
}

export type DpmProfileMetric = {
  id: string
  kind: DpmProfileMetricKind
  subjectId: string
  value: number | string
  unit?: string
  evidenceIds: string[]
}
