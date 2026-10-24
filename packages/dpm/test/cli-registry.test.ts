import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import { cliRegistryPath } from './support/cli-path-fixtures.js'

describe('DPM CLI registry commands', () => {
  it('summarizes a registry snapshot without external state', async () => {
    const result = await runDpmCli(['registry', 'summary', '--registry', cliRegistryPath])
    const output = JSON.parse(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(output.command).toBe('registry-summary')
    expect(output.result.summary.total).toBeGreaterThan(0)
    expect(output.result.identity).toMatch(/@reg-/)
  })

  it('lists only the requested registry status in text mode', async () => {
    const result = await runDpmCli([
      'registry',
      'list',
      '--registry',
      cliRegistryPath,
      '--status',
      'approved',
      '--format',
      'text',
    ])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('command: registry-list')
    expect(result.stdout).toContain('status: ok')
    expect(result.stdout).toContain('relationships:')
    expect(result.stdout).not.toContain('"command"')
  })

  it('rejects invalid registry statuses', async () => {
    const result = await runDpmCli([
      'registry',
      'list',
      '--registry',
      cliRegistryPath,
      '--status',
      'unknown',
    ])

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toBe('Invalid --status unknown\n')
  })
})
