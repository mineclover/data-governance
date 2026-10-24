import { createDpmAuthoringQuickFixes } from '../authoring/quick-fix.js'
import { createDpmAuthoringSemanticDiff } from '../authoring/diff.js'
import { explainDpmAuthoringDefinitions } from '../authoring/explain.js'
import { importDpmAuthoringDefinitions } from '../authoring/io.js'
import {
  createDpmCrossDefinitionReadModelReference,
  type DpmCrossDefinitionReadModelQuery,
} from '../authoring/read-model-contract.js'
import { createDpmCrossDefinitionReadModelScopedAuthorization } from '../authoring/read-model-authorization.js'
import type {
  DpmAuthoringDraft,
  DpmAuthoringFieldLookup,
  DpmAuthoringPublishedRevision,
  DpmAuthoringSemanticDiff,
} from '../authoring/types.js'
import type { DpmIdentityDataDefinitions } from '../model/data-identity-types.js'
import type { DpmDataFieldType } from '../model/data-types.js'
import type { DpmFieldLifecycle, DpmFieldOrigin } from '../model/data-identity-types.js'
import { readDpmCliStructuredFile } from './input-file.js'
import { createDpmCliResult } from './result.js'
import type { DpmCliFormat, DpmCliResult } from './types.js'

const AUTHORING_HELP = `Usage: oa-dpm authoring <inspect|search|diff|review|apply-plan|rollback-plan> [options]

Commands:
  inspect                 Show identity-only revision or draft readback
  search                  Search supplied published revisions offline
  diff                    Show a semantic diff between revision files
  review                  Show approval-required review findings
  apply-plan              Prepare an approval-gated mutation plan without applying it
  rollback-plan           Plan a rollback without changing external state

Options:
  --before <path>         Published revision JSON/YAML path for diff/review
  --after <path>          Draft JSON/YAML path for diff/review
  --current <path>        Current published revision for rollback planning
  --target <path>         Target published revision for rollback planning
  --revision <path>       Published revision JSON/YAML path for inspect
  --draft <path>          Draft JSON/YAML path for inspect
  --definition-id <id>    Restrict search to an explicitly supplied definition
  --identity-kind <kind>  Exact canonical identity kind: object|api|db
  --identity-key <key>    Exact canonical identity key (with --identity-kind)
  --field-dataset <id>    Bounded dataset predicate for search
  --field-namespace <ns>  Bounded namespace predicate for search
  --field-entity <name>   Bounded entity predicate for search
  --field-name <name>     Bounded field predicate for search
  --field-type <type>     Bounded semantic type predicate for search
  --field-origin <origin> Bounded field origin predicate for search
  --field-lifecycle <x>   Bounded lifecycle predicate for search
  --page-size <n>         Search page size, maximum 100
  --cursor <cursor>       Continue a prior search page
  --format <json|text>    Output format (default: json)

All authoring commands are read-only. They do not create drafts, publish revisions,
approve changes, execute rollback, or connect to a database.
`

const DATA_FIELD_TYPES = ['string', 'integer', 'number', 'boolean', 'date', 'date-time', 'object', 'array', 'json', 'unknown'] as const
const FIELD_ORIGINS = ['persisted', 'derived', 'computed', 'api_only'] as const
const FIELD_LIFECYCLES = ['active', 'deprecated', 'superseded'] as const

