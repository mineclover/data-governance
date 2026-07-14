import type { DpmDiagnostic } from './diagnostic-types.js'
import {
  addRegistryEndpointMismatch,
} from './relationship-registry-snapshot-mismatch.js'
import type { ApprovedRegistrySnapshotContext } from './relationship-registry-snapshot-types.js'

export function validateApprovedRegistrySnapshotEndpointGates(
  context: ApprovedRegistrySnapshotContext,
  diagnostics: DpmDiagnostic[],
): void {
  addRegistryEndpointMismatch({
    diagnostics,
    registry: context.registry,
    approved: context.approved,
    relationshipName: context.relationshipName,
    actual: context.relationship.parent,
    expected: context.approved.parent,
    label: 'parent',
    sourcePointer: `${context.pointer}/parent`,
  })
  addRegistryEndpointMismatch({
    diagnostics,
    registry: context.registry,
    approved: context.approved,
    relationshipName: context.relationshipName,
    actual: context.relationship.child,
    expected: context.approved.child,
    label: 'child',
    sourcePointer: `${context.pointer}/child`,
  })
}
