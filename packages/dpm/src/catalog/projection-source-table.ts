import type {
  SchemaSourceCoordinate,
} from '@oa-sdk/openapi-projection-contract'

import type {
  CatalogTable,
} from './structure-types.js'

type DbSchemaSourceCoordinate = Extract<SchemaSourceCoordinate, { kind: 'db' }>

export function catalogTableFromProjectionSource(source: SchemaSourceCoordinate): CatalogTable | undefined {
  if (source.kind !== 'db') return undefined
  if (source.entity !== 'table') return undefined

  const tableId = projectionTableIdFromSource(source)
  const [schema, name] = splitProjectionTableId(tableId)

  return {
    schema,
    name,
    table: tableId,
    kind: 'table',
    source,
  }
}

function projectionTableIdFromSource(source: DbSchemaSourceCoordinate): string {
  return source.id.includes('.') ? source.id : `public.${source.id}`
}

function splitProjectionTableId(tableId: string): [schema: string, name: string] {
  const separator = tableId.indexOf('.')
  if (separator === -1) return ['public', tableId]
  return [tableId.slice(0, separator), tableId.slice(separator + 1)]
}
