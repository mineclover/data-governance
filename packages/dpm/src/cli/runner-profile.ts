import { createDpmProfileAnalysisReport } from '../profile/analysis-report.js'
import { validateDpmProfileArtifactSchema } from '../profile/schema-validation.js'
import type { DpmProfileArtifact } from '../profile/profile-artifact-types.js'
import { readDpmCliStructuredFile } from './input-file.js'
import { createDpmCliResult } from './result.js'
import type { DpmCliFormat, DpmCliResult } from './types.js'

const PROFILE_HELP = `Usage: oa-dpm profile <inspect|analyze> --profile <path> [options]

Commands:
  inspect                 Show profile graph counts and diagnostics
  analyze                 Analyze profile signals and relationship candidates

Options:
  --profile <path>       Profile artifact JSON/YAML path
  --previous <path>      Previous profile artifact for drift analysis
  --format <json|text>   Output format (default: json)
`

export function runDpmCliProfileCommand(argv: readonly string[]): DpmCliResult {
  try {
    const [subcommand, ...flags] = argv
    if (!subcommand || subcommand === 'help' || subcommand === '--help' || flags.includes('--help')) {
      return { exitCode: 0, stdout: PROFILE_HELP, stderr: '' }
    }
    if (subcommand !== 'inspect' && subcommand !== 'analyze') {
      throw new Error(`Unknown profile command ${subcommand}`)
    }

    const values = parseFlags(flags)
    const profilePath = requireFlag(values, '--profile')
    const format = parseFormat(values.get('--format'))
    const profileArtifact = readProfile(profilePath)

    if (subcommand === 'inspect') {
      return createDpmCliResult('profile-inspect', 0, {
        profileId: profileArtifact.profileId,
        datasetId: profileArtifact.datasetId,
        nodeCount: profileArtifact.nodes.length,
        edgeCount: profileArtifact.edges.length,
        metricCount: profileArtifact.metrics.length,
        diagnosticCount: profileArtifact.diagnostics.length,
        diagnostics: profileArtifact.diagnostics,
      }, format)
    }

    const previousPath = values.get('--previous')
    const report = createDpmProfileAnalysisReport({
      profileArtifact,
      ...(previousPath ? { previousProfileArtifact: readProfile(previousPath) } : {}),
    })
    return createDpmCliResult('profile-analyze', 0, {
      profileId: profileArtifact.profileId,
      analysisReport: report,
    }, format)
  } catch (error) {
    return {
      exitCode: 2,
      stdout: '',
      stderr: `${error instanceof Error ? error.message : String(error)}\n`,
    }
  }
}

function readProfile(path: string): DpmProfileArtifact {
  const artifact = readDpmCliStructuredFile(path)
  const validation = validateDpmProfileArtifactSchema(artifact)
  if (!validation.valid) {
    throw new Error(`Profile artifact schema validation failed: ${validation.issues.map(issue => issue.message).join('; ')}`)
  }
  return artifact as DpmProfileArtifact
}

function parseFlags(flags: readonly string[]): Map<string, string> {
  const values = new Map<string, string>()
  const known = new Set(['--profile', '--previous', '--format'])
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
