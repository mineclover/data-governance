export const POSTGRES_CATALOG_PROFILE_COLUMN_RECORD_SELECT = `select
  'column' as record_kind,
  r.schema_name,
  null::text,
  r.table_name,
  null::text,
  a.attname as column_name,
  pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
  a.attnotnull = false as is_nullable,
  a.attnum as ordinal_position,
  pg_catalog.pg_get_expr(def.adbin, def.adrelid) as default_value,
  null::text,
  null::text[],
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
from relations r
join pg_catalog.pg_attribute a on a.attrelid = r.relation_oid
left join pg_catalog.pg_attrdef def on def.adrelid = a.attrelid and def.adnum = a.attnum
where a.attnum > 0 and not a.attisdropped` as const
