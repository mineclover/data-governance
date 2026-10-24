import { parseDpmCliArgs } from './args.js'
import { readDpmCliInputs } from './input-loader.js'
import { runDpmCliCompileCommand } from './runner-compile.js'
import { runDpmCliDryRunCommand } from './runner-dry-run.js'
import { runDpmCliValidateCommand } from './runner-validate.js'
import { runDpmCliRegistryCommand } from './runner-registry.js'
import { runDpmCliProfileCommand } from './runner-profile.js'
import { runDpmCliAuthoringCommand } from './runner-authoring.js'
import type {
  DpmCliResult,
} from './types.js'

const DPM_CLI_VERSION = '0.1.3'

const HELP = `Usage: oa-dpm <command> [options]

Commands:
  validate    Validate a manifest against catalog and registry evidence
  compile     Compile a validated manifest into a neutral plan
  dry-run     Produce an impact report without changing external state
  registry    Inspect registry snapshots without changing external state
  profile     Inspect or analyze profile artifacts without external connectors
  authoring   Review semantic diffs and rollback plans without external state
  help        Show this help
  version     Show the CLI version

Options:
  --manifest <path>       Manifest JSON/YAML path
  --catalog <path>        Catalog snapshot JSON/YAML path
  --registry <path>       Registry snapshot YAML path
  --estimated-rows <path> Optional estimated-row JSON/YAML path for dry-run
  --format <json|text>    Output format (default: json)
  --help                  Show this help
  --version               Show the CLI version
`

export async function runDpmCli(argv: readonly string[]): Promise<DpmCliResult> {
  try {
    if (argv[0] === 'registry') return runDpmCliRegistryCommand(argv.slice(1))
    if (argv[0] === 'profile') return runDpmCliProfileCommand(argv.slice(1))
    if (argv[0] === 'authoring') return runDpmCliAuthoringCommand(argv.slice(1))
    if (argv.length === 0 || argv[0] === 'help' || argv.includes('--help')) {
      return { exitCode: 0, stdout: HELP, stderr: '' }
    }
    if (argv[0] === 'version' || argv.includes('--version')) {
      return { exitCode: 0, stdout: `${DPM_CLI_VERSION}\n`, stderr: '' }
    }
    const args = parseDpmCliArgs(argv)
    const inputs = readDpmCliInputs(args)

    if (args.command === 'validate') {
      return runDpmCliValidateCommand(inputs)
    }
    if (args.command === 'compile') {
      return runDpmCliCompileCommand(inputs)
    }

    return runDpmCliDryRunCommand(inputs)
  } catch (error) {
    return {
      exitCode: 2,
      stdout: '',
      stderr: `${error instanceof Error ? error.message : String(error)}\n`,
    }
  }
}
