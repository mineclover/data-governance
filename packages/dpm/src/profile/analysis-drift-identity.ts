import type {
  DpmProfileDriftSignal,
} from './analysis-signal-types.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export function analyzeIdentityDriftSignals(
  current: DpmProfileArtifact,
  previous: DpmProfileArtifact,
): DpmProfileDriftSignal[] {
  if (
    current.datasetId === previous.datasetId &&
    current.profileId === previous.profileId
  ) {
    return []
  }

  return [{
    id: 'drift:profile_identity_mismatch',
    kind: 'profile_identity_mismatch',
    severity: 'warning',
    previousValue: profileIdentityFor(previous),
    currentValue: profileIdentityFor(current),
    explanation: 'Previous and current profile artifacts describe different profile identities.',
  }]
}

function profileIdentityFor(profile: DpmProfileArtifact): string {
  return `${profile.datasetId}:${profile.profileId}`
}