export function runDpmCliAuthoringCommand(argv: readonly string[]): DpmCliResult {
  try {
    const [subcommand, ...flags] = argv
    if (!subcommand || subcommand === 'help' || flags.includes('--help')) {
      return { exitCode: 0, stdout: AUTHORING_HELP, stderr: '' }
    }
    if (subcommand !== 'inspect' && subcommand !== 'search' && subcommand !== 'diff' && subcommand !== 'review' && subcommand !== 'apply-plan' && subcommand !== 'rollback-plan') {
      throw new Error(`Unknown authoring command ${subcommand}`)
    }

    if (subcommand === 'search') return runOfflineAuthoringSearch(flags)

    const values = parseFlags(flags)
    const format = parseFormat(values.get('--format'))

    if (subcommand === 'inspect') {
      const revisionPath = values.get('--revision')
      const draftPath = values.get('--draft')
      if ((revisionPath === undefined) === (draftPath === undefined)) {
        throw new Error('Authoring inspect requires exactly one of --revision or --draft')
      }
      if (revisionPath) {
        const document = readPublishedRevision(revisionPath)
        return createDpmCliResult('authoring-inspect', 0, {
          definitionId: document.definitionId,
          documentKind: 'published-revision',
          revisionId: document.revisionId,
          reason: document.reason,
          explanation: explainDpmAuthoringDefinitions(document.definitions),
        }, format)
      }
      const document = readDraft(draftPath!)
      return createDpmCliResult('authoring-inspect', 0, {
        definitionId: document.definitionId,
        documentKind: 'draft',
        draftId: document.draftId,
        baseRevisionId: document.baseRevisionId,
        status: document.status,
        explanation: explainDpmAuthoringDefinitions(document.definitions),
      }, format)
    }

    if (subcommand === 'rollback-plan') {
      const current = readPublishedRevision(requireFlag(values, '--current'))
      const target = readPublishedRevision(requireFlag(values, '--target'))
      return createDpmCliResult('authoring-rollback-plan', 0, createRollbackPlan(current, target), format)
    }

    const before = readPublishedRevision(requireFlag(values, '--before'))
    const after = readDraft(requireFlag(values, '--after'))
    const diff = createDiff(before, after)
    const quickFixes = createDpmAuthoringQuickFixes(diff)

    if (subcommand === 'apply-plan') {
      return createDpmCliResult('authoring-apply-plan', 0, createApplyPlan(diff, quickFixes), format)
    }

    if (subcommand === 'review') {
      return createDpmCliResult('authoring-review', 0, {
        definitionId: diff.definitionId,
        baseRevisionId: diff.baseRevisionId,
        draftId: diff.draftId,
        breaking: diff.breaking,
        changeCount: diff.changes.length,
        breakingChangeCount: diff.changes.filter(change => change.breaking).length,
        approvalRequired: diff.changes.length > 0,
        quickFixes,
        diagnostics: createReviewDiagnostics(diff, quickFixes),
      }, format)
    }

    return createDpmCliResult('authoring-diff', 0, {
      ...diff,
      changeCount: diff.changes.length,
      breakingChangeCount: diff.changes.filter(change => change.breaking).length,
      approvalRequired: diff.changes.length > 0,
      quickFixes,
      diagnostics: createReviewDiagnostics(diff, quickFixes),
    }, format)
  } catch (error) {
    return {
      exitCode: 2,
      stdout: '',
      stderr: `${error instanceof Error ? error.message : String(error)}\n`,
    }
  }
}

function createApplyPlan(
  diff: DpmAuthoringSemanticDiff,
  quickFixes: ReturnType<typeof createDpmAuthoringQuickFixes>,
) {
  return {
    planVersion: '1',
    definitionId: diff.definitionId,
    baseRevisionId: diff.baseRevisionId,
    draftId: diff.draftId,
    changeCount: diff.changes.length,
    breakingChangeCount: diff.changes.filter(change => change.breaking).length,
    breaking: diff.breaking,
    approvalRequired: diff.changes.length > 0,
    mutation: 'none',
    executable: false,
    concurrency: {
      baseRevisionId: diff.baseRevisionId,
      staleBaseMustBeRejected: true,
    },
    requiredRoles: diff.changes.length > 0 ? ['reviewer', 'publisher'] : [],
    steps: [
      { order: 1, action: 'revalidate-base-revision', required: true },
      { order: 2, action: 'review-semantic-diff', required: diff.changes.length > 0 },
      { order: 3, action: 'approve-draft', required: diff.changes.length > 0 },
      { order: 4, action: 'publish-draft', required: diff.changes.length > 0, deferred: true },
      { order: 5, action: 'append-audit-event', required: diff.changes.length > 0, deferred: true },
      { order: 6, action: 'retain-rollback-target', required: diff.changes.length > 0, deferred: true },
    ],
    quickFixes,
    diagnostics: [{
      code: 'AUTH_APPLY_DEFERRED',
      severity: diff.changes.length > 0 ? 'warning' : 'info',
      message: 'This CLI prepares an approval and mutation plan only; no draft, publish, audit, or rollback state is changed.',
      requiresApproval: diff.changes.length > 0,
    }],
  }
}

