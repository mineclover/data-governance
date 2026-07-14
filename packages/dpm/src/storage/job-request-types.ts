import type { DpmPlanFreshness } from '../compiler/plan.js'
import type { DpmDiagnostic } from '../validator/diagnostic-types.js'
import type { DpmJobOperation } from './job-operation-taxonomy.js'
import type { DpmJobStatus } from './job-status-taxonomy.js'

export type DpmJobRequest = {
  jobId: string
}

export type DpmJobSaveInput = {
  jobId: string
  operation: DpmJobOperation
  status: DpmJobStatus
  datasetId: string
  manifestId: string
  planIdentity?: string
  freshness?: DpmPlanFreshness
  diagnostics?: readonly DpmDiagnostic[]
  validationReportRef?: string
  createdAt?: string
  completedAt?: string
}
