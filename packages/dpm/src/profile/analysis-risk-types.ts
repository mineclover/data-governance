import type { DpmProfileRiskIndicatorKind } from './analysis-taxonomy.js'

export type DpmProfileRiskIndicator = {
  id: string
  kind: DpmProfileRiskIndicatorKind
  severity: 'warning' | 'info'
  nodeId?: string
  metricId?: string
  evidenceIds: string[]
  explanation: string
}
