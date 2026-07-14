import {
  DPM_PROFILE_CAPTURE_MODES,
  DPM_PROFILE_SOURCE_KINDS,
} from './profile-taxonomy.js'
import {
  nonEmptyStringSchema,
  profileCoordinateSchema,
  sha256Schema,
} from './schema-fragments.js'

export const profileSourcesSchema = {
  type: 'array',
  minItems: 1,
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      id: nonEmptyStringSchema,
      kind: { type: 'string', enum: DPM_PROFILE_SOURCE_KINDS },
      connectorId: nonEmptyStringSchema,
      connectorVersion: nonEmptyStringSchema,
      refs: {
        type: 'array',
        minItems: 1,
        items: nonEmptyStringSchema,
      },
      captureMode: { type: 'string', enum: DPM_PROFILE_CAPTURE_MODES },
      capturedAt: nonEmptyStringSchema,
      sourceVersionHash: sha256Schema,
    },
    required: ['id', 'kind', 'connectorId', 'connectorVersion', 'refs', 'captureMode'],
  },
} as const

export const profileEvidenceSourcesSchema = {
  type: 'object',
  minProperties: 1,
  additionalProperties: {
    type: 'object',
    additionalProperties: false,
    properties: {
      coordinate: profileCoordinateSchema,
      connectorId: nonEmptyStringSchema,
      capturedAt: nonEmptyStringSchema,
      description: nonEmptyStringSchema,
    },
    required: ['coordinate'],
  },
} as const
