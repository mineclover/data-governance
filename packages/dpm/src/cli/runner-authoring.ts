import { createDpmAuthoringQuickFixes } from '../authoring/quick-fix.js'
import { createDpmAuthoringSemanticDiff } from '../authoring/diff.js'
import { importDpmAuthoringDefinitions } from '../authoring/io.js'
import type {
  DpmAuthoringDraft,
  DpmAuthoringPublishedRevision,
  DpmAuthoringSemanticDiff,
} from '../authoring/types.js'
import type { DpmIdentityDataDefinitions } from '../model/data-identity-types.js'
import { readDpmCliStructuredFile } from './input-file.js'
import { createDpmCliResult } from './result.js'
import type { DpmCliFormat, DpmCliResult } from './types.js'

const AUTHORING_HELP = `Usage: oa-dpm authoring <diff|review|rollback-plan> [options]

Commands:
  diff                    Show a semantic diff between revision files
  review                  Show approval-required review findings
  rollback-plan           Plan a rollback without changing external state

Options:
  --before <path>         Published revision JSON/YAML path for diff/review
  --after <path>          Draft JSON/YAML path for diff/review
  --current <path>        Current published revision for rollback planning
  --target <path>         Target published revision for rollback planning
  --format <json|text>    Output format (default: json)

All authoring commands are read-only. They do not create drafts, publish revisions,
approve changes, execute rollback, or connect to a database.
`

export function runDpmCliAuthoringCommand(argv: readonly string[]): DpmCliResult {
  try {
    const [subcommand, ...flags] = argv
    if (!subcommand || subcommand === 'help' || flags.includes('--help')) {
      return { exitCode: 0, stdout: AUTHORING_HELP, stderr: '' }
    }
    if (subcommand !== 'diff' && subcommand !== 'review' && subcommand !== 'rollback-plan') {
      throw new Error(`Unknown authoring command ${subcommand}`)
    }

    const values = parseFlags(flags)
    const format = parseFormat(values.get('--format'))

    if (subcommand === 'rollback-plan') {
      const current = readPublishedRevision(requireFlag(values, '--current'))
      const target = readPublishedRevision(requireFlag(values, '--target'))
      return createDpmCliResult('authoring-rollback-plan', 0, createRollbackPlan(current, target), format)
    }

    const before = readPublishedRevision(requireFlag(values, '--before'))
    const after = readDraft(requireFlag(values, '--after'))
    const diff = createDiff(before, after)
    const quickFixes = createDpmAuthoringQuickFixes(diff)

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
  const known = new Set(['--before', '--after', '--current', '--target', '--format'])
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
