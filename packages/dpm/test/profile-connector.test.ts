import { describe, expect, it } from 'vitest'

import {
  createPostgresCatalogSnapshot,
  computeDpmProfileConnectorRunHash,
  normalizeDpmProfileArtifact,
  type DpmProfileArtifact,
  type DpmProfileConnectorResultInput,
  type PostgresCatalogSnapshotInput,
} from '../src/index.js'
import { readCatalogFixture } from './support/catalog-fixture-io.js'
import { allEvidenceCapabilities } from './support/profile-connector-capabilities.js'
import { completeConnectorEvidenceKinds } from './support/profile-connector-completed-evidence-fixtures.js'
import { expectValidConnectorResult } from './support/profile-connector-assertions.js'
import { createKafkaProfileArtifactInput } from './support/profile-connector-kafka-artifact-inputs.js'
import { createKafkaProfileConnectorResult } from './support/profile-connector-kafka-result-fixtures.js'
import { createPostgresProfileArtifactInput } from './support/profile-connector-postgres-artifact-inputs.js'
import { createPostgresProfileConnectorResult } from './support/profile-connector-postgres-result-fixtures.js'

describe('DPM profile connector output contract', () => {
  it('describes PostgreSQL catalog profiling as a connector output without changing catalog snapshots', () => {
    const catalogFixture = readCatalogFixture<PostgresCatalogSnapshotInput>(
      'postgres-commerce.json',
    )
    const catalogSnapshot = createPostgresCatalogSnapshot(catalogFixture)
    const profileArtifact = normalizeDpmProfileArtifact(createPostgresProfileArtifactInput())
    const result = createPostgresProfileConnectorResult(profileArtifact)

    expect(catalogSnapshot.kind).toBe('dpm.catalog.snapshot.v1')
    expect(catalogSnapshot.source.kind).toBe('postgresql')
    expect('profileArtifact' in catalogSnapshot).toBe(false)
    expect(result.freshness.profileVersionHash).toBe(profileArtifact.freshness.versionHash)
    expectValidConnectorResult(result)
  })

  it('uses the same connector result shape for Kafka fixture evidence', () => {
    const profileArtifact = normalizeDpmProfileArtifact(createKafkaProfileArtifactInput())
    const result = createKafkaProfileConnectorResult({
      profileArtifact,
    })

    expect(result.profileArtifact?.sources[0]?.kind).toBe('kafka_topic_bundle')
    expect(result.profileArtifact?.nodes.map(node => node.kind)).toContain('message_field')
    expectValidConnectorResult(result)
  })

  it('defensively copies profile artifacts into connector results', () => {
    const profileArtifact = normalizeDpmProfileArtifact(createKafkaProfileArtifactInput())
    const result = createKafkaProfileConnectorResult({ profileArtifact })
    const firstNodeLabel = result.profileArtifact?.nodes[0]?.label
    const evidenceId = Object.keys(profileArtifact.evidenceSources)[0]!
    const resultEvidencePath = result.profileArtifact?.evidenceSources[evidenceId]?.coordinate.path

    profileArtifact.nodes[0]!.label = 'mutated after connector result'
    profileArtifact.evidenceSources[evidenceId]!.coordinate.path = 'mutated.after.result'

    expect(result.profileArtifact?.nodes[0]?.label).toBe(firstNodeLabel)
    expect(result.profileArtifact?.evidenceSources[evidenceId]?.coordinate.path).toBe(resultEvidencePath)
  })

  it('normalizes connector hash inputs before hashing', () => {
    const profileArtifact = normalizeDpmProfileArtifact(createKafkaProfileArtifactInput())
    const result = createKafkaProfileConnectorResult({ profileArtifact })
    const capabilities = allEvidenceCapabilities(
      'dpm.kafka.fixture',
      '0.1.0',
      'kafka_topic_bundle',
      'fixture',
    )
    const unorderedInput: DpmProfileConnectorResultInput = {
      connectorId: 'dpm.kafka.fixture',
      connectorVersion: '0.1.0',
      sourceKind: 'kafka_topic_bundle',
      captureMode: 'fixture',
      status: 'completed',
      capabilities: {
        ...capabilities,
        supportedEvidenceKinds: [...capabilities.supportedEvidenceKinds].reverse(),
      },
      observedEvidenceKinds: [...completeConnectorEvidenceKinds].reverse(),
      diagnostics: [],
      profileArtifact: reverseProfileArtifactCollections(profileArtifact),
    }

    expect(computeDpmProfileConnectorRunHash(unorderedInput)).toBe(result.freshness.runHash)
  })
})

function reverseProfileArtifactCollections(profile: DpmProfileArtifact): DpmProfileArtifact {
  return {
    ...profile,
    sources: [...profile.sources].reverse(),
    evidenceSources: Object.fromEntries(Object.entries(profile.evidenceSources).reverse()),
    nodes: [...profile.nodes].reverse(),
    edges: [...profile.edges].reverse(),
    metrics: [...profile.metrics].reverse(),
    diagnostics: [...profile.diagnostics].reverse(),
  }
}
