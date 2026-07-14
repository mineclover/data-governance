import {
  DPM_PROFILE_EDGE_KINDS,
  DPM_PROFILE_NODE_KINDS,
} from './profile-taxonomy.js'
import {
  evidenceIdsSchema,
  nonEmptyStringSchema,
  profileCoordinateSchema,
  safeProfileShapeSchema,
} from './schema-fragments.js'

export const profileNodesSchema = {
  type: 'array',
  minItems: 1,
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      id: nonEmptyStringSchema,
      kind: { type: 'string', enum: DPM_PROFILE_NODE_KINDS },
      label: nonEmptyStringSchema,
      coordinate: profileCoordinateSchema,
      dataType: nonEmptyStringSchema,
      shape: safeProfileShapeSchema,
    },
    required: ['id', 'kind', 'label', 'coordinate'],
  },
} as const

export const profileEdgesSchema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      id: nonEmptyStringSchema,
      kind: { type: 'string', enum: DPM_PROFILE_EDGE_KINDS },
      fromNodeId: nonEmptyStringSchema,
      toNodeId: nonEmptyStringSchema,
      evidenceIds: evidenceIdsSchema,
      confidence: { type: 'number', minimum: 0, maximum: 1 },
    },
    required: ['id', 'kind', 'fromNodeId', 'toNodeId', 'evidenceIds'],
  },
} as const
