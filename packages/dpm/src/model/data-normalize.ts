import { requireNonEmpty } from './normalize-utils.js'
import type {
  DpmApiBinding,
  DpmApiBindingInput,
  DpmDataDefinitions,
  DpmDataDefinitionsInput,
  DpmDataFieldDeclaration,
  DpmDataFieldDeclarationInput,
  DpmDataFieldRef,
  DpmDatabaseColumnRef,
} from './data-types.js'

export function createDpmDataField(
  input: DpmDataFieldDeclarationInput,
): DpmDataFieldDeclaration {
  requireNonEmpty(input.entity, 'data field.entity')
  requireNonEmpty(input.name, 'data field.name')
  const storageRef = input.storageRef ? copyDatabaseColumnRef(input.storageRef) : undefined

  return {
    ...input,
    ...(storageRef ? { storageRef } : {}),
    identity: createDpmDataFieldIdentity({ entity: input.entity, field: input.name }),
  }
}

export function createDpmApiBinding(input: DpmApiBindingInput): DpmApiBinding {
  const dataField = copyDataFieldRef(input.dataField)
  const api = {
    ...input.api,
    ...(input.api.operationId ? { operationId: input.api.operationId } : {}),
    ...(input.api.versionHash ? { versionHash: input.api.versionHash } : {}),
  }
  requireNonEmpty(api.artifactId, 'api binding.api.artifactId')
  requireNonEmpty(api.pointer, 'api binding.api.pointer')
  if (!/^#(?:\/.*)?$/.test(api.pointer)) {
    throw new Error('api binding.api.pointer must be an OpenAPI JSON pointer')
  }
  if (!['request', 'response', 'both'].includes(input.direction)) {
    throw new Error(`unsupported API binding direction ${input.direction}`)
  }
  if (api.operationId) requireNonEmpty(api.operationId, 'api binding.api.operationId')
  if (api.versionHash) requireNonEmpty(api.versionHash, 'api binding.api.versionHash')

  return {
    dataField,
    api,
    direction: input.direction,
    identity: createDpmApiBindingIdentity(dataField, api),
  }
}

export function createDpmDataDefinitions(
  input: DpmDataDefinitionsInput,
): DpmDataDefinitions {
  const fields = input.fields.map(createDpmDataField)
  const identities = new Set<string>()
  for (const field of fields) {
    if (identities.has(field.identity)) {
      throw new Error(`data definitions contain duplicate field ${field.identity}`)
    }
    identities.add(field.identity)
  }

  const apiBindings = (input.apiBindings ?? []).map(createDpmApiBinding)
  const bindingIdentities = new Set<string>()
  for (const binding of apiBindings) {
    if (bindingIdentities.has(binding.identity)) {
      throw new Error(`data definitions contain duplicate API binding ${binding.identity}`)
    }
    bindingIdentities.add(binding.identity)
    const fieldIdentity = createDpmDataFieldIdentity(binding.dataField)
    if (!identities.has(fieldIdentity)) {
      throw new Error(`api binding references unknown data field ${fieldIdentity}`)
    }
  }

  return {
    version: input.version ?? '1.0',
    fields,
    apiBindings,
  }
}

export function createDpmDataFieldIdentity(ref: DpmDataFieldRef): string {
  requireNonEmpty(ref.entity, 'data field reference.entity')
  requireNonEmpty(ref.field, 'data field reference.field')
  return `field:${ref.entity}/${ref.field}`
}

export function createDpmApiBindingIdentity(
  dataField: DpmDataFieldRef,
  api: DpmApiBinding['api'],
): string {
  return `binding:${createDpmDataFieldIdentity(dataField)}@${createDpmApiObjectIdentity(api)}`
}

export function createDpmDatabaseColumnIdentity(ref: DpmDatabaseColumnRef): string {
  const databaseRef = copyDatabaseColumnRef(ref)
  return `db:${databaseRef.table}#${databaseRef.column}`
}

export function createDpmApiObjectIdentity(api: DpmApiBinding['api']): string {
  requireNonEmpty(api.artifactId, 'api object.artifactId')
  requireNonEmpty(api.pointer, 'api object.pointer')
  return `api:${api.artifactId}${api.versionHash ? `@${api.versionHash}` : ''}:${api.pointer}`
}

function copyDataFieldRef(ref: DpmDataFieldRef): DpmDataFieldRef {
  requireNonEmpty(ref.entity, 'api binding.dataField.entity')
  requireNonEmpty(ref.field, 'api binding.dataField.field')
  return { entity: ref.entity, field: ref.field }
}

function copyDatabaseColumnRef(ref: DpmDatabaseColumnRef): DpmDatabaseColumnRef {
  requireNonEmpty(ref.table, 'data field.storageRef.table')
  requireNonEmpty(ref.column, 'data field.storageRef.column')
  return { table: ref.table, column: ref.column }
}
