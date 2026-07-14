import { createDpmGatewayCoreSchemas } from './openapi-core-schemas.js'
import { createDpmGatewayPaths } from './openapi-paths.js'
import { createDpmProfileGatewaySchemas } from './profile-openapi.js'

export type DpmGatewayOpenApiDocument = ReturnType<typeof createDpmGatewayOpenApiDocument>

export function getDpmGatewayOpenApiDocument(): DpmGatewayOpenApiDocument {
  return createDpmGatewayOpenApiDocument()
}

function createDpmGatewayOpenApiDocument() {
  return {
    openapi: '3.2.0',
    info: {
      title: 'OA SDK DPM Gateway',
      version: '1.0.0',
      summary: 'Relationship-first Data Pseudonymization Manifest gateway contract.',
    },
    servers: [
      {
        url: 'https://api.example.com',
        description: 'Deployment-specific DPM gateway host.',
      },
    ],
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'catalog', description: 'Catalog profiling and structural evidence.' },
      { name: 'profiles', description: 'Profile artifact inspection, analysis, and editor-safe proposal review.' },
      { name: 'relationships', description: 'Relationship discovery, candidate review, and registry snapshots.' },
      { name: 'manifests', description: 'Manifest validation, compilation, and dry-run workflows.' },
      { name: 'jobs', description: 'Execution jobs and validation reports.' },
    ],
    paths: createDpmGatewayPaths(),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
      schemas: {
        ...createDpmGatewayCoreSchemas(),
        ...createDpmProfileGatewaySchemas(),
      },
    },
  } as const
}