function createDiff(
  before: DpmAuthoringPublishedRevision,
  after: DpmAuthoringDraft,
): DpmAuthoringSemanticDiff {
  if (before.definitionId !== after.definitionId) {
    throw new Error(`Authoring definition mismatch: before is ${before.definitionId}, after is ${after.definitionId}`)
  }
  if (before.revisionId !== after.baseRevisionId) {
    throw new Error(`Authoring base revision mismatch: expected ${before.revisionId}, received ${after.baseRevisionId}`)
  }
  return createDpmAuthoringSemanticDiff(before, after)
}

function createRollbackPlan(
  current: DpmAuthoringPublishedRevision,
  target: DpmAuthoringPublishedRevision,
) {
  if (current.definitionId !== target.definitionId) {
    throw new Error(`Authoring definition mismatch: current is ${current.definitionId}, target is ${target.definitionId}`)
  }
  if (current.revisionId === target.revisionId) {
    throw new Error(`Rollback target ${target.revisionId} is already the current revision`)
  }

  const rollbackDraft: DpmAuthoringDraft = {
    definitionId: current.definitionId,
    draftId: `rollback-plan:${target.revisionId}`,
    baseRevisionId: current.revisionId,
    definitions: target.definitions,
    status: 'pending-approval',
    createdBy: 'read-only-cli',
    createdAt: target.createdAt,
  }
  const diff = createDpmAuthoringSemanticDiff(current, rollbackDraft)
  return {
    definitionId: current.definitionId,
    currentRevisionId: current.revisionId,
    targetRevisionId: target.revisionId,
    changeCount: diff.changes.length,
    breakingChangeCount: diff.changes.filter(change => change.breaking).length,
    breaking: diff.breaking,
    changes: diff.changes,
    approvalRequired: true,
    mutation: 'none',
    action: 'rollback',
    diagnostics: [{
      code: 'AUTH_ROLLBACK_APPROVAL_REQUIRED',
      severity: 'warning',
      message: 'Rollback execution requires an authorized rollback operator and is not performed by this CLI.',
      requiresApproval: true,
    }],
  }
}

function runOfflineAuthoringSearch(flags: readonly string[]): DpmCliResult {
  const values = parseSearchFlags(flags)
  const format = parseFormat(values.format)
  if (values.revisionPaths.length === 0) throw new Error('Authoring search requires at least one --revision')

  const revisions = values.revisionPaths.map(path => {
    const revision = readPublishedRevision(path)
    if (!revision.source?.freshnessIdentity) {
      throw invalidAuthoringDocument(path, 'source.freshnessIdentity is required for offline search')
    }
    return revision
  })
  const definitionIds = [...new Set(revisions.map(revision => revision.definitionId))].sort()
  const requestedDefinitionIds = values.definitionIds.length > 0
    ? [...new Set(values.definitionIds)].sort()
    : definitionIds
  const scope = createDpmCrossDefinitionReadModelScopedAuthorization(definitionIds)
  const reference = createDpmCrossDefinitionReadModelReference({ authorization: scope })
  for (const revision of revisions) {
    reference.upsert({
      revision,
      freshnessIdentity: revision.source!.freshnessIdentity,
      state: 'ready',
    })
  }

  const query = createSearchQuery(values)
  const searchResult = reference.search({
    definitionIds: requestedDefinitionIds,
    query,
    ...(values.pageSize === undefined ? {} : { pageSize: values.pageSize }),
    ...(values.cursor === undefined ? {} : { cursor: values.cursor }),
  })
  const result = searchResult.status === 'ready'
    ? {
        status: searchResult.status,
        scope: requestedDefinitionIds,
        hits: searchResult.hits,
        ...(searchResult.nextCursor === undefined ? {} : { nextCursor: searchResult.nextCursor }),
      }
    : {
        status: searchResult.status,
        ...(searchResult.status === 'invalid-query' ? { reason: searchResult.reason } : {}),
      }
  const exitCode = searchResult.status === 'ready' ? 0 : 2
  return createDpmCliResult('authoring-search', exitCode, result, format)
}

