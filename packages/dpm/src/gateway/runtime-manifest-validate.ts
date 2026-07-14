import { validateDpmManifest } from '../validator/manifest-validator.js'
import type { DpmValidationResult } from '../validator/diagnostic-types.js'
import type { DpmGatewayRuntimeManifestInput } from './runtime-manifest-types.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'
import { resolveDpmGatewayRuntimeCatalogSnapshot } from './runtime-manifest-catalog.js'

export async function validateDpmManifestRuntime(
  input: DpmGatewayRuntimeManifestInput,
): Promise<DpmGatewayRuntimeResponse<DpmValidationResult>> {
  const result = validateDpmManifest({
    manifest: input.manifest,
    catalog: resolveDpmGatewayRuntimeCatalogSnapshot(input.catalog),
    registry: input.registry,
    phase: 'validate',
  })

  return createDpmGatewayRuntimeResponse({
    operationId: 'validateDpmManifest',
    statusCode: result.summary.errors > 0 ? 400 : 200,
    command: 'validate',
    result,
  })
}
