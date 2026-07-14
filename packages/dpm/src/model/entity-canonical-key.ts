import {
  renderCanonicalKeySegments,
  type CanonicalKeyValueMap,
} from './canonical-key.js'
import type { EntityDeclaration } from './entity-types.js'

export function renderEntityCanonicalKey(
  entity: Pick<EntityDeclaration, 'namespace' | 'keyStrategy'>,
  values: CanonicalKeyValueMap,
): string {
  return renderCanonicalKeySegments({
    namespace: entity.namespace,
    separator: entity.keyStrategy.separator,
    tenantColumns: entity.keyStrategy.tenant?.columns ?? [],
    columns: entity.keyStrategy.canonicalColumns,
    values,
    encodingVersion: entity.keyStrategy.encodingVersion,
  })
}
