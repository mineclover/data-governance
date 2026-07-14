export const POSTGRES_CATALOG_PROFILE_INDEX_RECORD_SELECT = `select
  'index' as record_kind,
  r.schema_name,
  null::text,
  r.table_name,
  null::text,
  null::text,
  null::text,
  null::boolean,
  null::integer,
  null::text,
  null::text,
  null::text[],
  null::text,
  null::text,
  null::text[],
  null::text,
  null::text,
  ic.relname as index_name,
  idxc.columns as index_columns,
  i.indisunique as index_unique,
  am.amname as index_method,
  pg_catalog.pg_get_expr(i.indpred, i.indrelid) as index_predicate,
  i.indisprimary as index_primary
from pg_catalog.pg_index i
join relations r on r.relation_oid = i.indrelid
join pg_catalog.pg_class ic on ic.oid = i.indexrelid
join pg_catalog.pg_am am on am.oid = ic.relam
join index_columns idxc on idxc.indexrelid = i.indexrelid
where not i.indisprimary`
