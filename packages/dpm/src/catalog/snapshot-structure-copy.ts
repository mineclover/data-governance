import { copySourceCoordinate } from './snapshot-source-copy.js'
import type {
  CatalogColumn,
  CatalogSchema,
  CatalogTable,
} from './structure-types.js'

export function copySchema(schema: CatalogSchema): CatalogSchema {
  return {
    name: schema.name,
    ...(schema.owner ? { owner: schema.owner } : {}),
    ...(schema.source ? { source: copySourceCoordinate(schema.source) } : {}),
  }
}

export function copyTable(table: CatalogTable): CatalogTable {
  return {
    schema: table.schema,
    name: table.name,
    table: table.table,
    kind: table.kind,
    ...(table.source ? { source: copySourceCoordinate(table.source) } : {}),
  }
}

export function copyColumn(column: CatalogColumn): CatalogColumn {
  return {
    table: column.table,
    name: column.name,
    dataType: column.dataType,
    nullable: column.nullable,
    ordinal: column.ordinal,
    ...(column.defaultValue !== undefined ? { defaultValue: column.defaultValue } : {}),
    ...(column.source ? { source: copySourceCoordinate(column.source) } : {}),
  }
}
