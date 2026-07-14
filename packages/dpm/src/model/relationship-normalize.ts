import {
  copyEndpoint,
} from './endpoint.js'
import { requireNonEmpty } from './normalize-utils.js'
import { normalizeRelationshipCanonicalKeyStrategy } from './relationship-canonical-key-strategy.js'
import { normalizeRelationshipCondition } from './relationship-condition.js'
import { copyTemporalRelationshipInput } from './relationship-temporal.js'
import type {
  LogicalRelationship,
  LogicalRelationshipInput,
} from './relationship-types.js'

export function createLogicalRelationship(input: LogicalRelationshipInput): LogicalRelationship {
  requireNonEmpty(input.name, 'relationship.name')
  requireNonEmpty(input.namespace, 'relationship.namespace')
  const parent = copyEndpoint(input.parent, 'relationship.parent')
  const child = copyEndpoint(input.child, 'relationship.child')
  const condition = normalizeRelationshipCondition(input.condition)

  if (input.type === 'polymorphic' && !condition.conditionSql) {
    throw new Error('polymorphic relationships require conditionSql')
  }
  if (input.type === 'temporal' && !input.temporal?.validTimeColumn && !input.temporal?.validTimeAbsentReason) {
    throw new Error('temporal relationships require validTimeColumn or validTimeAbsentReason')
  }
  if ((parent.columns.length > 1 || child.columns.length > 1) && !input.canonicalKey) {
    throw new Error('composite relationships require canonicalKey')
  }

  return {
    name: input.name,
    type: input.type,
    cardinality: input.cardinality,
    parent,
    child,
    namespace: input.namespace,
    transformStrategy: input.transformStrategy,
    orphanPolicy: input.orphanPolicy,
    condition,
    ...(input.temporal ? { temporal: copyTemporalRelationshipInput(input.temporal) } : {}),
    canonicalKey: normalizeRelationshipCanonicalKeyStrategy(input.canonicalKey, child),
    identity: `relationship:${input.namespace}/${input.name}`,
  }
}
