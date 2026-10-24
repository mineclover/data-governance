import { REGISTRY_RELATIONSHIP_STATUSES } from '../registry/registry-relationship-status-taxonomy.js'
import type { RegistryRelationshipStatus } from '../registry/registry-relationship-status-taxonomy.js'
import { readDpmCliRegistrySnapshot } from './input-registry.js'
import { createDpmCliResult } from './result.js'
import type { DpmCliFormat, DpmCliResult } from './types.js'

const REGISTRY_HELP = `Usage: oa-dpm registry <summary|list> --registry <path> [options]

Commands:
  summary                 Show registry identity and status counts
  list                   List registry relationships without changing state

Options:
  --registry <path>      Registry snapshot YAML path
  --status <status>      Filter list: candidate|proposed|approved|rejected|deprecated|superseded
  --format <json|text>   Output format (default: json)
`

export function runDpmCliRegistryCommand(argv: readonly string[]): DpmCliResult {
  try {
    const [subcommand, ...flags] = argv
    if (!subcommand || subcommand === 'help' || subcommand === '--help' || flags.includes('--help')) {
      return { exitCode: 0, stdout: REGISTRY_HELP, stderr: '' }
    }
    if (subcommand !== 'summary' && subcommand !== 'list') {
      throw new Error(`Unknown registry command ${subcommand}`)
    }

    const values = parseFlags(flags)
    const registryPath = requireFlag(values, '--registry')
    const format = parseFormat(values.get('--format'))
    const snapshot = readDpmCliRegistrySnapshot(registryPath)

    if (subcommand === 'summary') {
      return createDpmCliResult('registry-summary', 0, {
        identity: snapshot.identity,
        datasetId: snapshot.datasetId,
        registryVersion: snapshot.registryVersion,
        canonicalKeyEncodingVersion: snapshot.canonicalKeyEncodingVersion,
        exportedAt: snapshot.exportedAt,
        summary: snapshot.summary,
      }, format)
    }

    const status = values.get('--status')
    if (status && !isRegistryStatus(status)) throw new Error(`Invalid --status ${status}`)
    const relationships = snapshot.relationships
      .filter(relationship => !status || relationship.status === status)
      .map(relationship => ({
        identity: relationship.identity,
        name: relationship.name,
        version: relationship.version,
        status: relationship.status,
        executable: relationship.executable,
        namespace: relationship.namespace,
        type: relationship.type,
        parent: relationship.parent,
        child: relationship.child,
      }))

    return createDpmCliResult('registry-list', 0, {
      identity: snapshot.identity,
      datasetId: snapshot.datasetId,
      registryVersion: snapshot.registryVersion,
      ...(status ? { status } : {}),
      relationships,
    }, format)
  } catch (error) {
    return {
      exitCode: 2,
      stdout: '',
      stderr: `${error instanceof Error ? error.message : String(error)}\n`,
    }
  }
}

function parseFlags(flags: readonly string[]): Map<string, string> {
  const values = new Map<string, string>()
  const known = new Set(['--registry', '--status', '--format'])
  for (let index = 0; index < flags.length; index += 2) {
    const key = flags[index]
    const value = flags[index + 1]
    if (!key?.startsWith('--') || !value) throw new Error(`Invalid argument near ${key ?? '<end>'}`)
    if (!known.has(key)) throw new Error(`Unknown option ${key}`)
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

function isRegistryStatus(value: string): value is RegistryRelationshipStatus {
  return (REGISTRY_RELATIONSHIP_STATUSES as readonly string[]).includes(value)
}
