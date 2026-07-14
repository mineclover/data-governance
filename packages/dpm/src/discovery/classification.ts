import type {
  DiscoveryCandidateRecommendation,
  DiscoveryConfidenceLevel,
} from './discovery-taxonomy.js'
import type {
  DiscoveryThresholds,
} from './discovery-threshold-types.js'

export const DEFAULT_DISCOVERY_THRESHOLDS: DiscoveryThresholds = {
  reviewMin: 0.9,
  rejectBelow: 0.9,
  highConfidenceMin: 0.995,
  maxOrphanRatioBlocking: 0.001,
}

export function normalizeDiscoveryThresholds(
  thresholds: Partial<DiscoveryThresholds> | undefined,
): DiscoveryThresholds {
  return {
    reviewMin: thresholds?.reviewMin ?? DEFAULT_DISCOVERY_THRESHOLDS.reviewMin,
    rejectBelow: thresholds?.rejectBelow ?? DEFAULT_DISCOVERY_THRESHOLDS.rejectBelow,
    highConfidenceMin: thresholds?.highConfidenceMin ?? DEFAULT_DISCOVERY_THRESHOLDS.highConfidenceMin,
    maxOrphanRatioBlocking: thresholds?.maxOrphanRatioBlocking ?? DEFAULT_DISCOVERY_THRESHOLDS.maxOrphanRatioBlocking,
  }
}

export function classifyRelationshipCandidate(
  score: number,
  thresholds: DiscoveryThresholds = DEFAULT_DISCOVERY_THRESHOLDS,
): {
  level: DiscoveryConfidenceLevel
  recommendation: DiscoveryCandidateRecommendation
} {
  if (score < thresholds.rejectBelow) {
    return { level: 'low', recommendation: 'reject' }
  }
  if (score >= thresholds.highConfidenceMin) {
    return { level: 'high', recommendation: 'review' }
  }
  return { level: 'review', recommendation: 'review' }
}
