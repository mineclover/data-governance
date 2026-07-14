import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import {
  expectedCliValidateDiagnosticCodes,
  expectedCliValidateDiagnosticSummary,
} from './support/cli-expected-fixtures.js'
import { parseCliStdout } from './support/cli-io-fixtures.js'
import {
  cliCatalogPath,
  cliManifestPath,
  cliRegistryPath,
} from './support/cli-path-fixtures.js'

describe('DPM CLI validate command', () => {
  it('validates fixture triplets as machine-readable JSON without DB access', async () => {
    const result = await runDpmCli([
      'validate',
      '--manifest',
      cliManifestPath,
      '--catalog',
      cliCatalogPath,
      '--registry',
      cliRegistryPath,
    ])
    const output = parseCliStdout(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(result.stderr).toBe('')
    expect(output.command).toBe('validate')
    expect(output.result.valid).toBe(true)
    expect(output.result.summary).toEqual(expectedCliValidateDiagnosticSummary)
    expect(output.result.diagnostics.map((diagnostic: any) => diagnostic.code)).toEqual([
      ...expectedCliValidateDiagnosticCodes,
    ])
  })
})
