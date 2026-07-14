import {
  REGISTRY_RELATIONSHIP_STATUSES,
  type RegistryRelationshipStatus,
} from './registry-relationship-status-taxonomy.js'
import { requireString } from './registry-yaml-values.js'

export function toRegistryYamlStatus(value: unknown): RegistryRelationshipStatus {
  const status = requireString(value, 'relationship.status') as RegistryRelationshipStatus
  if (!(REGISTRY_RELATIONSHIP_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`relationship.status must be one of ${REGISTRY_RELATIONSHIP_STATUSES.join(', ')}`)
  }
  return status
}
