import {
  ref,
  requiredObjectSchema,
} from './openapi-schema.js'

export function createDpmGatewayManifestSchemas() {
  return {
    DpmManifestValidationRequest: requiredObjectSchema({
      manifest: ref('DpmManifestPolicy'),
      catalogSnapshot: ref('DpmSnapshotRef'),
      registrySnapshot: ref('DpmSnapshotRef'),
    }),
    DpmManifestCompileRequest: requiredObjectSchema({
      manifest: ref('DpmManifestPolicy'),
      catalogSnapshot: ref('DpmSnapshotRef'),
      registrySnapshot: ref('DpmSnapshotRef'),
    }),
    DpmManifestDryRunRequest: requiredObjectSchema({
      manifest: ref('DpmManifestPolicy'),
      catalogSnapshot: ref('DpmSnapshotRef'),
      registrySnapshot: ref('DpmSnapshotRef'),
      estimatedRows: {
        type: 'object',
        additionalProperties: { type: 'number' },
      },
    }, ['manifest', 'catalogSnapshot', 'registrySnapshot']),
  } as const
}
