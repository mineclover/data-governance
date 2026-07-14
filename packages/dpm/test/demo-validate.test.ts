import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import { parseDemoJsonStdout } from './support/demo-io-fixtures.js'
import {
  demoCatalogPath,
  demoManifestPath,
  demoRegistryPath,
} from './support/demo-path-fixtures.js'

describe('DPM customer orders demo validate command', () => {
  it('validates the primary demo without touching a source DB', async () => {
    const validate = await runDpmCli([
      'validate',
      '--manifest',
      demoManifestPath,
      '--catalog',
      demoCatalogPath,
      '--registry',
      demoRegistryPath,
    ])
    const validated = parseDemoJsonStdout(validate.stdout)

    expect(validate.exitCode).toBe(0)
    expect(validated.result.summary).toEqual({ errors: 0, warnings: 0, infos: 0 })
  })
})
