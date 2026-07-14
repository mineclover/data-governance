import type {
  DpmColumnStep,
  DpmNamespaceBinding,
  DpmRelationshipStep,
} from './plan-step-types.js'
import {
  asArray,
  asRecord,
  asString,
} from './plan-value-utils.js'

export function createNamespaceBindings(
  manifest: Record<string, unknown>,
  relationshipSteps: readonly DpmRelationshipStep[],
  columnSteps: readonly DpmColumnStep[],
): DpmNamespaceBinding[] {
  return asArray(manifest.entities)
    .map(asRecord)
    .map(entity => {
      const namespace = asString(entity.namespace)
      const relationships = relationshipSteps
        .filter(step => step.namespace === namespace)
        .map(step => step.name)
        .sort()
      const columns = columnSteps
        .filter(step => step.namespace === namespace)
        .map(step => step.columnRef)
        .sort()
      return {
        namespace,
        entity: asString(entity.name),
        relationships,
        columns,
        transform: asString(asRecord(entity.transform).type),
      }
    })
    .filter(binding => binding.namespace.length > 0)
    .sort((left, right) => left.namespace.localeCompare(right.namespace))
}
