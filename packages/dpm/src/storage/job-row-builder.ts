import type { DpmPlanFreshness } from '../compiler/plan.js'
import { createDpmDiagnostic } from '../validator/diagnostic-copy.js'
import type { DpmDiagnostic } from '../validator/diagnostic-types.js'
import type { DpmJobSaveInput } from './job-request-types.js'
import type { DpmJobRow } from './job-row-types.js'
import { DPM_JOB_KIND } from './job-kind.js'

export function createDpmJobRow(input: DpmJobSaveInput): DpmJobRow {
  return {
    kind: DPM_JOB_KIND,
    jobId: input.jobId,
    operation: input.operation,
    status: input.status,
    datasetId: input.datasetId,
    manifestId: input.manifestId,
    ...(input.planIdentity ? { planIdentity: input.planIdentity } : {}),
    ...(input.freshness ? { freshness: copyFreshness(input.freshness) } : {}),
    diagnostics: copyDiagnostics(input.diagnostics ?? []),
    ...(input.validationReportRef ? { validationReportRef: input.validationReportRef } : {}),
    ...(input.createdAt ? { createdAt: input.createdAt } : {}),
    ...(input.completedAt ? { completedAt: input.completedAt } : {}),
  }
}

function copyDiagnostics(diagnostics: readonly DpmDiagnostic[]): DpmDiagnostic[] {
  return diagnostics.map(diagnostic => createDpmDiagnostic(diagnostic))
}

function copyFreshness(freshness: DpmPlanFreshness): DpmPlanFreshness {
  return {
    ...(freshness.manifestCatalogVersionHash ? {
      manifestCatalogVersionHash: freshness.manifestCatalogVersionHash,
    } : {}),
    catalogVersionHash: freshness.catalogVersionHash,
    registryVersion: freshness.registryVersion,
    registryIdentity: freshness.registryIdentity,
    canonicalKeyEncodingVersion: freshness.canonicalKeyEncodingVersion,
  }
}
