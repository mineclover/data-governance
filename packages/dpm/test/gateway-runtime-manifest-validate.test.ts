import { describe, expect, it } from 'vitest'

import { createDpmGatewayRuntime } from '../src/index.js'
import { runDpmCli } from '../src/cli/index.js'
import {
  createManifestRuntimeCliArgs,
  createRuntimeInput,
  parseStdout,
} from './support/gateway-runtime-manifest-fixtures.js'

describe('DPM gateway manifest validate runtime adapter', () => {
  it('serves validate with the same machine-readable body as the CLI', async () => {
    const runtime = createDpmGatewayRuntime()
    const response = await runtime.validateDpmManifest(createRuntimeInput())
    const cli = await runDpmCli(createManifestRuntimeCliArgs('validate'))

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(parseStdout(cli.stdout))
  })
})
