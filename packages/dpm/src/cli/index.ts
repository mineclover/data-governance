#!/usr/bin/env node
import { pathToFileURL } from 'node:url'

import { runDpmCli } from './runner.js'

export type {
  DpmCliCommand,
  DpmCliResult,
} from './types.js'
export { runDpmCli } from './runner.js'

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runDpmCli(process.argv.slice(2))
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  process.exitCode = result.exitCode
}
