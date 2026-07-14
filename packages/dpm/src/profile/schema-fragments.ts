import {
  DPM_PROFILE_SOURCE_KINDS,
} from './profile-taxonomy.js'

export const nonEmptyStringSchema = { type: 'string', minLength: 1 } as const
export const sha256Schema = { type: 'string', pattern: '^sha256:.+' } as const

const unsafeProfileShapeKeyTokens = [
  '[Rr][Aa][Ww]',
  '[Ss][Aa][Mm][Pp][Ll][Ee]',
  '[Pp][Aa][Yy][Ll][Oo][Aa][Dd]',
  '[Ss][Ee][Cc][Rr][Ee][Tt]',
  '[Cc][Rr][Ee][Dd][Ee][Nn][Tt][Ii][Aa][Ll]',
  '[Tt][Oo][Kk][Ee][Nn]',
  '[Vv][Aa][Uu][Ll][Tt]',
  '[Rr][Ee][Vv][Ee][Rr][Ss][Ee]',
] as const

export const unsafeProfileShapeKeyPattern =
  `.*(${unsafeProfileShapeKeyTokens.join('|')}).*`

export const safeProfileShapeSchema = {
  type: 'object',
  propertyNames: {
    type: 'string',
    not: { pattern: unsafeProfileShapeKeyPattern },
  },
  additionalProperties: {
    type: ['string', 'number', 'boolean', 'null'],
  },
} as const

export const profileCoordinateSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: { type: 'string', enum: DPM_PROFILE_SOURCE_KINDS },
    sourceId: nonEmptyStringSchema,
    path: nonEmptyStringSchema,
    pointer: nonEmptyStringSchema,
    externalId: nonEmptyStringSchema,
  },
  required: ['kind', 'path'],
} as const

export const evidenceIdsSchema = {
  type: 'array',
  minItems: 1,
  items: nonEmptyStringSchema,
} as const
