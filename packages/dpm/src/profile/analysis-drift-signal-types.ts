import type { DpmProfileDriftSignalKind } from './analysis-taxonomy.js'

export type DpmProfileDriftSignal = {
  id: string
  kind: DpmProfileDriftSignalKind
  severity: 'warning' | 'info'
  nodeId?: string
  metricId?: string
  sourceId?: string
  previousValue?: string | number
  currentValue?: string | number
  explanation: string
}
