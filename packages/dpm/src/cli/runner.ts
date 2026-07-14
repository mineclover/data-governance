import { parseDpmCliArgs } from './args.js'
import { readDpmCliInputs } from './input-loader.js'
import { runDpmCliCompileCommand } from './runner-compile.js'
import { runDpmCliDryRunCommand } from './runner-dry-run.js'
import { runDpmCliValidateCommand } from './runner-validate.js'
import type {
  DpmCliResult,
} from './types.js'

export async function runDpmCli(argv: readonly string[]): Promise<DpmCliResult> {
  try {
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
