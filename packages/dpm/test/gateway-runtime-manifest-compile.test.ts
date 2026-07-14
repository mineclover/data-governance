import { describe, expect, it } from 'vitest'

import { createDpmGatewayRuntime } from '../src/index.js'
import { runDpmCli } from '../src/cli/index.js'
import {
  createManifestRuntimeCliArgs,
  createRuntimeInput,
  parseStdout,
} from './support/gateway-runtime-manifest-fixtures.js'

describe('DPM gateway manifest compile runtime adapter', () => {
  it('serves compile with the same machine-readable body as the CLI', async () => {
    const runtime = createDpmGatewayRuntime()
    const response = await runtime.compileDpmManifest(createRuntimeInput())
    const cli = await runDpmCli(createManifestRuntimeCliArgs('compile'))

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(parseStdout(cli.stdout))
  })
})
