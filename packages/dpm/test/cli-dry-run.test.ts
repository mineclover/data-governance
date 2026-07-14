import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import { parseCliStdout } from './support/cli-io-fixtures.js'
import {
  cliCatalogPath,
  cliManifestPath,
  cliRegistryPath,
} from './support/cli-path-fixtures.js'

describe('DPM CLI dry-run command', () => {
  it('dry-runs fixture triplets with deterministic JSON output and no raw samples', async () => {
    const result = await runDpmCli([
      'dry-run',
      '--manifest',
      cliManifestPath,
      '--catalog',
      cliCatalogPath,
      '--registry',
      cliRegistryPath,
    ])
    const output = parseCliStdout(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(output.command).toBe('dry-run')
    expect(output.result.kind).toBe('dpm.dry-run-report.v1')
    expect(output.result.impact).toMatchObject({
      namespaces: 1,
      relationships: 1,
      columns: 2,
      piiColumns: 2,
    })
    expect(JSON.stringify(output)).not.toContain('C-001')
  })
})
