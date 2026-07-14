import { createDpmProfileArtifactEnvelopeGatewaySchemas } from './profile-openapi-artifact-envelope-schemas.js'
import { createDpmProfileGraphGatewaySchemas } from './profile-openapi-graph-schemas.js'
import { createDpmProfileInspectionGatewaySchemas } from './profile-openapi-inspection-schemas.js'
import { createDpmProfileSourceGatewaySchemas } from './profile-openapi-source-schemas.js'

export function createDpmProfileArtifactGatewaySchemas() {
  return {
    ...createDpmProfileSourceGatewaySchemas(),
    ...createDpmProfileGraphGatewaySchemas(),
    ...createDpmProfileArtifactEnvelopeGatewaySchemas(),
    ...createDpmProfileInspectionGatewaySchemas(),
  } as const
}
