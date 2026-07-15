import type {
  DpmAuthoringChangeKind,
  DpmAuthoringSemanticChange,
  DpmAuthoringSemanticDiff,
} from './types.js'

export type DpmAuthoringQuickFixKind =
  | 'review-breaking-change'
  | 'confirm-rename-alias'
  | 'confirm-deprecation'

export type DpmAuthoringQuickFix = {
  definitionId: string
  baseRevisionId: string
  draftId: string
  kind: DpmAuthoringQuickFixKind
  identity: string
  sourceChangeKind: DpmAuthoringChangeKind
  breaking: boolean
  summary: string
  requiresApproval: true
  autoApplicable: false
}

/** Derive deterministic, review-only suggestions from a semantic diff. */
export function createDpmAuthoringQuickFixes(
  diff: DpmAuthoringSemanticDiff,
): readonly DpmAuthoringQuickFix[] {
  const fixes: DpmAuthoringQuickFix[] = []
  for (const change of diff.changes) {
    if (change.breaking) {
      fixes.push(createBreakingReviewFix(diff, change))
      continue
    }

    if (change.kind !== 'field.changed') continue
    const before = asRecord(change.before)
    const after = asRecord(change.after)
    if (isAliasPreservedRename(before, after)) {
      fixes.push({
        ...contextFor(diff, change),
        kind: 'confirm-rename-alias',
        breaking: false,
        summary: 'Confirm that the renamed field keeps its previous locator as an alias before publish.',
      })
      continue
    }
    if (isDeprecationTransition(before, after)) {
      fixes.push({
        ...contextFor(diff, change),
        kind: 'confirm-deprecation',
        breaking: false,
        summary: 'Confirm the field deprecation and its consumer migration plan before publish.',
      })
    }
  }

  fixes.sort((left, right) => {
    const byKind = left.kind.localeCompare(right.kind)
    const byIdentity = left.identity.localeCompare(right.identity)
    return byKind || byIdentity || left.sourceChangeKind.localeCompare(right.sourceChangeKind)
  })
  return freezeDeep(fixes)
}

function createBreakingReviewFix(
  diff: DpmAuthoringSemanticDiff,
  change: DpmAuthoringSemanticChange,
): DpmAuthoringQuickFix {
  return {
    ...contextFor(diff, change),
    kind: 'review-breaking-change',
    breaking: true,
    summary: `Review breaking ${change.kind} for ${change.identity} before publish.`,
  }
}

function contextFor(
  diff: DpmAuthoringSemanticDiff,
  change: DpmAuthoringSemanticChange,
): Pick<DpmAuthoringQuickFix, 'definitionId' | 'baseRevisionId' | 'draftId' | 'identity' | 'sourceChangeKind' | 'requiresApproval' | 'autoApplicable'> {
  return {
    definitionId: diff.definitionId,
    baseRevisionId: diff.baseRevisionId,
    draftId: diff.draftId,
    identity: change.identity,
    sourceChangeKind: change.kind,
    requiresApproval: true,
    autoApplicable: false,
  }
}

function isAliasPreservedRename(
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown> | undefined,
): boolean {
  if (!before || !after || typeof before.name !== 'string' || typeof after.name !== 'string') return false
  if (before.name === after.name) return false
  const entity = asRecord(before.entity)
  const aliases = after.aliases
  if (!entity || !Array.isArray(aliases)) return false
  if (typeof entity.datasetId !== 'string' || typeof entity.namespace !== 'string' || typeof entity.name !== 'string') {
    return false
  }
  const previousLocator = `field:${entity.datasetId}/${entity.namespace}/${entity.name}/${before.name}`
  return aliases.includes(previousLocator)
}

function isDeprecationTransition(
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown> | undefined,
): boolean {
  return Boolean(before && after && before.lifecycle !== 'deprecated' && after.lifecycle === 'deprecated')
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function freezeDeep<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value as Record<string, unknown>)) freezeDeep(child)
  return Object.freeze(value)
}
