import { DPM_MANIFEST_SCHEMA_ID } from '../schema/index.js'
import {
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayCommonSchemas() {
  return {
    DpmManifestPolicy: {
      type: 'object',
      additionalProperties: true,
      description: 'Opaque DPM policy body. Syntax ownership stays with the DPM JSON Schema.',
      'x-dpm-manifest-schema-id': DPM_MANIFEST_SCHEMA_ID,
    },
    DpmManifestRef: requiredObjectSchema({
      manifestId: stringSchema(),
      policyVersion: stringSchema(),
      manifest: ref('DpmManifestPolicy'),
    }),
    DpmSnapshotRef: requiredObjectSchema({
      ref: stringSchema(),
      versionHash: stringSchema(),
    }),
  } as const
}
