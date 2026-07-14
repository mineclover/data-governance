import {
  renderCanonicalKeySegments,
  type CanonicalKeyValueMap,
} from './canonical-key.js'
import type { LogicalRelationship } from './relationship-types.js'

export function renderRelationshipCanonicalKey(
  relationship: Pick<LogicalRelationship, 'namespace' | 'type' | 'condition' | 'canonicalKey'>,
  values: CanonicalKeyValueMap,
): string {
  const predicate = relationship.type === 'polymorphic' ? relationship.condition.conditionSql : undefined
  return renderCanonicalKeySegments({
    namespace: relationship.namespace,
    separator: relationship.canonicalKey.separator,
    tenantColumns: relationship.canonicalKey.tenant?.columns ?? [],
    ...(predicate ? { predicate } : {}),
    columns: relationship.canonicalKey.components,
    values,
    encodingVersion: relationship.canonicalKey.encodingVersion,
  })
}
