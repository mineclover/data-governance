import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import { expectedCliCompileRelationshipStepNames } from './support/cli-expected-fixtures.js'
import { parseCliStdout } from './support/cli-io-fixtures.js'
import {
  cliCatalogPath,
  cliManifestPath,
  cliRegistryPath,
} from './support/cli-path-fixtures.js'

describe('DPM CLI compile command', () => {
  it('compiles fixture triplets with deterministic JSON output', async () => {
    const result = await runDpmCli([
      'compile',
      '--manifest',
      cliManifestPath,
      '--catalog',
      cliCatalogPath,
      '--registry',
      cliRegistryPath,
    ])
    const output = parseCliStdout(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(output.command).toBe('compile')
    expect(output.result.ok).toBe(true)
    expect(output.result.plan.stale).toBe(false)
    expect(output.result.plan.relationshipSteps.map((step: any) => step.name)).toEqual([
      ...expectedCliCompileRelationshipStepNames,
    ])
  })
})
