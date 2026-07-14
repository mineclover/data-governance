import { DPM_PROFILE_RISK_INDICATOR_KINDS } from '../profile/analysis-taxonomy.js'
import {
  arrayOf,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmProfileAnalysisRiskGatewaySchemas() {
  return {
    DpmProfileRiskIndicator: requiredObjectSchema({
      id: stringSchema(),
      kind: { type: 'string', enum: [...DPM_PROFILE_RISK_INDICATOR_KINDS] },
      severity: { type: 'string', enum: ['warning', 'info'] },
      nodeId: stringSchema(),
      metricId: stringSchema(),
      evidenceIds: arrayOf(stringSchema()),
      explanation: stringSchema(),
    }, ['id', 'kind', 'severity', 'evidenceIds', 'explanation']),
  } as const
}
