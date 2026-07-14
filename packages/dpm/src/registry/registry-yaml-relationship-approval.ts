import type { RegistryApprovalMetadata } from './registry-relationship-types.js'
import {
  optionalString,
  requireRecord,
  requireString,
} from './registry-yaml-values.js'

export function toRegistryYamlApproval(raw: unknown): RegistryApprovalMetadata {
  const record = requireRecord(raw, 'relationship.approval')
  const approvedBy = optionalString(record.approvedBy ?? record.approved_by, 'approval.approvedBy')
  const approvedAt = optionalString(record.approvedAt ?? record.approved_at, 'approval.approvedAt')
  const reviewedBy = optionalString(record.reviewedBy ?? record.reviewed_by, 'approval.reviewedBy')
  const reviewedAt = optionalString(record.reviewedAt ?? record.reviewed_at, 'approval.reviewedAt')
  const reason = optionalString(record.reason, 'approval.reason')

  return {
    owner: requireString(record.owner, 'approval.owner'),
    ...(approvedBy ? { approvedBy } : {}),
    ...(approvedAt ? { approvedAt } : {}),
    ...(reviewedBy ? { reviewedBy } : {}),
    ...(reviewedAt ? { reviewedAt } : {}),
    ...(reason ? { reason } : {}),
  }
}
