import type {
  ModelEndpoint,
} from './endpoint.js'
import { resolveDpmCanonicalKeyEncodingVersion } from './canonical-key-encoding.js'
import { requireNonEmpty } from './normalize-utils.js'
import type {
  LogicalRelationship,
  RelationshipCanonicalKeyStrategy,
} from './relationship-types.js'

export function normalizeRelationshipCanonicalKeyStrategy(
  strategy: RelationshipCanonicalKeyStrategy | undefined,
  child: ModelEndpoint,
): LogicalRelationship['canonicalKey'] {
  const components = strategy?.components ?? child.columns
  if (components.length === 0) {
    throw new Error('relationship.canonicalKey.components must contain at least one column')
  }
  const separator = strategy?.separator ?? ':'
  requireNonEmpty(separator, 'relationship.canonicalKey.separator')

  return {
    components: [...components],
    separator,
    encodingVersion: resolveDpmCanonicalKeyEncodingVersion(
      strategy?.encodingVersion,
      'relationship.canonicalKey.encodingVersion',
    ),
    ...(strategy?.tenant ? { tenant: { columns: [...strategy.tenant.columns] } } : {}),
  }
}
