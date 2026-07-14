import type {
  DpmApiCoordinate,
  DpmCatalogCoordinate,
  DpmDiagnostic,
  DpmRegistryCoordinate,
} from './diagnostic-types.js'

export function createDpmDiagnostic(input: DpmDiagnostic): DpmDiagnostic {
  return {
    severity: input.severity,
    code: input.code,
  message: input.message,
  sourcePointer: input.sourcePointer,
    ...(input.apiCoordinate ? { apiCoordinate: copyApiCoordinate(input.apiCoordinate) } : {}),
    ...(input.catalogCoordinate ? { catalogCoordinate: copyCatalogCoordinate(input.catalogCoordinate) } : {}),
    ...(input.registryCoordinate ? { registryCoordinate: copyRegistryCoordinate(input.registryCoordinate) } : {}),
  }
}

function copyApiCoordinate(coordinate: DpmApiCoordinate): DpmApiCoordinate {
  return {
    ...(coordinate.artifactId ? { artifactId: coordinate.artifactId } : {}),
    ...(coordinate.versionHash ? { versionHash: coordinate.versionHash } : {}),
    ...(coordinate.pointer ? { pointer: coordinate.pointer } : {}),
    ...(coordinate.operationId ? { operationId: coordinate.operationId } : {}),
  }
}

function copyCatalogCoordinate(coordinate: DpmCatalogCoordinate): DpmCatalogCoordinate {
  return {
    ...(coordinate.table ? { table: coordinate.table } : {}),
    ...(coordinate.column ? { column: coordinate.column } : {}),
    ...(coordinate.columns ? { columns: [...coordinate.columns] } : {}),
  }
}

function copyRegistryCoordinate(coordinate: DpmRegistryCoordinate): DpmRegistryCoordinate {
  return {
    ...(coordinate.datasetId ? { datasetId: coordinate.datasetId } : {}),
    ...(coordinate.registryVersion ? { registryVersion: coordinate.registryVersion } : {}),
    ...(coordinate.relationshipName ? { relationshipName: coordinate.relationshipName } : {}),
    ...(coordinate.relationshipVersion ? { relationshipVersion: coordinate.relationshipVersion } : {}),
    ...(coordinate.status ? { status: coordinate.status } : {}),
  }
}