function createSearchQuery(values: SearchFlagValues): DpmCrossDefinitionReadModelQuery {
  if (values.identityKind !== undefined || values.identityKey !== undefined) {
    if (!values.identityKind || !values.identityKey) {
      throw new Error('Authoring search identity queries require both --identity-kind and --identity-key')
    }
    return { identity: { identityKind: values.identityKind, identityKey: values.identityKey } }
  }

  const entity = {
    ...(values.fieldDatasetId === undefined ? {} : { datasetId: values.fieldDatasetId }),
    ...(values.fieldNamespace === undefined ? {} : { namespace: values.fieldNamespace }),
    ...(values.fieldEntity === undefined ? {} : { name: values.fieldEntity }),
  }
  const field: DpmAuthoringFieldLookup = {
    ...(Object.keys(entity).length === 0 ? {} : { entity }),
    ...(values.fieldName === undefined ? {} : { name: values.fieldName }),
    ...(values.fieldType === undefined ? {} : { type: values.fieldType }),
    ...(values.fieldOrigin === undefined ? {} : { origin: values.fieldOrigin }),
    ...(values.fieldLifecycle === undefined ? {} : { lifecycle: values.fieldLifecycle }),
  }
  return { field }
}

type SearchFlagValues = {
  revisionPaths: string[]
  definitionIds: string[]
  identityKind?: 'object' | 'api' | 'db'
  identityKey?: string
  fieldDatasetId?: string
  fieldNamespace?: string
  fieldEntity?: string
  fieldName?: string
  fieldType?: DpmDataFieldType
  fieldOrigin?: DpmFieldOrigin
  fieldLifecycle?: DpmFieldLifecycle
  pageSize?: number
  cursor?: string
  format?: string
}

