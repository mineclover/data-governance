import type { DpmDataSourceCoordinate } from '../model/data-identity-types.js'

export type DpmApiArtifactProvenance = {
  versionHash: string
  sourceCoordinate?: DpmDataSourceCoordinate
}

export type DpmApiArtifactInput = {
  artifactId: string
  document: unknown
  versionHash?: string
  provenance?: DpmApiArtifactProvenance
}
