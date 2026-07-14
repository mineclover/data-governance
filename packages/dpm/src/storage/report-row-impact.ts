import type { DpmDryRunCategory, DpmDryRunImpact } from '../dry-run/report-types.js'

export function copyValidationReportImpact(impact: DpmDryRunImpact): DpmDryRunImpact {
  return {
    namespaces: impact.namespaces,
    relationships: impact.relationships,
    columns: impact.columns,
    piiColumns: impact.piiColumns,
    estimatedRows: impact.estimatedRows,
  }
}

export function copyValidationReportCategory(category: DpmDryRunCategory): DpmDryRunCategory {
  return {
    name: category.name,
    count: category.count,
  }
}
