export const DPM_PROFILE_PROPOSAL_REVIEW_STATUSES = [
  'accepted',
  'rejected',
  'needs_changes',
] as const

export type DpmProfileProposalReviewStatus = typeof DPM_PROFILE_PROPOSAL_REVIEW_STATUSES[number]
