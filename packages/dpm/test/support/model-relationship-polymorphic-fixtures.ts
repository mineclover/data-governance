import type { LogicalRelationshipInput } from '../../src/index.js'

export function createPolymorphicCustomerActivityInput(): LogicalRelationshipInput {
  return {
    name: 'rel_activities_customer',
    type: 'polymorphic',
    cardinality: 'many_to_one',
    parent: {
      table: 'public.customers',
      columns: ['customer_no'],
    },
    child: {
      table: 'public.activities',
      columns: ['object_id'],
    },
    namespace: 'customer',
    transformStrategy: 'entity_token',
    orphanPolicy: 'warn',
  }
}

export function createPolymorphicCustomerActivityWithPredicateInput(): LogicalRelationshipInput {
  return {
    ...createPolymorphicCustomerActivityInput(),
    condition: {
      conditionSql: "object_type = 'CUSTOMER'",
    },
    canonicalKey: {
      components: ['object_id'],
    },
  }
}
