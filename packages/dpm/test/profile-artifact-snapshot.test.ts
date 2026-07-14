import { describe, expect, it } from 'vitest'

import {
  createDpmProfileArtifactSnapshot,
  normalizeDpmProfileArtifact,
} from '../src/index.js'
import { createKafkaProfileInput } from './support/profile-artifact-kafka-inputs.js'

describe('DPM profile artifact snapshots', () => {
  it('creates a frozen defensive profile artifact snapshot for SDK consumers', () => {
    const profile = normalizeDpmProfileArtifact(createKafkaProfileInput())
    const snapshot = createDpmProfileArtifactSnapshot(profile)
    const firstNodeLabel = snapshot.nodes[0]?.label
    const evidenceId = Object.keys(profile.evidenceSources)[0]!
    const snapshotEvidencePath = snapshot.evidenceSources[evidenceId]?.coordinate.path

    profile.nodes[0]!.label = 'mutated after snapshot'
    profile.evidenceSources[evidenceId]!.coordinate.path = 'mutated.after.snapshot'

    expect(snapshot.nodes[0]?.label).toBe(firstNodeLabel)
    expect(snapshot.evidenceSources[evidenceId]?.coordinate.path).toBe(snapshotEvidencePath)
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.nodes)).toBe(true)
    expect(Object.isFrozen(snapshot.nodes[0])).toBe(true)
    expect(Object.isFrozen(snapshot.evidenceSources[evidenceId]?.coordinate)).toBe(true)
    expect(() => {
      ;(snapshot.nodes as unknown as unknown[]).push(snapshot.nodes[0])
    }).toThrow()
    expect(() => {
      ;(snapshot.nodes[0] as unknown as { label: string }).label = 'mutated snapshot'
    }).toThrow()
  })
})
