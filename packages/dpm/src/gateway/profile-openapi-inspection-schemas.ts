import {
  arrayOf,
  integerSchema,
  ref,
  requiredObjectSchema,
} from './openapi-schema.js'

export function createDpmProfileInspectionGatewaySchemas() {
  return {
    DpmProfileInspectionRequest: requiredObjectSchema({
      profileArtifact: ref('DpmProfileArtifact'),
    }),
    DpmProfileInspectionResponse: requiredObjectSchema({
      profileArtifact: ref('DpmProfileArtifact'),
      nodeCount: integerSchema(),
      edgeCount: integerSchema(),
      metricCount: integerSchema(),
      diagnostics: arrayOf(ref('DpmProfileDiagnostic')),
    }),
  } as const
}
