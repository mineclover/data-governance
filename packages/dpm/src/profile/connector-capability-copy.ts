import type { DpmProfileConnectorCapabilities } from './connector-types.js'

export function copyDpmProfileConnectorCapabilities(
  capabilities: DpmProfileConnectorCapabilities,
): DpmProfileConnectorCapabilities {
  return {
    connectorId: capabilities.connectorId,
    connectorVersion: capabilities.connectorVersion,
    sourceKinds: [...capabilities.sourceKinds].sort(),
    captureModes: [...capabilities.captureModes].sort(),
    supportedEvidenceKinds: [...capabilities.supportedEvidenceKinds].sort(),
    skippedEvidenceKinds: [...capabilities.skippedEvidenceKinds].sort(),
  }
}
