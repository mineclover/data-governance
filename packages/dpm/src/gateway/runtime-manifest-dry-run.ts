import type { DpmCompileResult } from '../compiler/compile-types.js'
import { compileDpmPlan } from '../compiler/compile-orchestrator.js'
import { createDpmDryRunReport } from '../dry-run/report-builder.js'
import type { DpmDryRunReport } from '../dry-run/report-types.js'
import type { DpmGatewayRuntimeManifestInput } from './runtime-manifest-types.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'
import { resolveDpmGatewayRuntimeCatalogSnapshot } from './runtime-manifest-catalog.js'

export async function dryRunDpmManifestRuntime(
  input: DpmGatewayRuntimeManifestInput,
): Promise<DpmGatewayRuntimeResponse<DpmCompileResult | DpmDryRunReport>> {
  const compiled = compileDpmPlan({
    manifest: input.manifest,
    catalog: resolveDpmGatewayRuntimeCatalogSnapshot(input.catalog),
    registry: input.registry,
    phase: 'dry_run',
  })
  if (!compiled.ok) {
    return createDpmGatewayRuntimeResponse({
      operationId: 'dryRunDpmManifest',
      statusCode: 400,
      command: 'dry-run',
      result: compiled,
    })
  }

  return createDpmGatewayRuntimeResponse({
    operationId: 'dryRunDpmManifest',
    statusCode: 200,
    command: 'dry-run',
    result: createDpmDryRunReport({
      plan: compiled.plan,
      ...(input.estimatedRows ? { estimatedRows: input.estimatedRows } : {}),
    }),
  })
}
