export type ModelEndpoint = {
  table: string
  columns: string[]
}

export function copyEndpoint(endpoint: ModelEndpoint, label = 'endpoint'): ModelEndpoint {
  requireEndpointField(endpoint.table, `${label}.table`)
  if (endpoint.columns.length === 0) {
    throw new Error(`${label}.columns must contain at least one column`)
  }
  return {
    table: endpoint.table,
    columns: endpoint.columns.map((column, index) => requireEndpointField(column, `${label}.columns[${index}]`)),
  }
}

function requireEndpointField(value: string, label: string): string {
  if (value.length === 0) {
    throw new Error(`${label} must be a non-empty string`)
  }
  return value
}
