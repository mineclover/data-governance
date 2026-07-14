import type { DpmPlanFreshness } from '../compiler/plan.js'
import type { DpmDryRunCategory, DpmDryRunImpact } from '../dry-run/report-types.js'
import type { DpmDiagnostic } from '../validator/diagnostic-types.js'
import type { DPM_VALIDATION_REPORT_KIND } from './report-kind.js'
import type { DpmValidationReportStatus } from './report-status-taxonomy.js'

export type DpmStoredValidationReport = {
  kind: typeof DPM_VALIDATION_REPORT_KIND
  jobId: string
  status: DpmValidationReportStatus
  validationReportRef: string
  diagnostics: DpmDiagnostic[]
  planIdentity?: string
  freshness?: DpmPlanFreshness
  impact?: DpmDryRunImpact
  categories?: DpmDryRunCategory[]
  createdAt?: string
}
