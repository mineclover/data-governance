import type {
  DpmDryRunCategory,
  DpmDryRunImpact,
  DpmDryRunInput,
} from './report-types.js'

export function createDpmDryRunImpact(input: DpmDryRunInput): DpmDryRunImpact {
  const estimatedRows = Object.values(input.estimatedRows ?? {}).reduce((sum, count) => sum + count, 0)

  return {
    namespaces: input.plan.namespaceBindings.length,
    relationships: input.plan.relationshipSteps.length,
    columns: input.plan.columnSteps.filter(step => step.relationship).length,
    piiColumns: input.plan.columnSteps.filter(step => step.pii).length,
    estimatedRows,
  }
}

export function createDpmDryRunCategories(impact: DpmDryRunImpact): DpmDryRunCategory[] {
  return [
    { name: 'namespace_bindings', count: impact.namespaces },
    { name: 'relationship_steps', count: impact.relationships },
    { name: 'column_steps', count: impact.columns },
    { name: 'pii_columns', count: impact.piiColumns },
    { name: 'estimated_rows', count: impact.estimatedRows },
  ]
}
