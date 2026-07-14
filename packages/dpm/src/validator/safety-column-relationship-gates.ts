import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import type { SafetyColumnGateContext } from './safety-column-types.js'
import { asString } from './value-utils.js'

export function validateSafetyColumnRelationshipGates(context: SafetyColumnGateContext): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []

  if (context.relationshipName && !context.relationshipByName.has(context.relationshipName)) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'SAF012',
      message: `Column relationship ${context.relationshipName} must exist in manifest relationships.`,
      sourcePointer: context.relationshipSourcePointer,
      registryCoordinate: {
        datasetId: context.registry.datasetId,
        registryVersion: context.registry.registryVersion,
        relationshipName: context.relationshipName,
      },
    }))
  }
  if (context.relationshipName && context.entityName) {
    const relationship = context.relationshipByName.get(context.relationshipName)
    const entity = context.entityByName.get(context.entityName)
    const relationshipNamespace = asString(relationship?.namespace)
    const entityNamespace = asString(entity?.namespace)

    if (relationshipNamespace && entityNamespace && relationshipNamespace !== entityNamespace) {
      diagnostics.push(createDpmDiagnostic({
        severity: 'error',
        code: 'SAF009',
        message: `Column entity ${context.entityName} namespace does not match relationship ${context.relationshipName}.`,
        sourcePointer: `${context.pointer}/entity`,
        registryCoordinate: {
          datasetId: context.registry.datasetId,
          registryVersion: context.registry.registryVersion,
          relationshipName: context.relationshipName,
        },
      }))
    }
  }

  return diagnostics
}
