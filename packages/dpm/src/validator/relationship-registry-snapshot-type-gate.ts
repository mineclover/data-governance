import type { DpmDiagnostic } from './diagnostic-types.js'
import {
  addRegistryScalarMismatch,
} from './relationship-registry-snapshot-mismatch.js'
import type { ApprovedRegistrySnapshotContext } from './relationship-registry-snapshot-types.js'

export function validateApprovedRegistrySnapshotTypeGate(
  context: ApprovedRegistrySnapshotContext,
  diagnostics: DpmDiagnostic[],
): void {
  addRegistryScalarMismatch({
    diagnostics,
    registry: context.registry,
    approved: context.approved,
    relationshipName: context.relationshipName,
    actual: context.relationship.type,
    expected: context.approved.type,
    label: 'type',
    sourcePointer: `${context.pointer}/type`,
  })
}

