import {
  DPM_PROFILE_METRIC_KINDS,
} from './profile-taxonomy.js'
import {
  evidenceIdsSchema,
  nonEmptyStringSchema,
} from './schema-fragments.js'

export const profileMetricsSchema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      id: nonEmptyStringSchema,
      kind: { type: 'string', enum: DPM_PROFILE_METRIC_KINDS },
      subjectId: nonEmptyStringSchema,
      value: { type: ['number', 'string'] },
      unit: nonEmptyStringSchema,
      evidenceIds: evidenceIdsSchema,
    },
    required: ['id', 'kind', 'subjectId', 'value', 'evidenceIds'],
  },
} as const
