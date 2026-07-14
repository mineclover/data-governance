import { createHash } from 'node:crypto'

import type {
  DpmProfileAnalysisPolicy,
  DpmProfileAnalysisPolicyInput,
} from './analysis-policy-types.js'

export type {
  DpmProfileAnalysisPolicy,
  DpmProfileAnalysisPolicyInput,
} from './analysis-policy-types.js'

export const DEFAULT_DPM_PROFILE_ANALYSIS_POLICY = {
  measuredRelationshipPresenceThreshold: 0.95,
  measuredRelationshipConfidenceCap: 0.9,
  lowPresenceRiskThreshold: 0.95,
  highNullRiskThreshold: 0.5,
  identifierKeyCandidateFallbackConfidence: 0.6,
} as const satisfies DpmProfileAnalysisPolicy

const DPM_PROFILE_ANALYSIS_POLICY_FIELDS = [
  'measuredRelationshipPresenceThreshold',
  'measuredRelationshipConfidenceCap',
  'lowPresenceRiskThreshold',
  'highNullRiskThreshold',
  'identifierKeyCandidateFallbackConfidence',
] as const satisfies readonly (keyof DpmProfileAnalysisPolicy)[]

export function resolveDpmProfileAnalysisPolicy(
  input: DpmProfileAnalysisPolicyInput | undefined,
): DpmProfileAnalysisPolicy {
  const policy: DpmProfileAnalysisPolicy = {
    ...DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
    ...(input ?? {}),
  }

  for (const field of DPM_PROFILE_ANALYSIS_POLICY_FIELDS) {
    assertDpmProfileAnalysisPolicyRatio(field, policy[field])
  }

  return policy
}

export function computeDpmProfileAnalysisPolicyHash(
  input: DpmProfileAnalysisPolicyInput | undefined,
): string {
  return `sha256:${createHash('sha256')
    .update(JSON.stringify(resolveDpmProfileAnalysisPolicy(input)))
    .digest('hex')}`
}

function assertDpmProfileAnalysisPolicyRatio(
  field: keyof DpmProfileAnalysisPolicy,
  value: number,
): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`DPM profile analysis policy ${field} must be a finite ratio between 0 and 1.`)
  }
}
