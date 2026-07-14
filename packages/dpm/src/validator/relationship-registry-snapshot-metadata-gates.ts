import type { DpmDiagnostic } from './diagnostic-types.js'
import {
  addRegistryScalarMismatch,
} from './relationship-registry-snapshot-mismatch.js'
import type { ApprovedRegistrySnapshotContext } from './relationship-registry-snapshot-types.js'

export function validateApprovedRegistrySnapshotMetadataScalarGates(
  context: ApprovedRegistrySnapshotContext,
  diagnostics: DpmDiagnostic[],
): void {
  addRegistryScalarMismatch({
    diagnostics,
    registry: context.registry,
    approved: context.approved,
    relationshipName: context.relationshipName,
    actual: context.relationship.namespace,
    expected: context.approved.namespace,
    label: 'namespace',
    sourcePointer: `${context.pointer}/namespace`,
  })
  addRegistryScalarMismatch({
    diagnostics,
    registry: context.registry,
    approved: context.approved,
    relationshipName: context.relationshipName,
    actual: context.relationship.transform_strategy ?? context.relationship.transformStrategy,
    expected: context.approved.transformStrategy,
    label: 'transform_strategy',
    sourcePointer: `${context.pointer}/transform_strategy`,
  })
  addRegistryScalarMismatch({
    diagnostics,
    registry: context.registry,
    approved: context.approved,
    relationshipName: context.relationshipName,
    actual: context.relationship.orphan_policy ?? context.relationship.orphanPolicy,
    expected: context.approved.orphanPolicy,
    label: 'orphan_policy',
    sourcePointer: `${context.pointer}/orphan_policy`,
  })
}

