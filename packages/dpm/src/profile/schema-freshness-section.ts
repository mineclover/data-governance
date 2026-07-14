import {
  sha256Schema,
} from './schema-fragments.js'

export const profileFreshnessSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    versionHash: sha256Schema,
    sourceVersionHashes: {
      type: 'object',
      additionalProperties: sha256Schema,
    },
  },
  required: ['versionHash'],
} as const
