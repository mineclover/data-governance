export const DPM_PROFILE_BASELINE_SELECTION_STRATEGIES = [
  'latest_previous',
] as const

export type DpmProfileBaselineSelectionStrategy =
  typeof DPM_PROFILE_BASELINE_SELECTION_STRATEGIES[number]
