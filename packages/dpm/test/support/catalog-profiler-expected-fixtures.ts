export const expectedProfilerPostgresTableNames = [
  'public.customers',
  'public.orders',
] as const

export const expectedProfilerPostgresColumnSummaries = [
  'public.customers.customer_no:text:false',
  'public.customers.tenant_id:text:false',
  'public.orders.order_id:bigint:false',
  'public.orders.customer_no:text:false',
  'public.orders.amount:numeric:false',
] as const

export const expectedProfilerPostgresPrimaryKeyNames = [
  'public.customers.customers_pkey',
  'public.orders.orders_pkey',
] as const

export const expectedProfilerPostgresForeignKey = {
  table: 'public.orders',
  name: 'orders_customer_no_fkey',
  columns: ['customer_no'],
  referencedTable: 'public.customers',
  referencedColumns: ['customer_no'],
  enforced: true,
  onDelete: 'no_action',
  onUpdate: 'no_action',
} as const

export const expectedProfilerPostgresIndexSummaries = [
  'public.customers.customers_customer_no_idx:btree:true',
  'public.orders.orders_customer_no_idx:btree:false',
] as const

export const expectedProfilerPostgresUniqueCandidateSummaries = [
  'public.customers.customers_customer_no_idx_unique_candidate:unique_index',
  'public.customers.customers_pkey_unique_candidate:primary_key',
  'public.orders.orders_pkey_unique_candidate:primary_key',
] as const

export const expectedProfilerPostgresOrdersSource = {
  kind: 'db',
  entity: 'table',
  id: 'public.orders',
  pointer: '#/tables/public.orders',
} as const
