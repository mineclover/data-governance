import { describe, expect, it } from 'vitest'

import {
  createDpmGatewayRuntime,
  createDpmProfileAnalysisReport,
  createDpmRelationshipCandidateInputFromProfileHint,
  createDpmRelationshipCandidateInputFromResolvedProfileHint,
  resolveDpmRelationshipCandidateEndpointsFromProfileHint,
} from '../src/index.js'
import {
  createKafkaProfileArtifact,
} from './support/profile-analysis-fixtures.js'

describe('DPM profile relationship candidate bridge', () => {
  it('turns reviewer-mapped profile relationship hints into importable non-executable candidates', async () => {
    const profileArtifact = createKafkaProfileArtifact()
    const report = createDpmProfileAnalysisReport({ profileArtifact })
    const relationshipHint = report.relationshipHints.find(candidate =>
      candidate.id === 'proposal:edge:relationship-hint:hint:orders-created-customer'
    )
    if (!relationshipHint) throw new Error('expected explicit Kafka relationship hint')

    const candidateInput = createDpmRelationshipCandidateInputFromProfileHint({
      profileArtifact,
      relationshipHint,
      relationshipName: 'rel_orders_customer',
      parent: {
        table: 'public.customers',
        columns: ['customer_no'],
      },
      child: {
        table: 'public.orders',
        columns: ['customer_no'],
      },
    })
    const runtime = createDpmGatewayRuntime()
    const imported = await runtime.importDpmRelationshipCandidates({
      datasetId: profileArtifact.datasetId,
      candidates: [candidateInput],
    })

    expect(candidateInput).toMatchObject({
      id: 'candidate:profile:proposal_edge_relationship_hint_hint_orders_created_customer',
      relationshipName: 'rel_orders_customer',
      type: 'one_to_many',
      parent: {
        table: 'public.customers',
        columns: ['customer_no'],
      },
      child: {
        table: 'public.orders',
        columns: ['customer_no'],
      },
      confidenceScore: 0.93,
      evidence: [
        expect.objectContaining({
          kind: 'service_code_hint',
          score: 0.93,
          message: relationshipHint.explanation,
          source: {
            kind: 'db',
            entity: 'profile_relationship_hint',
            id: relationshipHint.id,
            pointer: '/value/customer/customer_no',
          },
          metadata: expect.objectContaining({
            profileId: profileArtifact.profileId,
            profileVersion: profileArtifact.profileVersion,
            datasetId: profileArtifact.datasetId,
            relationshipHintId: relationshipHint.id,
            relationshipHintSource: 'explicit_hint',
            fromNodeId: relationshipHint.fromNodeId,
            hintNodeId: relationshipHint.hintNodeId,
            targetRef: relationshipHint.targetRef,
            evidenceIds: [...relationshipHint.evidenceIds],
            sourceCoordinate: expect.objectContaining({
              kind: 'kafka_topic_bundle',
              path: 'orders.created.value.customer.customer_no',
            }),
          }),
        }),
      ],
      warnings: [],
    })
    expect(imported.body.result).toMatchObject({
      imported: 1,
      rejected: 0,
      report: {
        datasetId: profileArtifact.datasetId,
        candidates: [
          expect.objectContaining({
            relationshipName: 'rel_orders_customer',
            recommendation: 'review',
            executable: false,
          }),
        ],
      },
    })
    expect(JSON.stringify(imported.body.result)).not.toContain('"status":"approved"')
    expect(JSON.stringify(imported.body.result)).not.toContain('registryVersion')
  })

  it('resolves profile hint target and source coordinates into relationship endpoints', async () => {
    const profileArtifact = createKafkaProfileArtifact()
    const report = createDpmProfileAnalysisReport({ profileArtifact })
    const relationshipHint = report.relationshipHints.find(candidate =>
      candidate.id === 'proposal:edge:relationship-hint:hint:orders-created-customer'
    )
    if (!relationshipHint) throw new Error('expected explicit Kafka relationship hint')

    const resolution = resolveDpmRelationshipCandidateEndpointsFromProfileHint({
      profileArtifact,
      relationshipHint,
      targetCatalogAuthority: 'commerce',
      childTableByPathPrefix: {
        'orders.created': 'public.orders',
      },
    })
    const candidateInput = createDpmRelationshipCandidateInputFromResolvedProfileHint({
      profileArtifact,
      relationshipHint,
      relationshipName: 'rel_orders_customer',
      targetCatalogAuthority: 'commerce',
      childTableByPathPrefix: {
        'orders.created': 'public.orders',
      },
      warnings: ['reviewer-mapped-from-profile'],
    })
    const runtime = createDpmGatewayRuntime()
    const imported = await runtime.importDpmRelationshipCandidates({
      datasetId: profileArtifact.datasetId,
      candidates: [candidateInput],
    })

    expect(resolution).toEqual({
      parent: {
        table: 'public.customers',
        columns: ['customer_no'],
      },
      child: {
        table: 'public.orders',
        columns: ['customer_no'],
      },
      warnings: ['target-ref-catalog-authority:commerce'],
      targetRef: {
        endpointRef: 'public.customers.customer_no',
        catalogAuthority: 'commerce',
      },
    })
    expect(candidateInput).toMatchObject({
      relationshipName: 'rel_orders_customer',
      parent: {
        table: 'public.customers',
        columns: ['customer_no'],
      },
      child: {
        table: 'public.orders',
        columns: ['customer_no'],
      },
      warnings: [
        'reviewer-mapped-from-profile',
        'target-ref-catalog-authority:commerce',
      ],
      evidence: [
        expect.objectContaining({
          source: {
            kind: 'db',
            entity: 'profile_relationship_hint',
            id: relationshipHint.id,
            pointer: '/value/customer/customer_no',
          },
          metadata: expect.objectContaining({
            targetRef: 'catalog://commerce/public.customers.customer_no',
            targetRefCatalogAuthority: 'commerce',
            targetRefEndpointPath: 'public.customers.customer_no',
            sourceCoordinate: expect.objectContaining({
              kind: 'kafka_topic_bundle',
              path: 'orders.created.value.customer.customer_no',
              pointer: '/value/customer/customer_no',
            }),
          }),
        }),
      ],
    })
    expect(imported.body.result.report.candidates).toContainEqual(expect.objectContaining({
      relationshipName: 'rel_orders_customer',
      recommendation: 'review',
      executable: false,
    }))
  })

  it('requires explicit target and child table evidence before endpoint resolution', () => {
    const profileArtifact = createKafkaProfileArtifact()
    const report = createDpmProfileAnalysisReport({ profileArtifact })
    const relationshipHint = report.relationshipHints[0]
    if (!relationshipHint) throw new Error('expected relationship hint')
    const relationshipHintWithoutTargetRef = { ...relationshipHint }
    delete relationshipHintWithoutTargetRef.targetRef

    expect(() => resolveDpmRelationshipCandidateEndpointsFromProfileHint({
      profileArtifact,
      relationshipHint: relationshipHintWithoutTargetRef,
      childTable: 'public.orders',
    })).toThrow(/does not include targetRef/)

    expect(() => resolveDpmRelationshipCandidateEndpointsFromProfileHint({
      profileArtifact,
      relationshipHint,
    })).toThrow(/cannot resolve child table/)

    expect(() => resolveDpmRelationshipCandidateEndpointsFromProfileHint({
      profileArtifact,
      relationshipHint,
      targetCatalogAuthority: 'billing',
      childTable: 'public.orders',
    })).toThrow(/does not match expected target catalog authority/)

    expect(() => resolveDpmRelationshipCandidateEndpointsFromProfileHint({
      profileArtifact,
      relationshipHint: {
        ...relationshipHint,
        targetRef: 'https://catalog.example/public.customers.customer_no',
      },
      childTable: 'public.orders',
    })).toThrow(/must use catalog:\/\/\.\.\. or schema\.table\.column/)
  })

  it('requires an existing profile source node before creating a relationship candidate', () => {
    const profileArtifact = createKafkaProfileArtifact()
    const report = createDpmProfileAnalysisReport({ profileArtifact })
    const relationshipHint = report.relationshipHints[0]
    if (!relationshipHint) throw new Error('expected relationship hint')

    expect(() => createDpmRelationshipCandidateInputFromProfileHint({
      profileArtifact,
      relationshipHint: {
        ...relationshipHint,
        fromNodeId: 'node:missing',
      },
      relationshipName: 'rel_orders_customer',
      parent: {
        table: 'public.customers',
        columns: ['customer_no'],
      },
      child: {
        table: 'public.orders',
        columns: ['customer_no'],
      },
    })).toThrow(/references missing source node/)
  })
})
