export const expectedPublishingRelationshipMetadata = [
  {
    name: 'rel_orders_customer',
    namespace: 'customer',
    cardinality: 'one_to_many',
    joinPredicate: 'public.orders.customer_no = public.customers.customer_no',
    readonly: true,
  },
] as const

export const expectedPublishingAiRelationshipContext = {
  name: 'rel_orders_customer',
  namespace: 'customer',
  cardinality: 'one_to_many',
  description: 'Join public.orders to public.customers through the customer namespace.',
  examples: [
    {
      child: 'public.orders.customer_no',
      parent: 'public.customers.customer_no',
    },
  ],
} as const

export const expectedPublishingReadonlyGrantHints = [
  'Use read-only access to the pseudonymized target dataset.',
  'Do not request source database, secret store, or token lookup access.',
] as const
