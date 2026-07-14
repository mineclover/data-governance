import type { DpmProfileKeyCandidateKind } from './analysis-taxonomy.js'

export type DpmProfileKeyCandidate = {
  id: string
  kind: DpmProfileKeyCandidateKind
  nodeId: string
  confidence: number
  reason: string
  evidenceIds: string[]
}
