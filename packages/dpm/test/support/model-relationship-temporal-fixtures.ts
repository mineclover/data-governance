import type { LogicalRelationshipInput } from '../../src/index.js'

export function createTemporalProductPriceHistoryInput(): LogicalRelationshipInput {
  return {
    name: 'rel_price_history_product',
    type: 'temporal',
    cardinality: 'many_to_one',
    parent: {
      table: 'public.products',
      columns: ['product_id'],
    },
    child: {
      table: 'public.price_history',
      columns: ['product_id'],
    },
    namespace: 'product',
    transformStrategy: 'entity_token',
    orphanPolicy: 'block',
    condition: {
      temporalCondition: 'valid_from <= observed_at and observed_at < valid_to',
    },
  }
}

export function createTemporalProductPriceHistoryWithValidTimeInput(): LogicalRelationshipInput {
  return {
    ...createTemporalProductPriceHistoryInput(),
    temporal: {
      validTimeColumn: 'observed_at',
    },
  }
}
