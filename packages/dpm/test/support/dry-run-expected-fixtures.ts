export const DPM_DRY_RUN_EXPECTED_IMPACT = {
  namespaces: 1,
  relationships: 1,
  columns: 2,
  piiColumns: 2,
  estimatedRows: 5,
} as const

export const DPM_DRY_RUN_EXPECTED_CATEGORY_NAMES = [
  'namespace_bindings',
  'relationship_steps',
  'column_steps',
  'pii_columns',
  'estimated_rows',
] as const
