import type {
  DpmCliCommand,
  DpmCliResult,
} from './types.js'

export function createDpmCliJsonResult(
  command: DpmCliCommand,
  exitCode: number,
  result: unknown,
): DpmCliResult {
  return {
    exitCode,
    stdout: `${JSON.stringify({ command, result }, null, 2)}\n`,
    stderr: '',
  }
}