function parseSearchFlags(flags: readonly string[]): SearchFlagValues {
  const values: SearchFlagValues = { revisionPaths: [], definitionIds: [] }
  const known = new Set([
    '--revision', '--definition-id', '--identity-kind', '--identity-key', '--field-dataset',
    '--field-namespace', '--field-entity', '--field-name', '--field-type', '--field-origin',
    '--field-lifecycle', '--page-size', '--cursor', '--format',
  ])
  for (let index = 0; index < flags.length; index += 2) {
    const key = flags[index]
    const value = flags[index + 1]
    if (!key?.startsWith('--')) throw new Error(`Invalid argument near ${key ?? '<end>'}`)
    if (!known.has(key)) throw new Error(`Unknown option ${key}`)
    if (!value) throw new Error(`Invalid argument near ${key}`)
    if (key === '--revision') values.revisionPaths.push(value)
    else if (key === '--definition-id') values.definitionIds.push(value)
    else if (key === '--identity-kind') {
      if (value !== 'object' && value !== 'api' && value !== 'db') throw new Error(`Invalid --identity-kind ${value}`)
      if (values.identityKind !== undefined) throw new Error('Duplicate option --identity-kind')
      values.identityKind = value
    } else if (key === '--identity-key') assignSearchValue(values, 'identityKey', value, key)
    else if (key === '--field-dataset') assignSearchValue(values, 'fieldDatasetId', value, key)
    else if (key === '--field-namespace') assignSearchValue(values, 'fieldNamespace', value, key)
    else if (key === '--field-entity') assignSearchValue(values, 'fieldEntity', value, key)
    else if (key === '--field-name') assignSearchValue(values, 'fieldName', value, key)
    else if (key === '--field-type') {
      if (!(DATA_FIELD_TYPES as readonly string[]).includes(value)) throw new Error(`Invalid --field-type ${value}`)
      assignSearchValue(values, 'fieldType', value as DpmDataFieldType, key)
    } else if (key === '--field-origin') {
      if (!(FIELD_ORIGINS as readonly string[]).includes(value)) throw new Error(`Invalid --field-origin ${value}`)
      assignSearchValue(values, 'fieldOrigin', value as DpmFieldOrigin, key)
    } else if (key === '--field-lifecycle') {
      if (!(FIELD_LIFECYCLES as readonly string[]).includes(value)) throw new Error(`Invalid --field-lifecycle ${value}`)
      assignSearchValue(values, 'fieldLifecycle', value as DpmFieldLifecycle, key)
    }
    else if (key === '--cursor') assignSearchValue(values, 'cursor', value, key)
    else if (key === '--format') assignSearchValue(values, 'format', value, key)
    else if (key === '--page-size') {
      if (values.pageSize !== undefined) throw new Error('Duplicate option --page-size')
      const pageSize = Number(value)
      if (!Number.isInteger(pageSize)) throw new Error(`Invalid --page-size ${value}`)
      values.pageSize = pageSize
    }
  }
  return values
}

function assignSearchValue(
  values: SearchFlagValues,
  key: Exclude<keyof SearchFlagValues, 'revisionPaths' | 'definitionIds' | 'pageSize'>,
  value: string,
  option: string,
): void {
  if (values[key] !== undefined) throw new Error(`Duplicate option ${option}`)
  values[key] = value as never
}

function createReviewDiagnostics(
  diff: DpmAuthoringSemanticDiff,
  quickFixes: ReturnType<typeof createDpmAuthoringQuickFixes>,
) {
  if (diff.breaking) {
    return [{
      code: 'AUTH_BREAKING_CHANGE_APPROVAL_REQUIRED',
      severity: 'error',
      message: 'Breaking authoring changes require review and approval before publish.',
      requiresApproval: true,
    }]
  }
  if (quickFixes.length > 0) {
    return [{
      code: 'AUTH_REVIEW_APPROVAL_REQUIRED',
      severity: 'warning',
      message: 'Authoring review findings require confirmation before publish.',
      requiresApproval: true,
    }]
  }
  return []
}

function readPublishedRevision(path: string): DpmAuthoringPublishedRevision {
  const value = readDpmCliStructuredFile(path)
  if (!isRecord(value)) throw invalidAuthoringDocument(path, 'expected an object')
  const definitions = readDefinitions(value.definitions, path)
  if (typeof value.definitionId !== 'string' || !value.definitionId) {
    throw invalidAuthoringDocument(path, 'missing definitionId')
  }
  if (typeof value.revisionId !== 'string' || !value.revisionId) {
    throw invalidAuthoringDocument(path, 'missing revisionId')
  }
  if (value.reason !== 'initial' && value.reason !== 'publish' && value.reason !== 'rollback') {
    throw invalidAuthoringDocument(path, 'reason must be initial, publish, or rollback')
  }
  if (typeof value.createdBy !== 'string' || typeof value.createdAt !== 'string') {
    throw invalidAuthoringDocument(path, 'createdBy and createdAt are required')
  }
  const revision: DpmAuthoringPublishedRevision = {
    definitionId: value.definitionId,
    revisionId: value.revisionId,
    definitions,
    reason: value.reason,
    createdBy: value.createdBy,
    createdAt: value.createdAt,
    ...(typeof value.parentRevisionId === 'string' ? { parentRevisionId: value.parentRevisionId } : {}),
    ...(typeof value.rollbackTargetRevisionId === 'string' ? { rollbackTargetRevisionId: value.rollbackTargetRevisionId } : {}),
  }
  if (isRecord(value.source)) revision.source = value.source as NonNullable<DpmAuthoringPublishedRevision['source']>
  return revision
}

