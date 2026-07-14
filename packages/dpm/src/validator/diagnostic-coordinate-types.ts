export type DpmCatalogCoordinate = {
  table?: string
  column?: string
  columns?: string[]
}

export type DpmRegistryCoordinate = {
  datasetId?: string
  registryVersion?: string
  relationshipName?: string
  relationshipVersion?: string
  status?: string
}

export type DpmApiCoordinate = {
  artifactId?: string
  versionHash?: string
  pointer?: string
  operationId?: string
}
