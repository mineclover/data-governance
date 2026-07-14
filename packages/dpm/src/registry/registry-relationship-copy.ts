import type {
  RegistryApprovalMetadata,
  RegistryEndpoint,
  RegistryEvidence,
} from './registry-relationship-types.js'
import { copyDiscoverySourceCoordinate } from '../discovery/discovery-source-copy.js'

export function copyRegistryEndpoint(endpoint: RegistryEndpoint): RegistryEndpoint {
  return {
    table: endpoint.table,
    columns: [...endpoint.columns],
  }
}

export function copyRegistryEvidence(evidence: RegistryEvidence): RegistryEvidence {
  return {
    kind: evidence.kind,
    message: evidence.message,
    ...(evidence.score !== undefined ? { score: evidence.score } : {}),
    ...(evidence.source ? { source: copyDiscoverySourceCoordinate(evidence.source) } : {}),
    ...(evidence.metadata ? { metadata: JSON.parse(JSON.stringify(evidence.metadata)) as Record<string, unknown> } : {}),
  }
}

export function copyRegistryApproval(approval: RegistryApprovalMetadata): RegistryApprovalMetadata {
  return {
    owner: approval.owner,
    ...(approval.approvedBy ? { approvedBy: approval.approvedBy } : {}),
    ...(approval.approvedAt ? { approvedAt: approval.approvedAt } : {}),
    ...(approval.reviewedBy ? { reviewedBy: approval.reviewedBy } : {}),
    ...(approval.reviewedAt ? { reviewedAt: approval.reviewedAt } : {}),
    ...(approval.reason ? { reason: approval.reason } : {}),
  }
}

export function byRegistryEvidence(left: RegistryEvidence, right: RegistryEvidence): number {
  return `${left.kind}.${left.message}`.localeCompare(`${right.kind}.${right.message}`)
}
