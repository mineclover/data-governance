import type { DpmCompiledPlan } from '../compiler/plan.js'

export const DPM_DRY_RUN_REPORT_KIND = 'dpm.dry-run-report.v1' as const

export type DpmDryRunImpact = {
  namespaces: number
  relationships: number
  columns: number
  piiColumns: number
  estimatedRows: number
}

export type DpmDryRunCategory = {
  name: 'namespace_bindings' | 'relationship_steps' | 'column_steps' | 'pii_columns' | 'estimated_rows'
  count: number
}

export type DpmDryRunInput = {
  plan: DpmCompiledPlan
  estimatedRows?: Record<string, number>
  sampleValues?: Record<string, unknown>
}

export type DpmDryRunReport = {
  kind: typeof DPM_DRY_RUN_REPORT_KIND
  planIdentity: string
  manifestId: string
  stale: boolean
  impact: DpmDryRunImpact
  categories: DpmDryRunCategory[]
  rawValuesIncluded: false
}
