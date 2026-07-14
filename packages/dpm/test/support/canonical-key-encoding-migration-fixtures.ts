import {
  createRegistrySnapshot,
  type DpmCanonicalKeyEncodingVersion,
  type DpmCompileInput,
} from '../../src/index.js'
import { createCompileInput } from './compiler-input-fixtures.js'

export const LEGACY_STRING_V1_PLAN_IDENTITY =
  'compiled-plan:commerce_ai@2026.07.01:reg-2026-07-01' as const

export const PRE_V2_LITERAL_PLAN_GOLDEN = {
  kind: 'dpm.compiled-plan.v1',
  planVersion: '1.0',
  identity: LEGACY_STRING_V1_PLAN_IDENTITY,
  manifestId: 'commerce_ai@2026.07.01',
  datasetId: 'commerce_ai',
  policyVersion: '2026.07.01',
  manifestCatalogVersionHash: 'sha256:98eb4ac03e44306b28ac2df868a31d9f34ad9fdf706e9ae0fb67fca0e0eda2ef',
  freshness: {
    manifestCatalogVersionHash: 'sha256:98eb4ac03e44306b28ac2df868a31d9f34ad9fdf706e9ae0fb67fca0e0eda2ef',
    catalogVersionHash: 'sha256:98eb4ac03e44306b28ac2df868a31d9f34ad9fdf706e9ae0fb67fca0e0eda2ef',
    registryVersion: 'reg-2026-07-01',
    registryIdentity: 'commerce_ai@reg-2026-07-01',
  },
  stale: false,
  staleReasons: [],
  namespaceBindings: [{
    namespace: 'customer',
    entity: 'customer',
    relationships: ['rel_orders_customer'],
    columns: [
      'public.customers.customer_no',
      'public.orders.customer_no',
    ],
    transform: 'deterministic_token',
  }],
  relationshipSteps: [{
    name: 'rel_orders_customer',
    registryIdentity: 'commerce_ai/rel_orders_customer@1',
    registryStatus: 'approved',
    relationshipType: 'one_to_many',
    cardinality: 'one_to_many',
    parent: {
      table: 'public.customers',
      columns: ['customer_no'],
    },
    child: {
      table: 'public.orders',
      columns: ['customer_no'],
    },
    namespace: 'customer',
    transformStrategy: 'entity_token',
    orphanPolicy: 'block',
  }],
  columnSteps: [
    {
      table: 'public.customers',
      column: 'customer_no',
      columnRef: 'public.customers.customer_no',
      role: 'direct_identifier',
      pii: true,
      transform: 'relationship_token',
      relationship: 'rel_orders_customer',
      namespace: 'customer',
    },
    {
      table: 'public.orders',
      column: 'amount',
      columnRef: 'public.orders.amount',
      role: 'business_metric',
      pii: false,
      transform: 'keep',
    },
    {
      table: 'public.orders',
      column: 'customer_no',
      columnRef: 'public.orders.customer_no',
      role: 'foreign_identifier',
      pii: true,
      transform: 'relationship_token',
      relationship: 'rel_orders_customer',
      namespace: 'customer',
    },
  ],
} as const

export function createCanonicalKeyEncodingMigrationInput(input: {
  manifestEncodingVersion?: DpmCanonicalKeyEncodingVersion
  registryEncodingVersion?: DpmCanonicalKeyEncodingVersion
  registryVersion?: string
} = {}): DpmCompileInput {
  const base = createCompileInput()
  const manifest = structuredClone(base.manifest) as Record<string, any>
  const registryVersion = input.registryVersion ?? base.registry.registryVersion
  manifest.relationship_registry.registry_version = registryVersion
  if (input.manifestEncodingVersion) {
    manifest.relationship_registry.canonical_key_encoding_version = input.manifestEncodingVersion
  }

  return {
    ...base,
    manifest,
    registry: createRegistrySnapshot({
      datasetId: base.registry.datasetId,
      registryVersion,
      ...(input.registryEncodingVersion
        ? { canonicalKeyEncodingVersion: input.registryEncodingVersion }
        : {}),
      ...(base.registry.exportedAt ? { exportedAt: base.registry.exportedAt } : {}),
      relationships: base.registry.relationships,
    }),
  }
}

export function createPreV2FieldDeletedRegistryCompileInput(): DpmCompileInput {
  const input = createCanonicalKeyEncodingMigrationInput()
  const registry = structuredClone(input.registry) as DpmCompileInput['registry'] & {
    canonicalKeyEncodingVersion?: DpmCanonicalKeyEncodingVersion
  }
  delete registry.canonicalKeyEncodingVersion

  return {
    ...input,
    registry,
  }
}

export function createIdentityMismatchedRegistryCompileInput(): DpmCompileInput {
  const input = createCanonicalKeyEncodingMigrationInput({
    manifestEncodingVersion: 'typed-v2',
    registryEncodingVersion: 'typed-v2',
  })

  return {
    ...input,
    registry: {
      ...input.registry,
      identity: `${input.registry.datasetId}@${input.registry.registryVersion}`,
    },
  }
}
