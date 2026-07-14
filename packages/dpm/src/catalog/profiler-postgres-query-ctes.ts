export const POSTGRES_CATALOG_PROFILE_CTES = `with
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
)`
