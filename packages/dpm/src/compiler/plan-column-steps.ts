import type {
  DpmColumnStep,
  DpmRelationshipStep,
} from './plan-step-types.js'
import {
  asArray,
  asRecord,
  asString,
} from './plan-value-utils.js'

export function createColumnSteps(
  manifest: Record<string, unknown>,
  relationshipSteps: readonly DpmRelationshipStep[],
): DpmColumnStep[] {
  const namespaceByRelationship = new Map(relationshipSteps.map(step => [step.name, step.namespace]))
  return asArray(manifest.columns)
    .map(asRecord)
    .map(column => {
      const table = asString(column.table)
      const columnName = asString(column.column)
      const transform = asRecord(column.transform)
      const relationship = asString(column.relationship ?? transform.relationship)
      const namespace = namespaceByRelationship.get(relationship)
      return {
        table,
        column: columnName,
        columnRef: `${table}.${columnName}`,
        role: asString(column.role),
        pii: column.pii === true,
        transform: asString(transform.type),
        ...(relationship ? { relationship } : {}),
        ...(namespace ? { namespace } : {}),
      }
    })
    .sort((left, right) => left.columnRef.localeCompare(right.columnRef))
}
