import type { EntityDeclarationInput } from '../../src/index.js'

export function createSingleColumnCustomerEntityInput(): EntityDeclarationInput {
  return {
    name: 'customer',
    namespace: 'customer',
    root: {
      table: 'public.customers',
      columns: ['customer_no'],
    },
    keyStrategy: {
      type: 'single_column',
      canonicalColumns: ['customer_no'],
    },
    transform: {
      type: 'deterministic_token',
      namespace: 'customer',
      prefix: 'CUST',
      reversible: true,
    },
  }
}

export function createTenantScopedCustomerEntityInput(): EntityDeclarationInput {
  return {
    name: 'account_customer',
    namespace: 'customer',
    root: {
      table: 'public.customers',
      columns: ['tenant_id', 'customer_no'],
    },
    keyStrategy: {
      type: 'composite',
      canonicalColumns: ['customer_no'],
      tenant: {
        columns: ['tenant_id'],
      },
      separator: ':',
    },
    transform: {
      type: 'deterministic_token',
      namespace: 'customer',
      prefix: 'CUST',
      reversible: true,
    },
  }
}
