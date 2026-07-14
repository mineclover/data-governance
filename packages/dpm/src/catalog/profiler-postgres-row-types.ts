import type { CatalogTable } from './structure-types.js'

export type PostgresCatalogProfileRecordKind =
  | 'schema'
  | 'table'
  | 'column'
  | 'primary_key'
  | 'foreign_key'
  | 'index'

export type PostgresCatalogProfileRow = {
  record_kind: PostgresCatalogProfileRecordKind
  schema_name: string
  schema_owner?: string
  table_name?: string
  table_kind?: CatalogTable['kind']
  column_name?: string
  data_type?: string
  is_nullable?: boolean
  ordinal_position?: number
  default_value?: string
  constraint_name?: string
  constraint_columns?: string[]
  referenced_schema_name?: string
  referenced_table_name?: string
  referenced_columns?: string[]
  on_delete?: string
  on_update?: string
  index_name?: string
  index_columns?: string[]
  index_unique?: boolean
  index_method?: string
  index_predicate?: string
  index_primary?: boolean
}

export type PostgresCatalogRowsToSnapshotInput = {
  database: string
  rows: readonly PostgresCatalogProfileRow[]
  capturedAt?: string
}
