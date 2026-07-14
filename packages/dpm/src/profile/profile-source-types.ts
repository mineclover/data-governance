import type {
  DpmProfileCaptureMode,
  DpmProfileSourceKind,
} from './profile-taxonomy.js'

export type DpmProfileCoordinate = {
  kind: DpmProfileSourceKind
  path: string
  sourceId?: string
  pointer?: string
  externalId?: string
}

export type DpmProfileSourceDescriptor = {
  id: string
  kind: DpmProfileSourceKind
  connectorId: string
  connectorVersion: string
  refs: string[]
  captureMode: DpmProfileCaptureMode
  capturedAt?: string
  sourceVersionHash?: string
}

export type DpmProfileEvidenceSource = {
  coordinate: DpmProfileCoordinate
  connectorId?: string
  capturedAt?: string
  description?: string
}
