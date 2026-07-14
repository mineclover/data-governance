export const POSTGRES_CATALOG_PROFILE_FOREIGN_KEY_RECORD_SELECT = `select
  'foreign_key' as record_kind,
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
  ref.schema_name as referenced_schema_name,
  ref.table_name as referenced_table_name,
  rcc.columns as referenced_columns,
  lower(replace(con.confdeltype::text, 'a', 'no_action')) as on_delete,
  lower(replace(con.confupdtype::text, 'a', 'no_action')) as on_update,
  null::text,
  null::text[],
  null::boolean,
  null::text,
  null::text,
  null::boolean
from pg_catalog.pg_constraint con
join relations r on r.relation_oid = con.conrelid
join relations ref on ref.relation_oid = con.confrelid
join constraint_columns cc on cc.constraint_oid = con.oid
join referenced_constraint_columns rcc on rcc.constraint_oid = con.oid
where con.contype = 'f'`
