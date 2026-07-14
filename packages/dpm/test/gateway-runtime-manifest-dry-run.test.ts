import { describe, expect, it } from 'vitest'

import { createDpmGatewayRuntime } from '../src/index.js'
import { runDpmCli } from '../src/cli/index.js'
import {
  createManifestRuntimeCliArgs,
  createRuntimeInput,
  parseStdout,
} from './support/gateway-runtime-manifest-fixtures.js'

describe('DPM gateway manifest dry-run runtime adapter', () => {
  it('serves dry-run with a CLI-equivalent payload without source DB access', async () => {
    const runtime = createDpmGatewayRuntime()
    const response = await runtime.dryRunDpmManifest(createRuntimeInput())
    const cli = await runDpmCli(createManifestRuntimeCliArgs('dry-run'))

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(parseStdout(cli.stdout))
    expect(JSON.stringify(response.body)).not.toContain('C-001')
  })
})
