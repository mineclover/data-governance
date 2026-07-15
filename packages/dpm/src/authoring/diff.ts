import type {
  DpmAuthoringSemanticChange,
  DpmAuthoringSemanticDiff,
  DpmAuthoringDraft,
  DpmAuthoringPublishedRevision,
} from './types.js'

export function createDpmAuthoringSemanticDiff(
  base: DpmAuthoringPublishedRevision,
  draft: DpmAuthoringDraft,
): DpmAuthoringSemanticDiff {
  const changes: DpmAuthoringSemanticChange[] = []
  const baseFields = new Map(base.definitions.fields.map(field => [field.objectId, field]))
  const draftFields = new Map(draft.definitions.fields.map(field => [field.objectId, field]))

  for (const [objectId, field] of draftFields) {
    const previous = baseFields.get(objectId)
    if (!previous) {
      changes.push({
        kind: 'field.added',
        identity: field.identity,
        breaking: false,
        after: comparableField(field),
      })
      continue
    }
    if (stableStringify(comparableField(previous)) !== stableStringify(comparableField(field))) {
      changes.push({
        kind: 'field.changed',
        identity: field.identity,
        breaking: isBreakingFieldChange(previous, field),
        before: comparableField(previous),
        after: comparableField(field),
      })
    }
  }
  for (const [objectId, field] of baseFields) {
    if (!draftFields.has(objectId)) {
      changes.push({
        kind: 'field.removed',
        identity: field.identity,
        breaking: true,
        before: comparableField(field),
      })
    }
  }

  const baseBindings = new Map(base.definitions.apiBindings.map(binding => [binding.bindingId, binding]))
  const draftBindings = new Map(draft.definitions.apiBindings.map(binding => [binding.bindingId, binding]))
  for (const [bindingId, binding] of draftBindings) {
    const previous = baseBindings.get(bindingId)
    if (!previous) {
      changes.push({
        kind: 'api-binding.added',
        identity: binding.identity,
        breaking: false,
        after: comparableBinding(binding),
      })
      continue
    }
    if (stableStringify(comparableBinding(previous)) !== stableStringify(comparableBinding(binding))) {
      changes.push({
        kind: 'api-binding.changed',
        identity: binding.identity,
        breaking: true,
        before: comparableBinding(previous),
        after: comparableBinding(binding),
      })
    }
  }
  for (const [bindingId, binding] of baseBindings) {
    if (!draftBindings.has(bindingId)) {
      changes.push({
        kind: 'api-binding.removed',
        identity: binding.identity,
        breaking: true,
        before: comparableBinding(binding),
      })
    }
  }

  changes.sort((left, right) => {
    const byKind = left.kind.localeCompare(right.kind)
    return byKind || left.identity.localeCompare(right.identity)
  })

  return {
    definitionId: draft.definitionId,
    baseRevisionId: draft.baseRevisionId,
    draftId: draft.draftId,
    breaking: changes.some(change => change.breaking),
    changes,
  }
}

function comparableField(field: DpmAuthoringPublishedRevision['definitions']['fields'][number]) {
  return {
    objectId: field.objectId,
    revisionId: field.revisionId,
    entity: field.entity,
    name: field.name,
    type: field.type,
    origin: field.origin,
    ...(field.nullable === undefined ? {} : { nullable: field.nullable }),
    ...(field.description === undefined ? {} : { description: field.description }),
    ...(field.storageRef === undefined ? {} : { storageRef: field.storageRef }),
    lifecycle: field.lifecycle ?? 'active',
    aliases: [...(field.aliases ?? [])].sort(),
    ...(field.supersededByObjectId === undefined ? {} : { supersededByObjectId: field.supersededByObjectId }),
  }
}

function comparableBinding(binding: DpmAuthoringPublishedRevision['definitions']['apiBindings'][number]) {
  return {
    bindingId: binding.bindingId,
    dataField: binding.dataField,
    api: binding.api,
    direction: binding.direction,
  }
}

function isBreakingFieldChange(
  before: DpmAuthoringPublishedRevision['definitions']['fields'][number],
  after: DpmAuthoringPublishedRevision['definitions']['fields'][number],
): boolean {
  if (before.type !== after.type || before.origin !== after.origin) return true
  if (stableStringify(before.entity) !== stableStringify(after.entity)) return true
  if (stableStringify(before.storageRef) !== stableStringify(after.storageRef)) return true
  if ((before.nullable ?? true) !== (after.nullable ?? true) && after.nullable === false) return true
  if (after.lifecycle === 'superseded' && before.lifecycle !== 'superseded') return true
  if (before.name !== after.name) {
    const previousLocator = `field:${before.entity.datasetId}/${before.entity.namespace}/${before.entity.name}/${before.name}`
    if (!(after.aliases ?? []).includes(previousLocator)) return true
  }
  return false
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value)) ?? 'null'
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    sorted[key] = sortValue((value as Record<string, unknown>)[key])
  }
  return sorted
}
