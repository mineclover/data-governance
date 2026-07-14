import { DPM_PROFILE_DRIFT_SIGNAL_KINDS } from '../profile/analysis-taxonomy.js'
import {
  numberSchema,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmProfileAnalysisDriftGatewaySchemas() {
  return {
    DpmProfileDriftSignal: requiredObjectSchema({
      id: stringSchema(),
      kind: { type: 'string', enum: [...DPM_PROFILE_DRIFT_SIGNAL_KINDS] },
      severity: { type: 'string', enum: ['warning', 'info'] },
      nodeId: stringSchema(),
      metricId: stringSchema(),
      sourceId: stringSchema(),
      previousValue: { oneOf: [numberSchema(), stringSchema()] },
      currentValue: { oneOf: [numberSchema(), stringSchema()] },
      explanation: stringSchema(),
    }, ['id', 'kind', 'severity', 'explanation']),
  } as const
}
