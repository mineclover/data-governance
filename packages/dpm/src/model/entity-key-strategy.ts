import type {
  ModelEndpoint,
} from './endpoint.js'
import type {
  EntityDeclaration,
  EntityKeyStrategy,
} from './entity-types.js'
import { resolveDpmCanonicalKeyEncodingVersion } from './canonical-key-encoding.js'
import { requireNonEmpty } from './normalize-utils.js'

export function normalizeEntityKeyStrategy(
  strategy: EntityKeyStrategy,
  root: ModelEndpoint,
): EntityDeclaration['keyStrategy'] {
  const separator = strategy.separator ?? ':'
  requireNonEmpty(separator, 'entity.keyStrategy.separator')
  if (strategy.canonicalColumns.length === 0) {
    throw new Error('entity.keyStrategy.canonicalColumns must contain at least one column')
  }
  if (strategy.type === 'single_column' && strategy.canonicalColumns.length !== 1) {
    throw new Error('single_column entity keys require exactly one canonical column')
  }

  const canonicalColumns = strategy.canonicalColumns.map((column, index) =>
    requireRootColumn(root, column, `entity.keyStrategy.canonicalColumns[${index}]`),
  )
  const tenant = strategy.tenant
    ? {
        columns: strategy.tenant.columns.map((column, index) =>
          requireRootColumn(root, column, `entity.keyStrategy.tenant.columns[${index}]`),
        ),
      }
    : undefined

  return {
    type: strategy.type,
    canonicalColumns,
    separator,
    encodingVersion: resolveDpmCanonicalKeyEncodingVersion(
      strategy.encodingVersion,
      'entity.keyStrategy.encodingVersion',
    ),
    ...(tenant ? { tenant } : {}),
  }
}

function requireRootColumn(root: ModelEndpoint, column: string, label: string): string {
  const normalized = requireNonEmpty(column, label)
  if (!root.columns.includes(normalized)) {
    throw new Error(`${label} must be declared on entity.root.columns`)
  }
  return normalized
}
