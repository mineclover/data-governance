import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import {
  createRegistryCoordinate,
} from './relationship-registry-diagnostics.js'
import { validateApprovedRegistrySnapshot } from './relationship-registry-snapshot.js'
import type { ManifestRelationship } from './relationship-types.js'

export function validateRelationshipRegistryApproval(input: {
  registry: RegistrySnapshot
  relationship: ManifestRelationship
  pointer: string
}): DpmDiagnostic[] {
  const name = input.relationship.name ?? ''
  const registryMatches = input.registry.relationships.filter(entry => entry.name === name)
  const approvedMatches = input.registry.approvedRelationships.filter(entry => entry.name === name)

  if (registryMatches.length === 0) {
    return [createDpmDiagnostic({
      severity: 'error',
      code: 'REL010',
      message: `Relationship ${name} is missing from registry snapshot.`,
      sourcePointer: `${input.pointer}/name`,
      registryCoordinate: createRegistryCoordinate(input.registry, name),
    })]
  }
  if (approvedMatches.length === 0) {
    return [createDpmDiagnostic({
      severity: 'error',
      code: 'REL006',
      message: `Relationship ${name} is not approved in registry snapshot.`,
      sourcePointer: `${input.pointer}/name`,
      registryCoordinate: createRegistryCoordinate(input.registry, name, registryMatches[0]),
    })]
  }
  if (approvedMatches.length > 1) {
    return [createDpmDiagnostic({
      severity: 'error',
      code: 'REL012',
      message: `Relationship ${name} has multiple approved registry matches.`,
      sourcePointer: `${input.pointer}/name`,
      registryCoordinate: createRegistryCoordinate(input.registry, name, approvedMatches[0]),
    })]
  }

  return validateApprovedRegistrySnapshot({
    registry: input.registry,
    relationship: input.relationship,
    approved: approvedMatches[0]!,
    pointer: input.pointer,
  })
}
