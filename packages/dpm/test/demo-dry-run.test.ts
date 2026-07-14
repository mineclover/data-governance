import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import { parseDemoJsonStdout } from './support/demo-io-fixtures.js'
import {
  demoCatalogPath,
  demoEstimatedRowsPath,
  demoManifestPath,
  demoRegistryPath,
} from './support/demo-path-fixtures.js'

describe('DPM customer orders demo dry-run command', () => {
  it('dry-runs the primary demo as a raw-value-free impact report', async () => {
    const dryRun = await runDpmCli([
      'dry-run',
      '--manifest',
      demoManifestPath,
      '--catalog',
      demoCatalogPath,
      '--registry',
      demoRegistryPath,
      '--estimated-rows',
      demoEstimatedRowsPath,
    ])
    const dryRunReport = parseDemoJsonStdout(dryRun.stdout)

    expect(dryRun.exitCode).toBe(0)
    expect(dryRunReport.result.impact).toEqual({
      namespaces: 1,
      relationships: 1,
      columns: 2,
      piiColumns: 2,
      estimatedRows: 7000,
    })
    expect(dryRunReport.result.rawValuesIncluded).toBe(false)
  })
})
