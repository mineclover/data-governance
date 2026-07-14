export const POSTGRES_CATALOG_PROFILE_PRIMARY_KEY_RECORD_SELECT = `select
  'primary_key' as record_kind,
  r.schema_name,
  null::text,
  r.table_name,
  null::text,
  null::text,
  null::text,
  null::boolean,
  null::integer,
  null::text,
  con.conname as constraint_name,
  cc.columns as constraint_columns,
  null::text,
  null::text,
  null::text[],
  null::text,
  null::text,
  null::text,
  null::text[],
  null::boolean,
  null::text,
  null::text,
  null::boolean
from pg_catalog.pg_constraint con
join relations r on r.relation_oid = con.conrelid
join constraint_columns cc on cc.constraint_oid = con.oid
where con.contype = 'p'`
