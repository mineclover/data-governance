import {
  copyEndpoint,
} from './endpoint.js'
import { normalizeEntityKeyStrategy } from './entity-key-strategy.js'
import { copyEntityTransform } from './entity-transform.js'
import type {
  EntityDeclaration,
  EntityDeclarationInput,
} from './entity-types.js'
import { requireNonEmpty } from './normalize-utils.js'

export function createEntityDeclaration(input: EntityDeclarationInput): EntityDeclaration {
  requireNonEmpty(input.name, 'entity.name')
  requireNonEmpty(input.namespace, 'entity.namespace')
  const root = copyEndpoint(input.root, 'entity.root')
  const keyStrategy = normalizeEntityKeyStrategy(input.keyStrategy, root)
  if (input.transform.namespace !== input.namespace) {
    throw new Error('entity transform namespace must match entity namespace')
  }

  return {
    name: input.name,
    namespace: input.namespace,
    root,
    keyStrategy,
    transform: copyEntityTransform(input.transform),
    identity: `entity:${input.namespace}/${input.name}`,
  }
}
