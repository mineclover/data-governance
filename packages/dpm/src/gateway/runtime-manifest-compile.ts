import type { DpmCompileResult } from '../compiler/compile-types.js'
import { compileDpmPlan } from '../compiler/compile-orchestrator.js'
import type { DpmGatewayRuntimeManifestInput } from './runtime-manifest-types.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'
import { resolveDpmGatewayRuntimeCatalogSnapshot } from './runtime-manifest-catalog.js'

export async function compileDpmManifestRuntime(
  input: DpmGatewayRuntimeManifestInput,
): Promise<DpmGatewayRuntimeResponse<DpmCompileResult>> {
  const result = compileDpmPlan({
    manifest: input.manifest,
    catalog: resolveDpmGatewayRuntimeCatalogSnapshot(input.catalog),
    registry: input.registry,
    phase: 'compile',
  })

  return createDpmGatewayRuntimeResponse({
    operationId: 'compileDpmManifest',
    statusCode: result.ok ? 200 : 400,
    command: 'compile',
    result,
  })
}
