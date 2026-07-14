import type { DpmProfileConnectorResult } from './connector-types.js'
import { connectorDiagnostic } from './connector-validation-diagnostic.js'
import type { DpmProfileDiagnostic } from './profile-artifact-types.js'

export function addDpmProfileConnectorCapabilityDiagnostics(
  diagnostics: DpmProfileDiagnostic[],
  result: DpmProfileConnectorResult,
): void {
  if (
    result.capabilities.connectorId !== result.connectorId ||
    result.capabilities.connectorVersion !== result.connectorVersion
  ) {
    diagnostics.push(connectorDiagnostic(
      'CONN101',
      `Connector result identity must match capability metadata for ${result.connectorId}.`,
      result.connectorId,
    ))
  }

  if (!result.capabilities.sourceKinds.includes(result.sourceKind)) {
    diagnostics.push(connectorDiagnostic(
      'CONN102',
      `Connector ${result.connectorId} does not support source kind ${result.sourceKind}.`,
      result.connectorId,
    ))
  }

  if (!result.capabilities.captureModes.includes(result.captureMode)) {
    diagnostics.push(connectorDiagnostic(
      'CONN103',
      `Connector ${result.connectorId} does not support capture mode ${result.captureMode}.`,
      result.connectorId,
    ))
  }

  const unsupportedEvidenceKinds = result.observedEvidenceKinds.filter(kind =>
    !result.capabilities.supportedEvidenceKinds.includes(kind) ||
    result.capabilities.skippedEvidenceKinds.includes(kind),
  )
  if (unsupportedEvidenceKinds.length > 0) {
    diagnostics.push(connectorDiagnostic(
      'CONN104',
      `Connector ${result.connectorId} claimed unsupported observed evidence kinds: ${unsupportedEvidenceKinds.join(', ')}.`,
      result.connectorId,
    ))
  }
}
