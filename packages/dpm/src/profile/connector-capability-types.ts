import type {
  DpmProfileCaptureMode,
  DpmProfileSourceKind,
} from './profile-taxonomy.js'
import type { DpmProfileConnectorEvidenceKind } from './connector-evidence-taxonomy.js'

export type DpmProfileConnectorCapabilities = {
  connectorId: string
  connectorVersion: string
  sourceKinds: DpmProfileSourceKind[]
  captureModes: DpmProfileCaptureMode[]
  supportedEvidenceKinds: DpmProfileConnectorEvidenceKind[]
  skippedEvidenceKinds: DpmProfileConnectorEvidenceKind[]
}
