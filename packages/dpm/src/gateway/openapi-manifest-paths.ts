import {
  gatewayOperation,
} from './openapi-operation.js'
import { jsonRequestBody } from './openapi-request-body.js'

export function createDpmManifestGatewayPaths() {
  return {
    '/dpm/manifests/validate': {
      post: gatewayOperation({
        operationId: 'validateDpmManifest',
        tags: ['manifests'],
        summary: 'Validate a DPM manifest against catalog and registry snapshots.',
        requestBody: jsonRequestBody('DpmManifestValidationRequest'),
        responseSchema: 'DpmValidationResult',
        blockingResponseSchema: 'DpmValidationResult',
      }),
    },
    '/dpm/manifests/compile': {
      post: gatewayOperation({
        operationId: 'compileDpmManifest',
        tags: ['manifests'],
        summary: 'Compile a validated DPM manifest into an execution plan.',
        requestBody: jsonRequestBody('DpmManifestCompileRequest'),
        responseSchema: 'DpmCompileResult',
        blockingResponseSchema: 'DpmCompileResult',
      }),
    },
    '/dpm/manifests/dry-run': {
      post: gatewayOperation({
        operationId: 'dryRunDpmManifest',
        tags: ['manifests'],
        summary: 'Create a dry-run impact report from a compiled DPM plan.',
        requestBody: jsonRequestBody('DpmManifestDryRunRequest'),
        responseSchema: 'DpmDryRunResult',
        blockingResponseSchema: 'DpmCompileResult',
      }),
    },
  } as const
}
