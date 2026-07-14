import { requireNonEmpty } from './normalize-utils.js'
import type {
  DpmCatalogSnapshotRef,
  DpmDataFieldLocator,
  DpmDataSourceCoordinate,
  DpmEntityRef,
  DpmIdentityApiBinding,
  DpmIdentityApiBindingInput,
  DpmIdentityApiObjectRef,
  DpmIdentityDataDefinitions,
  DpmIdentityDataDefinitionsInput,
  DpmIdentityDataFieldDeclaration,
  DpmIdentityDataFieldDeclarationInput,
  DpmIdentityDataFieldRef,
  DpmIdentityDatabaseColumnRef,
} from './data-identity-types.js'

const IDENTIFIER_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/

export function createDpmIdentityDataField(
  input: DpmIdentityDataFieldDeclarationInput,
): DpmIdentityDataFieldDeclaration {
  requireNonEmpty(input.objectId, 'identity data field.objectId')
  requireNonEmpty(input.revisionId, 'identity data field.revisionId')
  const entity = copyEntityRef(input.entity)
  requireIdentifier(input.name, 'identity data field.name')
  const origin = input.origin
  if (!['persisted', 'derived', 'computed', 'api_only'].includes(origin)) {
    throw new Error(`unsupported identity data field origin ${origin}`)
  }
  const storageRef = input.storageRef
    ? copyIdentityDatabaseColumnRef(input.storageRef)
    : undefined
  if (origin === 'persisted' && !storageRef) {
    throw new Error('persisted identity data fields require storageRef')
  }
  if (origin !== 'persisted' && storageRef) {
    throw new Error(`non-persisted identity data field ${input.objectId} cannot declare storageRef`)
  }

  const lifecycle = input.lifecycle ?? 'active'
  if (!['active', 'deprecated', 'superseded'].includes(lifecycle)) {
    throw new Error(`unsupported identity data field lifecycle ${lifecycle}`)
  }
  const aliases = copyAliases(input.aliases ?? [], input.objectId)
  if (lifecycle === 'superseded' && !input.supersededByObjectId) {
    throw new Error(`superseded identity data field ${input.objectId} requires supersededByObjectId`)
  }
  if (lifecycle !== 'superseded' && input.supersededByObjectId) {
    throw new Error(`only superseded identity data fields may declare supersededByObjectId`)
  }
  if (input.supersededByObjectId === input.objectId) {
    throw new Error(`identity data field ${input.objectId} cannot supersede itself`)
  }

  const locator = createDpmDataFieldLocator({
    datasetId: entity.datasetId,
    namespace: entity.namespace,
    entity: entity.name,
    field: input.name,
  })
  if (aliases.includes(renderDpmDataFieldLocator(locator))) {
    throw new Error(`identity data field ${input.objectId} cannot alias its current locator`)
  }

  return {
    ...input,
    entity,
    ...(storageRef ? { storageRef } : {}),
    lifecycle,
    aliases,
    locator,
    identity: createDpmDataFieldObjectIdentity(input.objectId),
  }
}

export function createDpmIdentityApiBinding(
  input: DpmIdentityApiBindingInput,
): DpmIdentityApiBinding {
  requireNonEmpty(input.bindingId, 'identity API binding.bindingId')
  const dataField = copyIdentityDataFieldRef(input.dataField)
  const api = copyIdentityApiObjectRef(input.api)
  if (!['request', 'response', 'both'].includes(input.direction)) {
    throw new Error(`unsupported API binding direction ${input.direction}`)
  }

  return {
    bindingId: input.bindingId,
    dataField,
    api,
    direction: input.direction,
    identity: createDpmIdentityApiBindingIdentity(input.bindingId),
    targetIdentity: createDpmApiObjectCanonicalIdentity(api),
  }
}

