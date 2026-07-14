import {
  DPM_PROFILE_CONNECTOR_EVIDENCE_KINDS,
  type DpmProfileConnectorCapabilities,
} from '../../src/index.js'

export function allEvidenceCapabilities(
  connectorId: string,
  connectorVersion: string,
  sourceKind: DpmProfileConnectorCapabilities['sourceKinds'][number],
  captureMode: DpmProfileConnectorCapabilities['captureModes'][number],
): DpmProfileConnectorCapabilities {
  return {
    connectorId,
    connectorVersion,
    sourceKinds: [sourceKind],
    captureModes: [captureMode],
    supportedEvidenceKinds: [...DPM_PROFILE_CONNECTOR_EVIDENCE_KINDS],
    skippedEvidenceKinds: [],
  }
}
