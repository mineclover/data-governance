import { DPM_PROFILE_KEY_CANDIDATE_KINDS } from '../profile/analysis-taxonomy.js'
import {
  arrayOf,
  ratioSchema,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmProfileAnalysisKeyCandidateGatewaySchemas() {
  return {
    DpmProfileKeyCandidate: requiredObjectSchema({
      id: stringSchema(),
      kind: { type: 'string', enum: [...DPM_PROFILE_KEY_CANDIDATE_KINDS] },
      nodeId: stringSchema(),
      confidence: ratioSchema(),
      reason: stringSchema(),
      evidenceIds: arrayOf(stringSchema()),
    }),
  } as const
}
