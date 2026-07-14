export type DpmDataFieldType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'date'
  | 'date-time'
  | 'object'
  | 'array'
  | 'json'
  | 'unknown'

export type DpmDatabaseColumnRef = {
  table: string
  column: string
}

export type DpmDataFieldRef = {
  entity: string
  field: string
}

export type DpmApiObjectRef = {
  artifactId: string
  pointer: string
  operationId?: string
  versionHash?: string
}

export type DpmDataFieldDeclarationInput = {
  entity: string
  name: string
  type: DpmDataFieldType
  nullable?: boolean
  description?: string
  storageRef?: DpmDatabaseColumnRef
}

export type DpmDataFieldDeclaration = DpmDataFieldDeclarationInput & {
  identity: string
}

export type DpmApiBindingDirection = 'request' | 'response' | 'both'

export type DpmApiBindingInput = {
  dataField: DpmDataFieldRef
  api: DpmApiObjectRef
  direction: DpmApiBindingDirection
}

export type DpmApiBinding = DpmApiBindingInput & {
  identity: string
}

export type DpmDataDefinitionsInput = {
  version?: '1.0'
  fields: DpmDataFieldDeclarationInput[]
  apiBindings?: DpmApiBindingInput[]
}

export type DpmDataDefinitions = {
  version: '1.0'
  fields: DpmDataFieldDeclaration[]
  apiBindings: DpmApiBinding[]
}
