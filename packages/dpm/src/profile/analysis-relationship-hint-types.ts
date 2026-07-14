import type {
  DpmProfileRelationshipHintSource,
  DpmProfileRelationshipHintStatus,
} from './analysis-taxonomy.js'

export type DpmProfileRelationshipHintProposal = {
  id: string
  status: DpmProfileRelationshipHintStatus
  source: DpmProfileRelationshipHintSource
  fromNodeId: string
  hintNodeId?: string
  targetRef?: string
  confidence: number
  evidenceIds: string[]
  explanation: string
}
