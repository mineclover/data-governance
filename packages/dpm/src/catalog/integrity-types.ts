import type {
  SchemaSourceCoordinate,
} from '../contract/openapi-projection.js'

export type CatalogPrimaryKey = {
  table: string
  name: string
  columns: string[]
  source?: SchemaSourceCoordinate
}

export type CatalogForeignKey = {
  table: string
  name: string
  columns: string[]
  referencedTable: string
  referencedColumns: string[]
  enforced: boolean
  onDelete?: string
  onUpdate?: string
  source?: SchemaSourceCoordinate
}

export type CatalogIndex = {
  table: string
  name: string
  columns: string[]
  unique: boolean
  method?: string
  predicate?: string
  source?: SchemaSourceCoordinate
}

export type CatalogUniqueCandidate = {
  table: string
  name: string
  columns: string[]
  reason: 'primary_key' | 'unique_index' | 'unique_constraint' | 'profiled_unique'
  confidence: number
  source?: SchemaSourceCoordinate
}
