import type {
  DpmCliCommand,
  DpmCliFormat,
  DpmCliResult,
} from './types.js'

export function createDpmCliResult(
  command: DpmCliCommand,
  exitCode: number,
  result: unknown,
  format: DpmCliFormat = 'json',
): DpmCliResult {
  return {
    exitCode,
    stdout: format === 'text'
      ? `${formatDpmCliText(command, exitCode, result)}\n`
      : `${JSON.stringify({ command, result }, null, 2)}\n`,
    stderr: '',
  }
}

export function createDpmCliJsonResult(
  command: DpmCliCommand,
  exitCode: number,
  result: unknown,
): DpmCliResult {
  return createDpmCliResult(command, exitCode, result, 'json')
}

function formatDpmCliText(command: DpmCliCommand, exitCode: number, result: unknown): string {
  const lines = [`command: ${command}`, `status: ${exitCode === 0 ? 'ok' : 'failed'}`]
  if (!isRecord(result)) return lines.join('\n')

  const summary = result.summary
  if (isRecord(summary)) {
    for (const key of ['errors', 'warnings', 'infos', 'relationships', 'fields']) {
      if (typeof summary[key] === 'number') lines.push(`${key}: ${summary[key]}`)
    }
  }

  if (Array.isArray(result.diagnostics)) {
    lines.push(`diagnostics: ${result.diagnostics.length}`)
    for (const diagnostic of result.diagnostics.slice(0, 20)) {
      if (isRecord(diagnostic)) {
        const code = typeof diagnostic.code === 'string' ? diagnostic.code : 'diagnostic'
        const message = typeof diagnostic.message === 'string' ? diagnostic.message : ''
        lines.push(`- ${code}${message ? `: ${message}` : ''}`)
      }
    }
    if (result.diagnostics.length > 20) lines.push(`- ... ${result.diagnostics.length - 20} more`)
  }

  if (Array.isArray(result.relationships)) {
    lines.push(`relationships: ${result.relationships.length}`)
    for (const relationship of result.relationships.slice(0, 50)) {
      if (!isRecord(relationship)) continue
      const name = typeof relationship.name === 'string' ? relationship.name : 'relationship'
      const status = typeof relationship.status === 'string' ? relationship.status : 'unknown'
      const identity = typeof relationship.identity === 'string' ? ` (${relationship.identity})` : ''
      lines.push(`- ${name} [${status}]${identity}`)
    }
    if (result.relationships.length > 50) lines.push(`- ... ${result.relationships.length - 50} more`)
  }

  for (const key of ['changeCount', 'breakingChangeCount']) {
    if (typeof result[key] === 'number') lines.push(`${key}: ${result[key]}`)
  }
  for (const key of ['fieldCount', 'apiBindingCount']) {
    if (typeof result[key] === 'number') lines.push(`${key}: ${result[key]}`)
  }
  if (isRecord(result.explanation)) {
    for (const key of ['fieldCount', 'apiBindingCount']) {
      if (typeof result.explanation[key] === 'number') lines.push(`${key}: ${result.explanation[key]}`)
    }
  }
  if (typeof result.documentKind === 'string') lines.push(`documentKind: ${result.documentKind}`)
  if (typeof result.breaking === 'boolean') lines.push(`breaking: ${result.breaking}`)
  if (typeof result.approvalRequired === 'boolean') lines.push(`approvalRequired: ${result.approvalRequired}`)
  if (typeof result.mutation === 'string') lines.push(`mutation: ${result.mutation}`)
  if (typeof result.currentRevisionId === 'string') lines.push(`currentRevisionId: ${result.currentRevisionId}`)
  if (typeof result.targetRevisionId === 'string') lines.push(`targetRevisionId: ${result.targetRevisionId}`)
  if (Array.isArray(result.changes)) {
    lines.push(`changes: ${result.changes.length}`)
    for (const change of result.changes.slice(0, 50)) {
      if (!isRecord(change)) continue
      const kind = typeof change.kind === 'string' ? change.kind : 'change'
      const identity = typeof change.identity === 'string' ? ` ${change.identity}` : ''
      const breaking = change.breaking === true ? ' [breaking]' : ''
      lines.push(`- ${kind}${identity}${breaking}`)
    }
    if (result.changes.length > 50) lines.push(`- ... ${result.changes.length - 50} more`)
  }
  if (Array.isArray(result.quickFixes)) {
    lines.push(`quickFixes: ${result.quickFixes.length}`)
    for (const quickFix of result.quickFixes.slice(0, 20)) {
      if (!isRecord(quickFix)) continue
      const kind = typeof quickFix.kind === 'string' ? quickFix.kind : 'review'
      const summary = typeof quickFix.summary === 'string' ? `: ${quickFix.summary}` : ''
      lines.push(`- ${kind}${summary}`)
    }
  }

  for (const key of ['planIdentity', 'artifactKind', 'artifactVersion']) {
    if (typeof result[key] === 'string') lines.push(`${key}: ${result[key]}`)
  }
  return lines.join('\n')
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
