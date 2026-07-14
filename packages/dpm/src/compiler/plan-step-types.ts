import type {
  RegistryOrphanPolicy,
} from '../registry/registry-orphan-policy-taxonomy.js'
import type {
  RegistryRelationshipKind,
} from '../registry/registry-relationship-kind-taxonomy.js'
import type {
  RegistryTransformStrategy,
} from '../registry/registry-transform-taxonomy.js'
import type { DpmRelationshipStepCardinality } from './plan-taxonomy.js'

export type DpmNamespaceBinding = {
  namespace: string
  entity: string
  relationships: string[]
  columns: string[]
  transform: string
}

export type DpmRelationshipStep = {
  name: string
  registryIdentity: string
  registryStatus: 'approved'
  relationshipType: RegistryRelationshipKind
  cardinality: DpmRelationshipStepCardinality
  parent: {
    table: string
    columns: string[]
  }
  child: {
    table: string
    columns: string[]
  }
  namespace: string
  transformStrategy: RegistryTransformStrategy
  orphanPolicy: RegistryOrphanPolicy
}

export type DpmColumnStep = {
  table: string
  column: string
  columnRef: string
  role: string
  pii: boolean
  transform: string
  relationship?: string
  namespace?: string
}
