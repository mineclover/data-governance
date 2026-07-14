import type { DpmDiagnostic } from './diagnostic-types.js'
import {
  validateApprovedRegistrySnapshotEndpointGates,
} from './relationship-registry-snapshot-endpoint-gates.js'
import {
  validateApprovedRegistrySnapshotMetadataScalarGates,
} from './relationship-registry-snapshot-metadata-gates.js'
import {
  validateApprovedRegistrySnapshotTypeGate,
} from './relationship-registry-snapshot-type-gate.js'
import type { ApprovedRegistrySnapshotInput } from './relationship-registry-snapshot-types.js'

export function validateApprovedRegistrySnapshot(input: ApprovedRegistrySnapshotInput): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []
  const context = {
    ...input,
    relationshipName: input.relationship.name ?? '',
  }

  validateApprovedRegistrySnapshotTypeGate(context, diagnostics)
  validateApprovedRegistrySnapshotEndpointGates(context, diagnostics)
  validateApprovedRegistrySnapshotMetadataScalarGates(context, diagnostics)

  return diagnostics
}
