import type {
  DpmProfileDriftSignal,
} from './analysis-signal-types.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export function analyzeMetricDriftSignals(
  current: DpmProfileArtifact,
  previous: DpmProfileArtifact,
): DpmProfileDriftSignal[] {
  const signals: DpmProfileDriftSignal[] = []
  const previousMetrics = new Map(previous.metrics.map(metric => [metric.id, metric]))
  for (const currentMetric of current.metrics) {
    const previousMetric = previousMetrics.get(currentMetric.id)
    if (!previousMetric || previousMetric.value === currentMetric.value) continue
    signals.push({
      id: `drift:metric:${currentMetric.id}`,
      kind: 'metric_value_changed',
      severity: 'warning',
      metricId: currentMetric.id,
      previousValue: previousMetric.value,
      currentValue: currentMetric.value,
      explanation: `Profile metric ${currentMetric.id} changed.`,
    })
  }
  return signals
}
