import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import { expectedDemoCustomerNamespaceBinding } from './support/demo-expected-fixtures.js'
import { parseDemoJsonStdout } from './support/demo-io-fixtures.js'
import {
  demoCatalogPath,
  demoManifestPath,
  demoRegistryPath,
} from './support/demo-path-fixtures.js'

describe('DPM customer orders demo compile command', () => {
  it('compiles the primary demo into the expected relationship-first plan', async () => {
    const compile = await runDpmCli([
      'compile',
      '--manifest',
      demoManifestPath,
      '--catalog',
      demoCatalogPath,
      '--registry',
      demoRegistryPath,
    ])
    const compiled = parseDemoJsonStdout(compile.stdout)

    expect(compile.exitCode).toBe(0)
    expect(compiled.result.ok).toBe(true)
    expect(compiled.result.plan.stale).toBe(false)
    expect(compiled.result.plan.namespaceBindings).toEqual([
      expect.objectContaining(expectedDemoCustomerNamespaceBinding),
    ])
  })
})
