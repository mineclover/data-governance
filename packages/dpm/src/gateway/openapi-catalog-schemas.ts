import {
  arrayOf,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayCatalogSchemas() {
  return {
    DpmCatalogProfileRequest: requiredObjectSchema({
      datasetId: stringSchema(),
      catalogSourceRef: stringSchema(),
      manifest: ref('DpmManifestPolicy'),
    }),
    DpmCatalogProfileResponse: requiredObjectSchema({
      catalogSnapshotRef: stringSchema(),
      catalogVersionHash: stringSchema(),
      diagnostics: arrayOf(ref('DpmDiagnostic')),
    }),
  } as const
}
