import { describe, expect, it } from 'vitest'

import {
  createDpmProfileAnalysisReport,
  profileKafkaTopicFixture,
  validateDpmProfileArtifactSchema,
} from '../src/index.js'
import {
  readKafkaOrdersCreatedFixture,
  readKafkaOrdersCreatedProfileArtifact,
} from './support/profile-kafka-fixtures.js'

describe('DPM Kafka topic profile graph hints', () => {
  it('keeps relationship hints as profile suggestions, not approved registry entries', () => {
    const profile = readKafkaOrdersCreatedProfileArtifact()
    const serialized = JSON.stringify(profile)

    expect(profile.nodes).toContainEqual(expect.objectContaining({
      id: 'node:relationship-hint:hint:orders-created-customer',
      kind: 'relationship_hint',
    }))
    expect(profile.edges).toContainEqual(expect.objectContaining({
      id: 'edge:relationship-hint:hint:orders-created-customer',
      kind: 'candidate_relationship',
      fromNodeId: 'node:field:orders.created.value.customer.customer_no',
      toNodeId: 'node:relationship-hint:hint:orders-created-customer',
      confidence: 0.93,
    }))
    expect(serialized).not.toContain('"status":"approved"')
    expect(serialized).not.toContain('registryVersion')
  })

  it('turns unresolved relationship hint source paths into diagnostics instead of dangling proposals', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const result = profileKafkaTopicFixture({
      ...fixture,
      topic: {
        ...fixture.topic,
        relationshipHints: [
          ...(fixture.topic.relationshipHints ?? []),
          {
            id: 'hint:orders-created-missing-field',
            label: 'orders.created missing field resembles public.customers.customer_no',
            fromPath: 'value.customer.missing_field',
            toRef: 'catalog://commerce/public.customers.customer_no',
            confidence: 0.73,
          },
          {
            id: 'hint:missing.field/value~1',
            label: 'orders.created escaped missing field resembles public.customers.customer_no',
            fromPath: 'value.customer.other_missing_field',
            toRef: 'catalog://commerce/public.customers.customer_no',
            confidence: 0.72,
          },
        ],
      },
    })
    const profile = result.profileArtifact
    if (!profile) throw new Error('expected Kafka profile artifact')

    expect(result.observedEvidenceKinds).toContain('diagnostic')
    expect(validateDpmProfileArtifactSchema(profile).valid).toBe(true)
    expect(profile.nodes).toContainEqual(expect.objectContaining({
      id: 'node:relationship-hint:hint:orders-created-missing-field',
      kind: 'relationship_hint',
    }))
    expect(profile.edges).not.toContainEqual(expect.objectContaining({
      id: 'edge:relationship-hint:hint:orders-created-missing-field',
      kind: 'candidate_relationship',
      fromNodeId: 'node:field:orders.created.value.customer.missing_field',
    }))
    expect(profile.diagnostics).toContainEqual(expect.objectContaining({
      severity: 'warning',
      code: 'PROF301',
      connectorId: 'dpm.kafka.fixture',
      coordinate: expect.objectContaining({
        path: 'orders.created.relationshipHints.hint:orders-created-missing-field',
        pointer: '/relationshipHints/hint:orders-created-missing-field',
      }),
      evidenceIds: ['evidence:kafka:orders.created.relationship_hint.hint:orders-created-missing-field'],
    }))
    expect(profile.diagnostics).toContainEqual(expect.objectContaining({
      severity: 'warning',
      code: 'PROF301',
      connectorId: 'dpm.kafka.fixture',
      coordinate: expect.objectContaining({
        path: 'orders.created.relationshipHints.hint:missing%2Efield%2Fvalue%7E1',
        pointer: '/relationshipHints/hint:missing.field~1value~01',
      }),
      evidenceIds: ['evidence:kafka:orders.created.relationship_hint.hint:missing%2Efield%2Fvalue%7E1'],
    }))

    const report = createDpmProfileAnalysisReport({ profileArtifact: profile })
    expect(report.relationshipHints).not.toContainEqual(expect.objectContaining({
      id: 'proposal:edge:relationship-hint:hint:orders-created-missing-field',
    }))
    expect(report.relationshipHints).not.toContainEqual(expect.objectContaining({
      id: 'proposal:edge:relationship-hint:hint:missing%2Efield%2Fvalue%7E1',
    }))
  })

  it('escapes relationship hint identities across graph evidence and reviewer proposals', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const result = profileKafkaTopicFixture({
      ...fixture,
      topic: {
        ...fixture.topic,
        relationshipHints: [{
          id: 'hint:customer.raw/value~1',
          label: 'orders.created escaped customer hint',
          fromPath: 'value.customer.customer_no',
          toRef: 'catalog://commerce/public.customers.customer_no',
          confidence: 0.81,
        }],
      },
    })
    const profile = result.profileArtifact
    if (!profile) throw new Error('expected Kafka profile artifact')

    const escapedHintSegment = 'hint:customer%2Eraw%2Fvalue%7E1'
    const hintNodeId = `node:relationship-hint:${escapedHintSegment}`
    const hintEdgeId = `edge:relationship-hint:${escapedHintSegment}`
    const hintEvidenceId = `evidence:kafka:orders.created.relationship_hint.${escapedHintSegment}`

    expect(validateDpmProfileArtifactSchema(profile).valid).toBe(true)
    expect(profile.nodes).toContainEqual(expect.objectContaining({
      id: hintNodeId,
      kind: 'relationship_hint',
      coordinate: expect.objectContaining({
        path: `orders.created.relationshipHints.${escapedHintSegment}`,
        pointer: '/relationshipHints/hint:customer.raw~1value~01',
      }),
    }))
    expect(profile.edges).toContainEqual(expect.objectContaining({
      id: hintEdgeId,
      kind: 'candidate_relationship',
      fromNodeId: 'node:field:orders.created.value.customer.customer_no',
      toNodeId: hintNodeId,
      evidenceIds: [hintEvidenceId],
    }))
    expect(profile.evidenceSources[hintEvidenceId]).toMatchObject({
      coordinate: {
        path: `orders.created.relationshipHints.${escapedHintSegment}`,
        pointer: '/relationshipHints/hint:customer.raw~1value~01',
      },
    })

    const report = createDpmProfileAnalysisReport({ profileArtifact: profile })
    expect(report.relationshipHints).toContainEqual(expect.objectContaining({
      id: `proposal:${hintEdgeId}`,
      hintNodeId,
      evidenceIds: [hintEvidenceId],
    }))
  })
})
