import type { RegistryRelationshipInput } from './registry-relationship-types.js'
import {
  toRegistryYamlApproval,
  toRegistryYamlCondition,
  toRegistryYamlEvidence,
} from './registry-yaml-relationship-metadata.js'
import { toRegistryYamlEndpoint } from './registry-yaml-relationship-sections.js'
import { toRegistryYamlStatus } from './registry-yaml-relationship-status.js'
import {
  optionalNumber,
  optionalString,
  requireArray,
  requireRecord,
  requireString,
} from './registry-yaml-values.js'

export function toRegistryRelationshipInput(raw: unknown): RegistryRelationshipInput {
  const record = requireRecord(raw, 'relationship')
  const condition = toRegistryYamlCondition(record.condition)
  const confidenceScore = optionalNumber(record.confidenceScore ?? record.confidence_score, 'confidenceScore')
  const supersedes = optionalString(record.supersedes, 'supersedes')
  const supersededBy = optionalString(record.supersededBy ?? record.superseded_by, 'supersededBy')

  return {
    name: requireString(record.name, 'relationship.name'),
    version: requireString(record.version, 'relationship.version'),
    status: toRegistryYamlStatus(record.status),
    type: requireString(record.type, 'relationship.type') as RegistryRelationshipInput['type'],
    parent: toRegistryYamlEndpoint(record.parent, 'relationship.parent'),
    child: toRegistryYamlEndpoint(record.child, 'relationship.child'),
    namespace: requireString(record.namespace, 'relationship.namespace'),
    transformStrategy: requireString(
      record.transformStrategy ?? record.transform_strategy,
      'relationship.transformStrategy',
    ) as RegistryRelationshipInput['transformStrategy'],
    orphanPolicy: requireString(
      record.orphanPolicy ?? record.orphan_policy,
      'relationship.orphanPolicy',
    ) as RegistryRelationshipInput['orphanPolicy'],
    ...(condition ? { condition } : {}),
    ...(confidenceScore !== undefined ? { confidenceScore } : {}),
    evidence: requireArray(record.evidence ?? [], 'relationship.evidence').map(toRegistryYamlEvidence),
    approval: toRegistryYamlApproval(record.approval),
    ...(supersedes ? { supersedes } : {}),
    ...(supersededBy ? { supersededBy } : {}),
  }
}
