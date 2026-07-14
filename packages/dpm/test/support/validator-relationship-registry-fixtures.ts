import {
  createRegistrySnapshot,
  type DpmValidationInput,
} from '../../src/index.js'
import { createValidationInput } from './validator-fixtures.js'

export const expectedAmbiguousRegistryApprovalDiagnosticCodes = [
  'REL012',
  'SAF007',
] as const

export const expectedApprovedRegistrySnapshotMismatchDiagnosticCodes = [
  'REL013',
  'SAF007',
] as const

export function createAmbiguousRegistryApprovalInput(): DpmValidationInput {
  const input = createValidationInput()
  const approved = input.registry.approvedRelationships[0]
  if (!approved) throw new Error('fixture must contain an approved relationship')

  return {
    ...input,
    registry: createRegistrySnapshot({
      datasetId: input.registry.datasetId,
      registryVersion: input.registry.registryVersion,
      exportedAt: input.registry.exportedAt,
      relationships: [
        ...input.registry.relationships,
        {
          ...approved,
          version: '2',
          approval: {
            ...approved.approval,
            reason: 'Second approved version used to verify ambiguity diagnostics.',
          },
        },
      ],
    }),
  }
}

export function createApprovedRegistrySnapshotMismatchInput(): DpmValidationInput {
  const input = createValidationInput()
  const manifest = structuredClone(input.manifest) as Record<string, any>
  manifest.relationships[0].namespace = 'account'

  return {
    ...input,
    manifest,
  }
}
