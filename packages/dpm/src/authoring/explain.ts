import type {
  DpmIdentityApiBinding,
  DpmIdentityDataDefinitions,
  DpmIdentityDataFieldDeclaration,
} from '../model/data-identity-types.js'
import { exportDpmAuthoringDefinitions, importDpmAuthoringDefinitions } from './io.js'

export type DpmAuthoringExplanation = {
  version: '1.1'
  fieldCount: number
  apiBindingCount: number
  fields: readonly DpmAuthoringExplanationField[]
}

export type DpmAuthoringExplanationField = {
  objectId: string
  revisionId: string
  identity: string
  locator: DpmIdentityDataFieldDeclaration['locator']
  entity: DpmIdentityDataFieldDeclaration['entity']
  name: string
  type: DpmIdentityDataFieldDeclaration['type']
  origin: DpmIdentityDataFieldDeclaration['origin']
  nullable?: boolean
  description?: string
  lifecycle: NonNullable<DpmIdentityDataFieldDeclaration['lifecycle']>
  aliases: readonly string[]
  storageRef?: DpmIdentityDataFieldDeclaration['storageRef']
  apiBindings: readonly DpmIdentityApiBinding[]
}

/** Return a deterministic, identity-only readback for review and debugging. */
export function explainDpmAuthoringDefinitions(
  definitions: DpmIdentityDataDefinitions,
): DpmAuthoringExplanation {
  const normalized = importDpmAuthoringDefinitions(exportDpmAuthoringDefinitions(definitions))
  const bindingsByObjectId = new Map<string, DpmIdentityApiBinding[]>()
  for (const binding of normalized.apiBindings) {
    const bindings = bindingsByObjectId.get(binding.dataField.objectId) ?? []
    bindingsByObjectId.set(binding.dataField.objectId, [...bindings, binding])
  }

  return freezeDeep({
    version: '1.1' as const,
    fieldCount: normalized.fields.length,
    apiBindingCount: normalized.apiBindings.length,
    fields: normalized.fields
      .slice()
      .sort((left, right) => left.objectId.localeCompare(right.objectId))
      .map(field => ({
        ...copyField(field),
        apiBindings: (bindingsByObjectId.get(field.objectId) ?? [])
          .slice()
          .sort((left, right) => left.bindingId.localeCompare(right.bindingId))
          .map(copyBinding),
      })),
  })
}

function copyField(field: DpmIdentityDataFieldDeclaration): Omit<DpmAuthoringExplanationField, 'apiBindings'> {
  return {
    objectId: field.objectId,
    revisionId: field.revisionId,
    identity: field.identity,
    locator: { ...field.locator },
    entity: { ...field.entity },
    name: field.name,
    type: field.type,
    origin: field.origin,
    ...(field.nullable === undefined ? {} : { nullable: field.nullable }),
    ...(field.description === undefined ? {} : { description: field.description }),
    lifecycle: field.lifecycle ?? 'active',
    aliases: [...(field.aliases ?? [])].sort(),
    ...(field.storageRef === undefined ? {} : { storageRef: copyStorageRef(field.storageRef) }),
  }
}

function copyBinding(binding: DpmIdentityApiBinding): DpmIdentityApiBinding {
  return {
    bindingId: binding.bindingId,
    dataField: { ...binding.dataField },
    api: {
      ...binding.api,
      ...(binding.api.operationId === undefined ? {} : { operationId: binding.api.operationId }),
    },
    direction: binding.direction,
    identity: binding.identity,
    targetIdentity: binding.targetIdentity,
  }
}

function copyStorageRef(storageRef: NonNullable<DpmIdentityDataFieldDeclaration['storageRef']>) {
  return {
    table: storageRef.table,
    column: storageRef.column,
    catalog: {
      ...storageRef.catalog,
      ...(storageRef.catalog.sourceCoordinate === undefined
        ? {}
        : { sourceCoordinate: { ...storageRef.catalog.sourceCoordinate } }),
    },
  }
}

function freezeDeep<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value as Record<string, unknown>)) freezeDeep(child)
  return Object.freeze(value)
}
