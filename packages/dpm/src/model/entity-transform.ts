import type { EntityTransform } from './entity-types.js'
import { requireNonEmpty } from './normalize-utils.js'

export function copyEntityTransform(transform: EntityTransform): EntityTransform {
  requireNonEmpty(transform.type, 'entity.transform.type')
  requireNonEmpty(transform.namespace, 'entity.transform.namespace')
  return {
    type: transform.type,
    namespace: transform.namespace,
    ...(transform.prefix ? { prefix: transform.prefix } : {}),
    reversible: transform.reversible,
  }
}
