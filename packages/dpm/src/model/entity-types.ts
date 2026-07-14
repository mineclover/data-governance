import type { TenantNamespaceInput } from './canonical-key.js'
import type { DpmCanonicalKeyEncodingVersion } from './canonical-key-encoding.js'
import type { ModelEndpoint } from './endpoint.js'

export type EntityKeyStrategyType = 'single_column' | 'composite'

export type EntityKeyStrategy = {
  type: EntityKeyStrategyType
  canonicalColumns: string[]
  separator?: string
  tenant?: TenantNamespaceInput
  encodingVersion?: DpmCanonicalKeyEncodingVersion
}

export type EntityTransform = {
  type: 'deterministic_token'
  namespace: string
  prefix?: string
  reversible: boolean
}

export type EntityDeclarationInput = {
  name: string
  namespace: string
  root: ModelEndpoint
  keyStrategy: EntityKeyStrategy
  transform: EntityTransform
}

export type EntityDeclaration = EntityDeclarationInput & {
  identity: string
  keyStrategy: EntityKeyStrategy & {
    separator: string
    encodingVersion: DpmCanonicalKeyEncodingVersion
  }
}