export function createDpmIdentityDataDefinitions(
  input: DpmIdentityDataDefinitionsInput,
): DpmIdentityDataDefinitions {
  const fields = input.fields.map(createDpmIdentityDataField)
  const objectIds = new Set<string>()
  const revisionIds = new Set<string>()
  const locators = new Set<string>()
  const aliases = new Set<string>()

  for (const field of fields) {
    if (objectIds.has(field.objectId)) {
      throw new Error(`identity data definitions contain duplicate objectId ${field.objectId}`)
    }
    objectIds.add(field.objectId)
    if (revisionIds.has(field.revisionId)) {
      throw new Error(`identity data definitions contain duplicate revisionId ${field.revisionId}`)
    }
    revisionIds.add(field.revisionId)

    const locator = renderDpmDataFieldLocator(field.locator)
    if (locators.has(locator)) {
      throw new Error(`identity data definitions contain duplicate locator ${locator}`)
    }
    locators.add(locator)
    for (const alias of field.aliases ?? []) {
    if (aliases.has(alias) || locators.has(alias)) {
      throw new Error(`identity data definitions contain duplicate alias ${alias}`)
    }
    aliases.add(alias)
  }

  for (const field of fields) {
    const locator = renderDpmDataFieldLocator(field.locator)
    if (aliases.has(locator)) {
      throw new Error(`identity data definitions contain alias that collides with locator ${locator}`)
    }
  }
  }

  for (const field of fields) {
    if (field.supersededByObjectId && !objectIds.has(field.supersededByObjectId)) {
      throw new Error(`identity data field ${field.objectId} supersedes unknown objectId ${field.supersededByObjectId}`)
    }
  }

  const apiBindings = (input.apiBindings ?? []).map(createDpmIdentityApiBinding)
  const bindingIds = new Set<string>()
  const targetIdentities = new Set<string>()
  for (const binding of apiBindings) {
    if (bindingIds.has(binding.bindingId)) {
      throw new Error(`identity data definitions contain duplicate bindingId ${binding.bindingId}`)
    }
    bindingIds.add(binding.bindingId)
    if (targetIdentities.has(binding.targetIdentity)) {
      throw new Error(`identity data definitions bind one API object to multiple logical fields: ${binding.targetIdentity}`)
    }
    targetIdentities.add(binding.targetIdentity)
    const field = fields.find(candidate => candidate.objectId === binding.dataField.objectId)
    if (!field) {
      throw new Error(`identity API binding references unknown objectId ${binding.dataField.objectId}`)
    }
    if (field.revisionId !== binding.dataField.revisionId) {
      throw new Error(`identity API binding references revision ${binding.dataField.revisionId} but field ${field.objectId} is ${field.revisionId}`)
    }
  }

  return {
    version: '1.1',
    fields,
    apiBindings,
  }
}

export function createDpmEntityRefIdentity(ref: DpmEntityRef): string {
  const entity = copyEntityRef(ref)
  return `entity:${entity.datasetId}/${entity.namespace}/${entity.name}`
}

export function createDpmDataFieldLocator(ref: DpmDataFieldLocator): DpmDataFieldLocator {
  requireIdentifier(ref.datasetId, 'identity data field locator.datasetId')
  requireIdentifier(ref.namespace, 'identity data field locator.namespace')
  requireIdentifier(ref.entity, 'identity data field locator.entity')
  requireIdentifier(ref.field, 'identity data field locator.field')
  return {
    datasetId: ref.datasetId,
    namespace: ref.namespace,
    entity: ref.entity,
    field: ref.field,
  }
}

export function renderDpmDataFieldLocator(locator: DpmDataFieldLocator): string {
  const normalized = createDpmDataFieldLocator(locator)
  return `field:${normalized.datasetId}/${normalized.namespace}/${normalized.entity}/${normalized.field}`
}

export function createDpmDataFieldObjectIdentity(objectId: string): string {
  requireNonEmpty(objectId, 'identity data field.objectId')
  return `data-field:${encodeIdentityPart(objectId)}`
}

export function createDpmIdentityApiBindingIdentity(bindingId: string): string {
  requireNonEmpty(bindingId, 'identity API binding.bindingId')
  return `binding:${encodeIdentityPart(bindingId)}`
}

export function createDpmApiObjectCanonicalIdentity(api: DpmIdentityApiObjectRef): string {
  const normalized = copyIdentityApiObjectRef(api)
  return `api:${encodeIdentityPart(normalized.artifactId)}@${encodeIdentityPart(normalized.versionHash)}:${normalized.pointer}`
}

