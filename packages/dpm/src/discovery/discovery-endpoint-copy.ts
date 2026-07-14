import type {
  RelationshipDiscoveryEndpoint,
} from './discovery-endpoint-types.js'

export function copyDiscoveryEndpoint(endpoint: RelationshipDiscoveryEndpoint): RelationshipDiscoveryEndpoint {
  return {
    table: endpoint.table,
    columns: [...endpoint.columns],
  }
}
