import type {
  RegistryRelationshipInput,
} from '../registry/registry-relationship-types.js'
import type { RegistryTransformStrategy } from '../registry/registry-transform-taxonomy.js'
import type { TenantNamespaceInput } from './canonical-key.js'
import type { DpmCanonicalKeyEncodingVersion } from './canonical-key-encoding.js'
import type { ModelEndpoint } from './endpoint.js'

export type LogicalRelationshipKind = RegistryRelationshipInput['type']
export type LogicalRelationshipOrphanPolicy = RegistryRelationshipInput['orphanPolicy']
export type LogicalRelationshipCardinality = 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many'

export type LogicalRelationshipCondition = {
  contextColumns?: string[]
  conditionSql?: string
  temporalCondition?: string
  metadata?: Record<string, unknown>
}

export type TemporalRelationshipInput = {
  validTimeColumn?: string
  validTimeAbsentReason?: string
}

export type RelationshipCanonicalKeyStrategy = {
  components: string[]
  separator?: string
  tenant?: TenantNamespaceInput
  encodingVersion?: DpmCanonicalKeyEncodingVersion
}

export type LogicalRelationshipInput = {
  name: string
  type: LogicalRelationshipKind
  cardinality: LogicalRelationshipCardinality
  parent: ModelEndpoint
  child: ModelEndpoint
  namespace: string
  transformStrategy: RegistryTransformStrategy
  orphanPolicy: LogicalRelationshipOrphanPolicy
  condition?: LogicalRelationshipCondition
  temporal?: TemporalRelationshipInput
  canonicalKey?: RelationshipCanonicalKeyStrategy
}

export type LogicalRelationship = LogicalRelationshipInput & {
  identity: string
  condition: LogicalRelationshipCondition & {
    contextColumns: string[]
  }
  canonicalKey: RelationshipCanonicalKeyStrategy & {
    separator: string
    encodingVersion: DpmCanonicalKeyEncodingVersion
  }
}
