import {
  profileAnalysisReport,
  profileArtifact,
  profileCoordinate,
  relationshipHint,
} from './gateway-profile-fixtures.js'
import {
  DPM_PROFILE_BASELINE_KIND,
  createRegistrySnapshot,
  type RegistryRelationshipInput,
} from '../../src/index.js'
import type {
  GatewayMinimalResponseCase,
} from './gateway-workflow-response-case-types.js'
import {
  readCommerceDiscoveryReport,
} from './discovery-fixtures.js'

export const profileBaselineSummary = {
  kind: DPM_PROFILE_BASELINE_KIND,
  baselineRef: 'dpm-profile-baseline:commerce_ai:profile:kafka:orders-created:sha256:profile',
  datasetId: 'commerce_ai',
  profileId: 'profile:kafka:orders-created',
  profileVersion: '2026-07-07',
  profileVersionHash: 'sha256:profile',
  profileSummary: {
    nodeCount: 1,
    edgeCount: 0,
    metricCount: 0,
    diagnosticCount: 0,
  },
  hasAnalysisReport: false,
}

const relationshipCandidate = readCommerceDiscoveryReport().candidates[0]!

const approvedRegistryRelationshipInput: RegistryRelationshipInput = {
  name: 'rel_orders_customer',
  version: '1',
  status: 'approved',
  type: relationshipCandidate.type,
  parent: relationshipCandidate.parent,
  child: relationshipCandidate.child,
  namespace: 'customer',
  transformStrategy: 'relationship_token',
  orphanPolicy: 'block',
  confidenceScore: relationshipCandidate.confidence.score,
  evidence: relationshipCandidate.evidence,
  approval: {
    owner: 'privacy-platform',
    approvedBy: 'privacy-reviewer',
    reason: 'reviewed relationship hint',
  },
}

export const gatewayProfileMinimalResponseCases = [
  ['DpmProfileInspectionResponse', {
    profileArtifact,
    nodeCount: 1,
    edgeCount: 0,
    metricCount: 0,
    diagnostics: [],
  }],
  ['DpmProfileAnalysisResponse', {
    analysisReport: profileAnalysisReport,
  }],
  ['DpmProfileBaselineSummaryListResponse', {
    baselineSummaries: [profileBaselineSummary],
  }],
  ['DpmProfileProposalReviewResponse', {
    proposalId: relationshipHint.id,
    status: 'accepted',
    reviewedBy: 'privacy-reviewer',
    reason: 'reviewed against catalog evidence',
    coordinate: profileCoordinate,
    relationshipHint,
    diagnostics: [],
  }],
  ['DpmProfileRelationshipHintApprovalResponse', {
    relationshipName: 'rel_orders_customer',
    status: 'approved',
    candidateInput: {
      id: 'candidate:profile:orders-customer',
      relationshipName: 'rel_orders_customer',
      type: relationshipCandidate.type,
      parent: relationshipCandidate.parent,
      child: relationshipCandidate.child,
      confidenceScore: relationshipCandidate.confidence.score,
      evidence: relationshipCandidate.evidence,
    },
    reviewCandidate: relationshipCandidate,
    candidateImport: {
      imported: 1,
      rejected: 0,
      report: readCommerceDiscoveryReport(),
    },
    relationship: approvedRegistryRelationshipInput,
    relationshipWriteReceipt: {
      kind: 'dpm.relationship.registry-write-receipt.v1',
      datasetId: 'commerce_ai',
      registryVersion: 'registry-profile-workflow-v1',
      relationshipName: 'rel_orders_customer',
      relationshipVersion: '1',
      relationshipIdentity: 'commerce_ai/rel_orders_customer@1',
      status: 'approved',
      approvalAuditEventId: 'audit:profile-hint:rel-orders-customer-approved',
    },
    registrySnapshot: createRegistrySnapshot({
      datasetId: 'commerce_ai',
      registryVersion: 'registry-profile-workflow-v1',
      relationships: [approvedRegistryRelationshipInput],
    }),
  }],
] as const satisfies readonly GatewayMinimalResponseCase[]
