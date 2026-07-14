import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import {
  parseCliStdout,
  writeTempCliJsonFixture,
} from './support/cli-io-fixtures.js'
import {
  cliCatalogPath,
  cliRegistryPath,
} from './support/cli-path-fixtures.js'

describe('DPM CLI validate command — schema gate', () => {
  it('exits non-zero when the manifest fails the JSON Schema gate', async () => {
    const malformedManifestPath = writeTempCliJsonFixture(
      'oa-dpm-cli-schema-',
      'malformed-manifest.json',
      {
        scope: {
          include_tables: ['public.customers'],
        },
        relationships: [],
        columns: [],
        quality_gates: [
          {
            name: 'relationship_drift',
          },
        ],
      },
    )

    const result = await runDpmCli([
      'validate',
      '--manifest',
      malformedManifestPath,
      '--catalog',
      cliCatalogPath,
      '--registry',
      cliRegistryPath,
    ])
    const output = parseCliStdout(result.stdout)

    expect(result.exitCode).toBe(1)
    expect(output.result.valid).toBe(false)
    expect(output.result.diagnostics.map((diagnostic: any) => diagnostic.code)).toContain('SYN001')
  })
})
