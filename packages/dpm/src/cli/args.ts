import type {
  DpmCliCommand,
  DpmCliFormat,
  DpmCliParsedArgs,
} from './types.js'

export function parseDpmCliArgs(argv: readonly string[]): DpmCliParsedArgs {
  const [command, ...flags] = argv
  if (!isDpmCliCommand(command)) {
    throw new Error('Usage: oa-dpm <validate|compile|dry-run> --manifest <path> --catalog <path> --registry <path> [--format json|text]')
  }

  const values = new Map<string, string>()
  const knownFlags = new Set(['--manifest', '--catalog', '--registry', '--estimated-rows', '--format'])
  for (let index = 0; index < flags.length; index += 2) {
    const key = flags[index]
    const value = flags[index + 1]
    if (!key?.startsWith('--') || !value) {
      throw new Error(`Invalid argument near ${key ?? '<end>'}`)
    }
    if (!knownFlags.has(key)) throw new Error(`Unknown option ${key}`)
    if (values.has(key)) throw new Error(`Duplicate option ${key}`)
    values.set(key, value)
  }

  const manifestPath = requireFlag(values, '--manifest')
  const catalogPath = requireFlag(values, '--catalog')
  const registryPath = requireFlag(values, '--registry')
  const estimatedRowsPath = values.get('--estimated-rows')
  const format = parseFormat(values.get('--format'))

  return {
    command,
    manifestPath,
    catalogPath,
    registryPath,
    format,
    ...(estimatedRowsPath ? { estimatedRowsPath } : {}),
  }
}

function isDpmCliCommand(value: string | undefined): value is DpmCliCommand {
  return value === 'validate' || value === 'compile' || value === 'dry-run'
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
