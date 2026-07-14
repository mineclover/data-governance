import {
  DPM_PROFILE_ARTIFACT_SCHEMA_PROPERTIES,
} from './schema-document-properties.js'
import {
  DPM_PROFILE_ARTIFACT_REQUIRED_FIELDS,
} from './schema-document-required.js'

export const DPM_PROFILE_ARTIFACT_SCHEMA_ID = 'https://oa-sdk.dev/schemas/dpm-profile-artifact.v1.json' as const

export const DPM_PROFILE_ARTIFACT_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: DPM_PROFILE_ARTIFACT_SCHEMA_ID,
  type: 'object',
  additionalProperties: false,
  properties: DPM_PROFILE_ARTIFACT_SCHEMA_PROPERTIES,
  required: DPM_PROFILE_ARTIFACT_REQUIRED_FIELDS,
} as const
