import {
  DPM_PROFILE_RELATIONSHIP_HINT_SOURCES,
  DPM_PROFILE_RELATIONSHIP_HINT_STATUSES,
} from '../profile/analysis-taxonomy.js'
import {
  arrayOf,
  ratioSchema,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmProfileAnalysisRelationshipHintGatewaySchemas() {
  return {
    DpmProfileRelationshipHintProposal: requiredObjectSchema({
      id: stringSchema(),
      status: { type: 'string', enum: [...DPM_PROFILE_RELATIONSHIP_HINT_STATUSES] },
      source: { type: 'string', enum: [...DPM_PROFILE_RELATIONSHIP_HINT_SOURCES] },
      fromNodeId: stringSchema(),
      hintNodeId: stringSchema(),
      targetRef: stringSchema(),
      confidence: ratioSchema(),
      evidenceIds: arrayOf(stringSchema()),
      explanation: stringSchema(),
    }, ['id', 'status', 'source', 'fromNodeId', 'confidence', 'evidenceIds', 'explanation']),
  } as const
}