function readDraft(path: string): DpmAuthoringDraft {
  const value = readDpmCliStructuredFile(path)
  if (!isRecord(value)) throw invalidAuthoringDocument(path, 'expected an object')
  const definitions = readDefinitions(value.definitions, path)
  if (typeof value.definitionId !== 'string' || !value.definitionId) {
    throw invalidAuthoringDocument(path, 'missing definitionId')
  }
  if (typeof value.draftId !== 'string' || !value.draftId) {
    throw invalidAuthoringDocument(path, 'missing draftId')
  }
  if (typeof value.baseRevisionId !== 'string' || !value.baseRevisionId) {
    throw invalidAuthoringDocument(path, 'missing baseRevisionId')
  }
  if (value.status !== 'draft' && value.status !== 'pending-approval') {
    throw invalidAuthoringDocument(path, 'status must be draft or pending-approval')
  }
  if (typeof value.createdBy !== 'string' || typeof value.createdAt !== 'string') {
    throw invalidAuthoringDocument(path, 'createdBy and createdAt are required')
  }
  const draft: DpmAuthoringDraft = {
    definitionId: value.definitionId,
    draftId: value.draftId,
    baseRevisionId: value.baseRevisionId,
    definitions,
    status: value.status,
    createdBy: value.createdBy,
    createdAt: value.createdAt,
    ...(typeof value.reviewedBy === 'string' ? { reviewedBy: value.reviewedBy } : {}),
    ...(typeof value.reviewedAt === 'string' ? { reviewedAt: value.reviewedAt } : {}),
  }
  if (isRecord(value.source)) draft.source = value.source as NonNullable<DpmAuthoringDraft['source']>
  return draft
}

function readDefinitions(value: unknown, path: string): DpmIdentityDataDefinitions {
  if (!isRecord(value)) throw invalidAuthoringDocument(path, 'missing definitions')
  try {
    return importDpmAuthoringDefinitions(JSON.stringify(value))
  } catch (error) {
    throw invalidAuthoringDocument(path, error instanceof Error ? error.message : String(error))
  }
}

function parseFlags(flags: readonly string[]): Map<string, string> {
  const values = new Map<string, string>()
  const known = new Set(['--before', '--after', '--current', '--target', '--revision', '--draft', '--format'])
  for (let index = 0; index < flags.length; index += 2) {
    const key = flags[index]
    const value = flags[index + 1]
    if (!key?.startsWith('--')) throw new Error(`Invalid argument near ${key ?? '<end>'}`)
    if (!known.has(key)) throw new Error(`Unknown option ${key}`)
    if (!value) throw new Error(`Invalid argument near ${key}`)
    if (values.has(key)) throw new Error(`Duplicate option ${key}`)
    values.set(key, value)
  }
  return values
}

function requireFlag(values: ReadonlyMap<string, string>, name: string): string {
  const value = values.get(name)
  if (!value) throw new Error(`Missing required ${name}`)
  return value
}

function parseFormat(value: string | undefined): DpmCliFormat {
  if (!value || value === 'json') return 'json'
  if (value === 'text') return 'text'
  throw new Error(`Invalid --format ${value}; expected json or text`)
}

function invalidAuthoringDocument(path: string, message: string): Error {
  return new Error(`Invalid authoring document ${path}: ${message}`)
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
