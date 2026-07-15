import { createDpmIdentityDataDefinitions } from '../model/data-identity-normalize.js'
import type {
  DpmIdentityDataDefinitions,
  DpmIdentityDataDefinitionsInput,
  DpmIdentityDataFieldDeclaration,
  DpmIdentityApiBinding,
} from '../model/data-identity-types.js'
import { DpmAuthoringError } from './types.js'

/**
 * Serialize normalized identity definitions into the portable authoring input shape.
 * Derived identities are intentionally reconstructed on import.
 */
export function exportDpmAuthoringDefinitions(definitions: DpmIdentityDataDefinitions): string {
  const canonical = createDpmIdentityDataDefinitions(toAuthoringInput(definitions))
  return `${JSON.stringify(toAuthoringInput(canonical), null, 2)}\n`
}

/** Parse and normalize a canonical `data_definitions` 1.1 authoring document. */
export function importDpmAuthoringDefinitions(document: string): DpmIdentityDataDefinitions {
  let parsed: unknown
  try {
    parsed = JSON.parse(document)
  } catch (error) {
    throw invalidImport(error instanceof Error ? error.message : 'invalid JSON')
  }
  if (!isRecord(parsed) || parsed.version !== '1.1' || !Array.isArray(parsed.fields)) {
    throw invalidImport('authoring definitions must contain version 1.1 and a fields array')
  }
  try {
    return createDpmIdentityDataDefinitions(parsed as unknown as DpmIdentityDataDefinitionsInput)
  } catch (error) {
    throw invalidImport(error instanceof Error ? error.message : 'invalid identity definitions')
  }
}

function toAuthoringInput(definitions: DpmIdentityDataDefinitions): DpmIdentityDataDefinitionsInput {
  return {
    version: '1.1',
    fields: [...definitions.fields]
      .sort((left, right) => left.objectId.localeCompare(right.objectId))
      .map(toFieldInput),
    apiBindings: [...definitions.apiBindings]
      .sort((left, right) => left.bindingId.localeCompare(right.bindingId))
      .map(toBindingInput),
  }
}

function toFieldInput(field: DpmIdentityDataFieldDeclaration): DpmIdentityDataDefinitionsInput['fields'][number] {
  return {
    objectId: field.objectId,
    revisionId: field.revisionId,
    entity: {
      datasetId: field.entity.datasetId,
      namespace: field.entity.namespace,
      name: field.entity.name,
    },
    name: field.name,
    type: field.type,
    origin: field.origin,
    ...(field.nullable === undefined ? {} : { nullable: field.nullable }),
    ...(field.description === undefined ? {} : { description: field.description }),
    ...(field.storageRef === undefined ? {} : { storageRef: copyStorageRef(field.storageRef) }),
    ...(field.lifecycle === undefined ? {} : { lifecycle: field.lifecycle }),
    aliases: [...(field.aliases ?? [])].sort(),
    ...(field.supersededByObjectId === undefined ? {} : { supersededByObjectId: field.supersededByObjectId }),
  }
}

function toBindingInput(binding: DpmIdentityApiBinding): NonNullable<DpmIdentityDataDefinitionsInput['apiBindings']>[number] {
  return {
    bindingId: binding.bindingId,
    dataField: {
      objectId: binding.dataField.objectId,
      revisionId: binding.dataField.revisionId,
    },
    api: {
      artifactId: binding.api.artifactId,
      pointer: binding.api.pointer,
      versionHash: binding.api.versionHash,
      ...(binding.api.operationId === undefined ? {} : { operationId: binding.api.operationId }),
    },
    direction: binding.direction,
  }
}

function copyStorageRef(storageRef: NonNullable<DpmIdentityDataFieldDeclaration['storageRef']>) {
  return {
    table: storageRef.table,
    column: storageRef.column,
    catalog: {
      snapshotId: storageRef.catalog.snapshotId,
      versionHash: storageRef.catalog.versionHash,
      ...(storageRef.catalog.sourceCoordinate === undefined
        ? {}
        : { sourceCoordinate: copySourceCoordinate(storageRef.catalog.sourceCoordinate) }),
    },
  }
}

function copySourceCoordinate(sourceCoordinate: NonNullable<NonNullable<DpmIdentityDataFieldDeclaration['storageRef']>['catalog']['sourceCoordinate']>) {
  return sourceCoordinate.kind === 'file'
    ? {
        kind: 'file' as const,
        filePath: sourceCoordinate.filePath,
        pointer: sourceCoordinate.pointer,
        ...(sourceCoordinate.line === undefined ? {} : { line: sourceCoordinate.line }),
        ...(sourceCoordinate.column === undefined ? {} : { column: sourceCoordinate.column }),
      }
    : {
        kind: 'db' as const,
        entity: sourceCoordinate.entity,
        id: sourceCoordinate.id,
        pointer: sourceCoordinate.pointer,
      }
}

function invalidImport(message: string): DpmAuthoringError {
  return new DpmAuthoringError('invalid', `invalid authoring definitions import: ${message}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
