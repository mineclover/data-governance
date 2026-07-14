import type {
  SchemaSourceCoordinate,
} from '@oa-sdk/openapi-projection-contract'

export type CatalogSchema = {
  name: string
  owner?: string
  source?: SchemaSourceCoordinate
}

export type CatalogTable = {
  schema: string
  name: string
  table: string
  kind: 'table' | 'view' | 'materialized_view'
  source?: SchemaSourceCoordinate
}

export type CatalogColumn = {
  table: string
  name: string
  dataType: string
  nullable: boolean
  ordinal: number
  defaultValue?: string
  source?: SchemaSourceCoordinate
}
