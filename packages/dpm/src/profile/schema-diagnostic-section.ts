import {
  evidenceIdsSchema,
  nonEmptyStringSchema,
  profileCoordinateSchema,
} from './schema-fragments.js'

export const profileDiagnosticsSchema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      severity: { type: 'string', enum: ['error', 'warning', 'info'] },
      code: { type: 'string', pattern: '^(PROF|CONN)[0-9]{3}$' },
      message: nonEmptyStringSchema,
      connectorId: nonEmptyStringSchema,
      coordinate: profileCoordinateSchema,
      evidenceIds: evidenceIdsSchema,
    },
    required: ['severity', 'code', 'message'],
    anyOf: [
      { required: ['coordinate'] },
      { required: ['evidenceIds'] },
    ],
  },
} as const
