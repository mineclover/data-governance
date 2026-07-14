import { describe, expect, it } from 'vitest'

import {
  createDpmProfileAnalysisReport,
} from '../src/index.js'
import {
  createKafkaProfileArtifact,
  expectedKafkaRelationshipHintEvidenceIds,
} from './support/profile-analysis-fixtures.js'

describe('DPM profile analysis relationship hints', () => {
  it('emits relationship hints as reviewer proposals, not registry relationships', () => {
    const report = createDpmProfileAnalysisReport({
      profileArtifact: createKafkaProfileArtifact(),
    })
    const hint = report.relationshipHints.find(candidate =>
      candidate.id === 'proposal:edge:relationship-hint:hint:orders-created-customer'
    )

    expect(hint).toMatchObject({
      status: 'review',
      source: 'explicit_hint',
      fromNodeId: 'node:field:orders.created.value.customer.customer_no',
      hintNodeId: 'node:relationship-hint:hint:orders-created-customer',
      targetRef: 'catalog://commerce/public.customers.customer_no',
      confidence: 0.93,
    })
    expect(hint?.evidenceIds).toEqual([...expectedKafkaRelationshipHintEvidenceIds])
    expect(hint?.explanation).toContain('orders.created customer_no')
    expect(report.relationshipHints).not.toContainEqual(expect.objectContaining({
      id: 'proposal:measured:node:field:orders.created.value.customer.customer_no:identifier_like_field',
    }))
    expect(JSON.stringify(hint)).not.toContain('"status":"approved"')
    expect(JSON.stringify(report)).not.toContain('registryVersion')
  })

  it('derives measured relationship review proposals from high-presence identifier-like fields', () => {
    const profileArtifact = createKafkaProfileArtifact()
    const report = createDpmProfileAnalysisReport({
      profileArtifact: {
        ...profileArtifact,
        nodes: profileArtifact.nodes.filter(node => node.kind !== 'relationship_hint'),
        edges: profileArtifact.edges.filter(edge => edge.kind !== 'candidate_relationship'),
      },
    })
    const measuredHint = report.relationshipHints.find(candidate =>
      candidate.id === 'proposal:measured:node:field:orders.created.value.customer.customer_no:identifier_like_field'
    )

    expect(measuredHint).toMatchObject({
      status: 'review',
      source: 'measured_key_candidate',
      fromNodeId: 'node:field:orders.created.value.customer.customer_no',
      confidence: 0.9,
      evidenceIds: ['evidence:kafka:orders.created.value.customer.customer_no'],
    })
    expect(measuredHint).not.toHaveProperty('hintNodeId')
    expect(measuredHint).not.toHaveProperty('targetRef')
    expect(measuredHint?.explanation).toContain('Measured identifier-like field')
    expect(JSON.stringify(report)).not.toContain('"status":"approved"')
    expect(JSON.stringify(report)).not.toContain('registryVersion')
  })

  it('does not promote unresolved candidate relationship edges into reviewer proposals', () => {
    const profileArtifact = createKafkaProfileArtifact()
    const report = createDpmProfileAnalysisReport({
      profileArtifact: {
        ...profileArtifact,
        edges: [
          ...profileArtifact.edges,
          {
            id: 'edge:relationship-hint:missing-source',
            kind: 'candidate_relationship',
            fromNodeId: 'node:field:orders.created.value.customer.missing_field',
            toNodeId: 'node:relationship-hint:hint:orders-created-customer',
            confidence: 0.72,
            evidenceIds: [...expectedKafkaRelationshipHintEvidenceIds],
          },
          {
            id: 'edge:relationship-hint:missing-hint-node',
            kind: 'candidate_relationship',
            fromNodeId: 'node:field:orders.created.value.customer.customer_no',
            toNodeId: 'node:relationship-hint:missing',
            confidence: 0.71,
            evidenceIds: [...expectedKafkaRelationshipHintEvidenceIds],
          },
        ],
      },
    })

    expect(report.relationshipHints).toContainEqual(expect.objectContaining({
      id: 'proposal:edge:relationship-hint:hint:orders-created-customer',
    }))
    expect(report.relationshipHints).not.toContainEqual(expect.objectContaining({
      id: 'proposal:edge:relationship-hint:missing-source',
    }))
    expect(report.relationshipHints).not.toContainEqual(expect.objectContaining({
      id: 'proposal:edge:relationship-hint:missing-hint-node',
    }))
  })
})
