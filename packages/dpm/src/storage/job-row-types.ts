import type { DpmPlanFreshness } from '../compiler/plan.js'
import type { DpmDiagnostic } from '../validator/diagnostic-types.js'
import type { DPM_JOB_KIND } from './job-kind.js'
import type { DpmJobOperation } from './job-operation-taxonomy.js'
import type { DpmJobStatus } from './job-status-taxonomy.js'

export type DpmJobRow = {
  kind: typeof DPM_JOB_KIND
  jobId: string
  operation: DpmJobOperation
  status: DpmJobStatus
  datasetId: string
  manifestId: string
  planIdentity?: string
  freshness?: DpmPlanFreshness
  diagnostics: DpmDiagnostic[]
  validationReportRef?: string
  createdAt?: string
  completedAt?: string
}
