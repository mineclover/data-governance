export type DpmProfileAnalysisPolicy = {
  measuredRelationshipPresenceThreshold: number
  measuredRelationshipConfidenceCap: number
  lowPresenceRiskThreshold: number
  highNullRiskThreshold: number
  identifierKeyCandidateFallbackConfidence: number
}

export type DpmProfileAnalysisPolicyInput = Partial<DpmProfileAnalysisPolicy>
