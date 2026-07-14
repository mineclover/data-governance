with
selected_namespaces as (
  select
    n.oid as schema_oid,
    n.nspname as schema_name,
    pg_catalog.pg_get_userbyid(n.nspowner) as schema_owner
  from pg_catalog.pg_namespace n
  where n.nspname = any($1::text[])
),
relations as (
  select
    c.oid as relation_oid,
    ns.schema_name,
    c.relname as table_name,
    case c.relkind
      when 'r' then 'table'
      when 'p' then 'table'
      when 'v' then 'view'
      when 'm' then 'materialized_view'
    end as table_kind
  from pg_catalog.pg_class c
  join selected_namespaces ns on ns.schema_oid = c.relnamespace
  where c.relkind in ('r', 'p', 'v', 'm')
),
constraint_columns as (
  select
    con.oid as constraint_oid,
    array_agg(att.attname order by ord.ordinality) as columns
  from pg_catalog.pg_constraint con
  join pg_catalog.pg_attribute att on att.attrelid = con.conrelid
  join unnest(con.conkey) with ordinality as ord(attnum, ordinality) on ord.attnum = att.attnum
  group by con.oid
),
referenced_constraint_columns as (
  select
    con.oid as constraint_oid,
    array_agg(att.attname order by ord.ordinality) as columns
  from pg_catalog.pg_constraint con
  join pg_catalog.pg_attribute att on att.attrelid = con.confrelid
  join unnest(con.confkey) with ordinality as ord(attnum, ordinality) on ord.attnum = att.attnum
  group by con.oid
),
index_columns as (
  select
    i.indexrelid,
    array_agg(att.attname order by ord.ordinality) as columns
  from pg_catalog.pg_index i
  join pg_catalog.pg_attribute att on att.attrelid = i.indrelid
  join unnest(i.indkey) with ordinality as ord(attnum, ordinality) on ord.attnum = att.attnum
  where ord.attnum > 0
  group by i.indexrelid
)
select
  'schema' as record_kind,
  ns.schema_name,
  ns.schema_owner,
  null::text as table_name,
  null::text as table_kind,
  null::text as column_name,
  null::text as data_type,
  null::boolean as is_nullable,
  null::integer as ordinal_position,
  null::text as default_value,
  null::text as constraint_name,
  null::text[] as constraint_columns,
  null::text as referenced_schema_name,
  null::text as referenced_table_name,
  null::text[] as referenced_columns,
  null::text as on_delete,
  null::text as on_update,
  null::text as index_name,
  null::text[] as index_columns,
  null::boolean as index_unique,
  null::text as index_method,
  null::text as index_predicate,
  null::boolean as index_primary
from selected_namespaces ns
union all
select
  'table' as record_kind,
  r.schema_name,
  null::text as schema_owner,
  r.table_name,
  r.table_kind,
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
  null::text,
  null::text[],
  null::boolean,
  null::text,
  null::text,
  null::boolean
from relations r
union all
select
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
where a.attnum > 0 and not a.attisdropped
union all
select
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
where con.contype = 'p'
union all
select
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
where con.contype = 'f'
union all
select
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
where not i.indisprimary
order by record_kind, schema_name, table_name, column_name, constraint_name, index_name;