export function createDpmIdentityDatabaseColumnIdentity(
  ref: DpmIdentityDatabaseColumnRef,
): string {
  const normalized = copyIdentityDatabaseColumnRef(ref)
  return `db:${encodeIdentityPart(normalized.catalog.snapshotId)}@${encodeIdentityPart(normalized.catalog.versionHash)}:${normalized.table}#${normalized.column}`
}

function copyEntityRef(ref: DpmEntityRef): DpmEntityRef {
  requireIdentifier(ref.datasetId, 'identity entity.datasetId')
  requireIdentifier(ref.namespace, 'identity entity.namespace')
  requireIdentifier(ref.name, 'identity entity.name')
  return {
    datasetId: ref.datasetId,
    namespace: ref.namespace,
    name: ref.name,
  }
}

function copyIdentityDataFieldRef(ref: DpmIdentityDataFieldRef): DpmIdentityDataFieldRef {
  requireNonEmpty(ref.objectId, 'identity API binding.dataField.objectId')
  requireNonEmpty(ref.revisionId, 'identity API binding.dataField.revisionId')
  return {
    objectId: ref.objectId,
    revisionId: ref.revisionId,
  }
}

function copyIdentityApiObjectRef(api: DpmIdentityApiObjectRef): DpmIdentityApiObjectRef {
  requireNonEmpty(api.artifactId, 'identity API object.artifactId')
  requireNonEmpty(api.versionHash, 'identity API object.versionHash')
  requireNonEmpty(api.pointer, 'identity API object.pointer')
  if (!/^#(?:\/.*)?$/.test(api.pointer)) {
    throw new Error('identity API object.pointer must be an OpenAPI JSON pointer')
  }
  if (api.operationId) requireNonEmpty(api.operationId, 'identity API object.operationId')
  return {
    artifactId: api.artifactId,
    pointer: api.pointer,
    versionHash: api.versionHash,
    ...(api.operationId ? { operationId: api.operationId } : {}),
  }
}

function copyIdentityDatabaseColumnRef(ref: DpmIdentityDatabaseColumnRef): DpmIdentityDatabaseColumnRef {
  requireNonEmpty(ref.table, 'identity data field.storageRef.table')
  requireNonEmpty(ref.column, 'identity data field.storageRef.column')
  return {
    table: ref.table,
    column: ref.column,
    catalog: copyCatalogSnapshotRef(ref.catalog),
  }
}

function copyCatalogSnapshotRef(ref: DpmCatalogSnapshotRef): DpmCatalogSnapshotRef {
  requireNonEmpty(ref.snapshotId, 'identity storageRef.catalog.snapshotId')
  requireNonEmpty(ref.versionHash, 'identity storageRef.catalog.versionHash')
  return {
    snapshotId: ref.snapshotId,
    versionHash: ref.versionHash,
    ...(ref.sourceCoordinate ? { sourceCoordinate: copySourceCoordinate(ref.sourceCoordinate) } : {}),
  }
}

function copySourceCoordinate(source: DpmDataSourceCoordinate): DpmDataSourceCoordinate {
  requireNonEmpty(source.pointer, 'identity sourceCoordinate.pointer')
  if (source.kind === 'file') {
    requireNonEmpty(source.filePath, 'identity sourceCoordinate.filePath')
    return {
      kind: 'file',
      filePath: source.filePath,
      pointer: source.pointer,
      ...(source.line === undefined ? {} : { line: source.line }),
      ...(source.column === undefined ? {} : { column: source.column }),
    }
  }
  requireNonEmpty(source.entity, 'identity sourceCoordinate.entity')
  requireNonEmpty(source.id, 'identity sourceCoordinate.id')
  return {
    kind: 'db',
    entity: source.entity,
    id: source.id,
    pointer: source.pointer,
  }
}

function copyAliases(aliases: string[], objectId: string): string[] {
  const seen = new Set<string>()
  return aliases.map((alias, index) => {
    requireNonEmpty(alias, `identity data field ${objectId}.aliases[${index}]`)
    if (seen.has(alias)) {
      throw new Error(`identity data field ${objectId} contains duplicate alias ${alias}`)
    }
    seen.add(alias)
    return alias
  })
}

function requireIdentifier(value: string, label: string): string {
  requireNonEmpty(value, label)
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`${label} must be an identifier`)
  }
  return value
}

function encodeIdentityPart(value: string): string {
  return encodeURIComponent(value)
}
