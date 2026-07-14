import { POSTGRES_CATALOG_PROFILE_INTEGRITY_RECORD_SELECTS } from './profiler-postgres-query-integrity-records.js'
import { POSTGRES_CATALOG_PROFILE_STRUCTURE_RECORD_SELECTS } from './profiler-postgres-query-structure-records.js'

export const POSTGRES_CATALOG_PROFILE_RECORD_SELECTS = [
  ...POSTGRES_CATALOG_PROFILE_STRUCTURE_RECORD_SELECTS,
  ...POSTGRES_CATALOG_PROFILE_INTEGRITY_RECORD_SELECTS,
] as const

export const POSTGRES_CATALOG_PROFILE_ORDER_BY =
  'order by record_kind, schema_name, table_name, column_name, constraint_name, index_name;'
