import type { DpmApiBindingDirection, DpmDataFieldType } from './data-types.js'

export type DpmFieldOrigin = 'persisted' | 'derived' | 'computed' | 'api_only'

export type DpmFieldLifecycle = 'active' | 'deprecated' | 'superseded'

export type DpmDataSourceCoordinate =
  | {
      kind: 'file'
      filePath: string
      pointer: string
      line?: number
      column?: number
    }
  | {
      kind: 'db'
      entity: string
      id: string
      pointer: string
    }

export type DpmEntityRef = {
  datasetId: string
  namespace: string
  name: string
}

export type DpmDataFieldLocator = {
  datasetId: string
  namespace: string
  entity: string
  field: string
}

export type DpmCatalogSnapshotRef = {
  snapshotId: string
  versionHash: string
  sourceCoordinate?: DpmDataSourceCoordinate
}

export type DpmIdentityDatabaseColumnRef = {
  table: string
  column: string
  catalog: DpmCatalogSnapshotRef
}

export type DpmIdentityApiObjectRef = {
  artifactId: string
  pointer: string
  versionHash: string
  operationId?: string
}

export type DpmIdentityDataFieldDeclarationInput = {
  objectId: string
  revisionId: string
  entity: DpmEntityRef
  name: string
  type: DpmDataFieldType
  origin: DpmFieldOrigin
  nullable?: boolean
  description?: string
  storageRef?: DpmIdentityDatabaseColumnRef
  lifecycle?: DpmFieldLifecycle
  aliases?: string[]
  supersededByObjectId?: string
}

export type DpmIdentityDataFieldDeclaration = DpmIdentityDataFieldDeclarationInput & {
  locator: DpmDataFieldLocator
  identity: string
}

export type DpmIdentityDataFieldRef = {
  objectId: string
  revisionId: string
}

export type DpmIdentityApiBindingInput = {
  bindingId: string
  dataField: DpmIdentityDataFieldRef
  api: DpmIdentityApiObjectRef
  direction: DpmApiBindingDirection
}

export type DpmIdentityApiBinding = DpmIdentityApiBindingInput & {
  identity: string
  targetIdentity: string
}

export type DpmIdentityDataDefinitionsInput = {
  version: '1.1'
  fields: DpmIdentityDataFieldDeclarationInput[]
  apiBindings?: DpmIdentityApiBindingInput[]
}

export type DpmIdentityDataDefinitions = {
  version: '1.1'
  fields: DpmIdentityDataFieldDeclaration[]
  apiBindings: DpmIdentityApiBinding[]
}
