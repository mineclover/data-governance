import type {
  DpmProfileMetric,
} from './profile-graph-types.js'

export function groupMetricsBySubject(metrics: readonly DpmProfileMetric[]): Map<string, DpmProfileMetric[]> {
  const grouped = new Map<string, DpmProfileMetric[]>()
  for (const metric of metrics) {
    const next = grouped.get(metric.subjectId) ?? []
    next.push(metric)
    grouped.set(metric.subjectId, next)
  }
  return grouped
}

export function roundRatio(value: number): number {
  return Number(value.toFixed(6))
}
