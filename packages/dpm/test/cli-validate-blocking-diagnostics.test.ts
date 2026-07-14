import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import {
  parseCliStdout,
  readCliManifestFixture,
  writeTempCliJsonFixture,
} from './support/cli-io-fixtures.js'
import {
  cliCatalogPath,
  cliRegistryPath,
} from './support/cli-path-fixtures.js'

describe('DPM CLI validate command — blocking diagnostics', () => {
  it('exits non-zero for blocking REL/SAF diagnostics', async () => {
    const manifest = readCliManifestFixture()
    manifest.columns.push(structuredClone(manifest.columns[0]))
    const invalidManifestPath = writeTempCliJsonFixture(
      'oa-dpm-cli-',
      'invalid-manifest.json',
      manifest,
    )

    const result = await runDpmCli([
      'validate',
      '--manifest',
      invalidManifestPath,
      '--catalog',
      cliCatalogPath,
      '--registry',
      cliRegistryPath,
    ])
    const output = parseCliStdout(result.stdout)

    expect(result.exitCode).toBe(1)
    expect(output.result.valid).toBe(false)
    expect(output.result.diagnostics).toContainEqual(expect.objectContaining({
      code: 'SAF013',
      sourcePointer: '/columns/3',
    }))
  })
})
