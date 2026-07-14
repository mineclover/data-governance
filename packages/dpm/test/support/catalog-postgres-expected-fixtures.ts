import {
  POSTGRES_CATALOG_CAPTURED_AT,
} from './catalog-postgres-input-fixtures.js'

export const catalogFreshnessVersionHashPattern = /^sha256:[a-f0-9]{64}$/

export const expectedPostgresCatalogSource = {
  kind: 'postgresql',
  database: 'commerce',
  capturedAt: POSTGRES_CATALOG_CAPTURED_AT,
} as const

export const expectedPostgresCatalogTableNames = [
  'public.customers',
  'public.orders',
] as const

export const expectedPostgresCatalogColumnNames = [
  'public.customers.customer_no',
  'public.customers.tenant_id',
  'public.orders.order_id',
  'public.orders.customer_no',
  'public.orders.amount',
] as const

export const expectedPostgresCatalogForeignKey = {
  table: 'public.orders',
  referencedTable: 'public.customers',
  enforced: false,
} as const

export const expectedPostgresCatalogUniqueCandidate = {
  table: 'public.customers',
  reason: 'unique_index',
  confidence: 1,
} as const
