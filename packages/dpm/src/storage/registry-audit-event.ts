import {
  copyDiscoverySourceCoordinate,
} from '../discovery/discovery-source-copy.js'
import {
  copyRegistryApproval,
} from '../registry/registry-relationship-copy.js'
import type {
  DpmRegistryRelationshipAuditEventRow,
} from './registry-audit-row-types.js'
import type {
  DpmRegistryRelationshipRow,
} from './registry-storage-row-types.js'

export type DpmRegistryRelationshipAuditEventInput = {
  relationshipRow: DpmRegistryRelationshipRow
  eventId?: string
  occurredAt?: string
  createdAt?: string
}

export function createDpmRegistryRelationshipAuditEventRow(
  input: DpmRegistryRelationshipAuditEventInput,
): DpmRegistryRelationshipAuditEventRow {
  const row = input.relationshipRow
  const actor = row.approval.approvedBy ?? row.approval.reviewedBy
  const reason = row.approval.reason
  const occurredAt = input.occurredAt
    ?? row.approval.approvedAt
    ?? row.updatedAt
    ?? row.createdAt
    ?? new Date().toISOString()
  const missingFields = [
    ...(!isNonEmptyString(actor) ? ['approval.approvedBy'] : []),
    ...(!isNonEmptyString(reason) ? ['approval.reason'] : []),
  ]
  if (missingFields.length > 0) {
    throw new Error(
      `DPM registry audit event for ${row.relationshipName} is missing ${missingFields.join(', ')}.`,
    )
  }
  const actorValue = actor as string
  const reasonValue = reason as string

  return {
    eventId: input.eventId ?? renderDpmRegistryRelationshipAuditEventId(row, occurredAt),
    eventType: 'relationship_approved',
    datasetId: row.datasetId,
    registryVersion: row.registryVersion,
    relationshipName: row.relationshipName,
    relationshipVersion: row.relationshipVersion,
    relationshipStatus: row.status,
    actor: actorValue,
    reason: reasonValue,
    occurredAt,
    ...(row.sourceFreshnessHash ? { sourceFreshnessHash: row.sourceFreshnessHash } : {}),
    approval: copyRegistryApproval(row.approval),
    ...(row.source ? { source: copyDiscoverySourceCoordinate(row.source) } : {}),
    ...(input.createdAt ? { createdAt: input.createdAt } : {}),
  }
}

export function copyDpmRegistryRelationshipAuditEventRow(
  row: DpmRegistryRelationshipAuditEventRow,
): DpmRegistryRelationshipAuditEventRow {
  return {
    eventId: row.eventId,
    eventType: row.eventType,
    datasetId: row.datasetId,
    registryVersion: row.registryVersion,
    relationshipName: row.relationshipName,
    relationshipVersion: row.relationshipVersion,
    relationshipStatus: row.relationshipStatus,
    actor: row.actor,
    reason: row.reason,
    occurredAt: row.occurredAt,
    ...(row.sourceFreshnessHash ? { sourceFreshnessHash: row.sourceFreshnessHash } : {}),
    approval: copyRegistryApproval(row.approval),
    ...(row.source ? { source: copyDiscoverySourceCoordinate(row.source) } : {}),
    ...(row.createdAt ? { createdAt: row.createdAt } : {}),
  }
}

function renderDpmRegistryRelationshipAuditEventId(
  row: Pick<
    DpmRegistryRelationshipRow,
    'datasetId' | 'registryVersion' | 'relationshipName' | 'relationshipVersion'
  >,
  occurredAt: string,
): string {
  return [
    'audit',
    'relationship-approved',
    toIdentifier(row.datasetId),
    toIdentifier(row.registryVersion),
    toIdentifier(row.relationshipName),
    toIdentifier(row.relationshipVersion),
    toIdentifier(occurredAt),
  ].join(':')
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function toIdentifier(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'unspecified'
}
