import {
  arrayOf,
  integerSchema,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayDryRunSchemas() {
  return {
    DpmDryRunResult: requiredObjectSchema({
      kind: { type: 'string', const: 'dpm.dry-run-report.v1' },
      planIdentity: stringSchema(),
      manifestId: stringSchema(),
      stale: { type: 'boolean' },
      impact: requiredObjectSchema({
        namespaces: integerSchema(),
        relationships: integerSchema(),
        columns: integerSchema(),
        piiColumns: integerSchema(),
        estimatedRows: integerSchema(),
      }),
      categories: arrayOf(ref('DpmDryRunCategory')),
      rawValuesIncluded: { type: 'boolean', const: false },
    }),
    DpmDryRunCategory: requiredObjectSchema({
      name: {
        type: 'string',
        enum: ['namespace_bindings', 'relationship_steps', 'column_steps', 'pii_columns', 'estimated_rows'],
      },
      count: integerSchema(),
    }),
  } as const
}
