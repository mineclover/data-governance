import type {
  RegistryRelationshipInput,
} from '../registry/registry-relationship-types.js'
import { copyDiscoverySourceCoordinate } from '../discovery/discovery-source-copy.js'
import {
  copyRegistryApproval,
  copyRegistryEvidence,
} from '../registry/registry-relationship-copy.js'
import {
  assertApprovedRegistryRelationshipApprovalMetadata,
} from '../registry/registry-approved-relationship-metadata.js'
import {
  resolveDpmCanonicalKeyEncodingVersion,
  type DpmCanonicalKeyEncodingVersion,
} from '../model/canonical-key-encoding.js'
import type { DpmRegistryRelationshipSaveInput } from './registry-repository-request-types.js'
import type {
  DpmRegistryRelationshipRow,
} from './registry-repository-types.js'
import {
  assertDpmRegistryRowMatchesSnapshot,
  type DpmRegistryRowSnapshotScope,
} from './registry-row-scope.js'

export function dpmRegistryRowToRelationshipInput(
  snapshot: DpmRegistryRowSnapshotScope,
  row: DpmRegistryRelationshipRow,
): RegistryRelationshipInput {
  assertDpmRegistryRowMatchesSnapshot(snapshot, row)

  return {
    name: row.relationshipName,
    version: row.relationshipVersion,
    status: row.status,
    type: row.relationshipType,
    parent: {
      table: row.parentTable,
      columns: [...row.parentColumns],
    },
    child: {
      table: row.childTable,
      columns: [...row.childColumns],
    },
    namespace: row.namespace,
    transformStrategy: row.transformStrategy,
    orphanPolicy: row.orphanPolicy,
    condition: {
      contextColumns: [...row.contextColumns],
      ...(row.conditionSql ? { conditionSql: row.conditionSql } : {}),
      ...(row.temporalCondition ? { temporalCondition: row.temporalCondition } : {}),
    },
    ...(row.confidenceScore !== undefined ? { confidenceScore: row.confidenceScore } : {}),
    evidence: row.evidence.map(copyRegistryEvidence),
    approval: copyRegistryApproval(row.approval),
    ...(row.supersedes ? { supersedes: row.supersedes } : {}),
    ...(row.supersededBy ? { supersededBy: row.supersededBy } : {}),
    ...(row.source ? { source: copyDiscoverySourceCoordinate(row.source) } : {}),
  }
}

export function createDpmRegistryRelationshipRow(
  input: DpmRegistryRelationshipSaveInput,
): DpmRegistryRelationshipRow & {
  canonicalKeyEncodingVersion: DpmCanonicalKeyEncodingVersion
} {
  const relationship = input.relationship
  assertApprovedRegistryRelationshipSaveInput(input)
  const condition = relationship.condition ?? { contextColumns: [] }

  return {
    datasetId: input.datasetId,
    registryVersion: input.registryVersion,
    canonicalKeyEncodingVersion: resolveDpmCanonicalKeyEncodingVersion(
      input.canonicalKeyEncodingVersion,
      'registry relationship save canonicalKeyEncodingVersion',
    ),
    relationshipName: relationship.name,
    relationshipVersion: relationship.version,
    status: relationship.status,
    relationshipType: relationship.type,
    parentTable: relationship.parent.table,
    parentColumns: [...relationship.parent.columns],
    childTable: relationship.child.table,
    childColumns: [...relationship.child.columns],
    namespace: relationship.namespace,
    transformStrategy: relationship.transformStrategy,
    orphanPolicy: relationship.orphanPolicy,
    contextColumns: [...condition.contextColumns],
    ...(condition.conditionSql ? { conditionSql: condition.conditionSql } : {}),
    ...(condition.temporalCondition ? { temporalCondition: condition.temporalCondition } : {}),
    ...(relationship.confidenceScore !== undefined ? { confidenceScore: relationship.confidenceScore } : {}),
    evidence: [...(relationship.evidence ?? [])].map(copyRegistryEvidence),
    approval: copyRegistryApproval(relationship.approval),
    ...(relationship.supersedes ? { supersedes: relationship.supersedes } : {}),
    ...(relationship.supersededBy ? { supersededBy: relationship.supersededBy } : {}),
    ...(relationship.source ? { source: copyDiscoverySourceCoordinate(relationship.source) } : {}),
    ...(input.sourceFreshnessHash ? { sourceFreshnessHash: input.sourceFreshnessHash } : {}),
    ...(input.createdAt ? { createdAt: input.createdAt } : {}),
    ...(input.updatedAt ? { updatedAt: input.updatedAt } : {}),
  }
}

function assertApprovedRegistryRelationshipSaveInput(input: {
  relationship: {
    name: string
    status: string
    approval?: {
      approvedBy?: unknown
      reason?: unknown
    }
  }
}): void {
  if (input.relationship.status !== 'approved') {
    throw new Error(
      `DPM registry saveRelationship only accepts approved relationships: ${input.relationship.name} is ${input.relationship.status}.`,
    )
  }
  assertApprovedRegistryRelationshipApprovalMetadata({
    context: 'saveRelationship',
    relationshipName: input.relationship.name,
    approval: input.relationship.approval,
  })
}

export function copyDpmRegistryRelationshipRow(
  row: DpmRegistryRelationshipRow,
): DpmRegistryRelationshipRow & {
  canonicalKeyEncodingVersion: DpmCanonicalKeyEncodingVersion
} {
  return {
    datasetId: row.datasetId,
    registryVersion: row.registryVersion,
    canonicalKeyEncodingVersion: resolveDpmCanonicalKeyEncodingVersion(
      row.canonicalKeyEncodingVersion,
      'registry relationship row canonicalKeyEncodingVersion',
    ),
    relationshipName: row.relationshipName,
    relationshipVersion: row.relationshipVersion,
    status: row.status,
    relationshipType: row.relationshipType,
    parentTable: row.parentTable,
    parentColumns: [...row.parentColumns],
    childTable: row.childTable,
    childColumns: [...row.childColumns],
    namespace: row.namespace,
    transformStrategy: row.transformStrategy,
    orphanPolicy: row.orphanPolicy,
    contextColumns: [...row.contextColumns],
    ...(row.conditionSql ? { conditionSql: row.conditionSql } : {}),
    ...(row.temporalCondition ? { temporalCondition: row.temporalCondition } : {}),
    ...(row.confidenceScore !== undefined ? { confidenceScore: row.confidenceScore } : {}),
    evidence: row.evidence.map(copyRegistryEvidence),
    approval: copyRegistryApproval(row.approval),
    ...(row.supersedes ? { supersedes: row.supersedes } : {}),
    ...(row.supersededBy ? { supersededBy: row.supersededBy } : {}),
    ...(row.source ? { source: copyDiscoverySourceCoordinate(row.source) } : {}),
    ...(row.sourceFreshnessHash ? { sourceFreshnessHash: row.sourceFreshnessHash } : {}),
    ...(row.createdAt ? { createdAt: row.createdAt } : {}),
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
  }
}
