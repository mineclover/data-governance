import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'

const profilePath = new URL('./fixtures/profile/kafka-orders-created-artifact.json', import.meta.url).pathname

describe('DPM CLI profile commands', () => {
  it('inspects a captured profile artifact', async () => {
    const result = await runDpmCli(['profile', 'inspect', '--profile', profilePath])
    const output = JSON.parse(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(output.command).toBe('profile-inspect')
    expect(output.result.profileId).toBe('profile:commerce-events')
    expect(output.result.nodeCount).toBeGreaterThan(0)
  })

  it('analyzes a captured profile artifact without connectors', async () => {
    const result = await runDpmCli(['profile', 'analyze', '--profile', profilePath])
    const output = JSON.parse(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(output.command).toBe('profile-analyze')
    expect(output.result.analysisReport.summary).toBeDefined()
  })

  it('rejects unknown profile options', async () => {
    const result = await runDpmCli(['profile', 'inspect', '--profile', profilePath, '--connect', 'kafka'])

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toBe('Unknown option --connect\n')
  })
})
