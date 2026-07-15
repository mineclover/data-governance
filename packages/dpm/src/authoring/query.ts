import type {
  DpmAuthoringFieldLookup,
  DpmAuthoringLookup,
  DpmAuthoringLookupMatch,
  DpmAuthoringPublishedRevision,
} from './types.js'

export function lookupDpmAuthoringRevision(
  revision: DpmAuthoringPublishedRevision,
  query: DpmAuthoringLookup,
): DpmAuthoringLookupMatch[] {
  const bindingsByObjectId = new Map<string, DpmAuthoringPublishedRevision['definitions']['apiBindings']>()
  for (const binding of revision.definitions.apiBindings) {
    const bindings = bindingsByObjectId.get(binding.dataField.objectId) ?? []
    bindingsByObjectId.set(binding.dataField.objectId, [...bindings, binding])
  }
  return revision.definitions.fields
    .filter(field => matchesDpmAuthoringLookup(field, revision.definitions.apiBindings, query))
    .map(field => ({
      definitionId: revision.definitionId,
      revisionId: revision.revisionId,
      field,
      bindings: bindingsByObjectId.get(field.objectId) ?? [],
    }))
}

export function matchesDpmAuthoringLookup(
  field: DpmAuthoringPublishedRevision['definitions']['fields'][number],
  bindings: DpmAuthoringPublishedRevision['definitions']['apiBindings'],
  query: DpmAuthoringLookup,
): boolean {
  if ('objectId' in query) return field.objectId === query.objectId
  if ('db' in query) {
    const storage = field.storageRef
    return Boolean(
      storage &&
        storage.table === query.db.table &&
        storage.column === query.db.column &&
        storage.catalog.snapshotId === query.db.snapshotId &&
        storage.catalog.versionHash === query.db.versionHash,
    )
  }
  if ('field' in query) return matchesFieldLookup(field, query.field)
  return bindings.some(binding => {
    const api = binding.api
    return api.artifactId === query.api.artifactId &&
      api.pointer === query.api.pointer &&
      api.versionHash === query.api.versionHash &&
      (query.api.operationId === undefined || api.operationId === query.api.operationId)
  })
}

export function compareDpmAuthoringLookupMatches(
  left: DpmAuthoringLookupMatch,
  right: DpmAuthoringLookupMatch,
): number {
  const byDefinition = left.definitionId.localeCompare(right.definitionId)
  const byRevision = left.revisionId.localeCompare(right.revisionId)
  return byDefinition || byRevision || left.field.objectId.localeCompare(right.field.objectId)
}

function matchesFieldLookup(
  field: DpmAuthoringPublishedRevision['definitions']['fields'][number],
  query: DpmAuthoringFieldLookup,
): boolean {
  if (query.entity && Object.entries(query.entity).some(([key, value]) => field.entity[key as keyof typeof field.entity] !== value)) {
    return false
  }
  if (query.locator && !sameLocator(field.locator, query.locator)) return false
  if (query.name !== undefined && field.name !== query.name) return false
  if (query.type !== undefined && field.type !== query.type) return false
  if (query.origin !== undefined && field.origin !== query.origin) return false
  if (query.lifecycle !== undefined && field.lifecycle !== query.lifecycle) return false
  return true
}

function sameLocator(
  left: DpmAuthoringPublishedRevision['definitions']['fields'][number]['locator'],
  right: DpmAuthoringFieldLookup['locator'],
): boolean {
  return right !== undefined &&
    left.datasetId === right.datasetId &&
    left.namespace === right.namespace &&
    left.entity === right.entity &&
    left.field === right.field
}
