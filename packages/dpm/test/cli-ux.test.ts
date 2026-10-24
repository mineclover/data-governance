import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'
import { cliCatalogPath, cliManifestPath, cliRegistryPath } from './support/cli-path-fixtures.js'

describe('DPM CLI UX', () => {
  it('provides help without requiring input files', async () => {
    const result = await runDpmCli(['help'])

    expect(result.exitCode).toBe(0)
    expect(result.stderr).toBe('')
    expect(result.stdout).toContain('Usage: oa-dpm <command> [options]')
    expect(result.stdout).toContain('--format <json|text>')
  })

  it('provides the package CLI version', async () => {
    const result = await runDpmCli(['--version'])

    expect(result).toEqual({ exitCode: 0, stdout: '0.1.3\n', stderr: '' })
  })

  it('routes grouped command help to the grouped command', async () => {
    const result = await runDpmCli(['authoring', '--help'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Usage: oa-dpm authoring <inspect|search|audit|validate|diff|review|apply-plan|rollback-plan> [options]')
    expect(result.stdout).toContain('mutation')
  })

  it('preserves the global version flag for grouped commands', async () => {
    const result = await runDpmCli(['authoring', '--version'])

    expect(result).toEqual({ exitCode: 0, stdout: '0.1.3\n', stderr: '' })
  })

  it('rejects unknown options with a concise error', async () => {
    const result = await runDpmCli([
      'validate',
      '--manifest',
      cliManifestPath,
      '--catalog',
      cliCatalogPath,
      '--registry',
      cliRegistryPath,
      '--nope',
      'value',
    ])

    expect(result.exitCode).toBe(2)
    expect(result.stdout).toBe('')
    expect(result.stderr).toBe('Unknown option --nope\n')
  })

  it('supports concise text output for operator review', async () => {
    const result = await runDpmCli([
      'validate',
      '--manifest',
      cliManifestPath,
      '--catalog',
      cliCatalogPath,
      '--registry',
      cliRegistryPath,
      '--format',
      'text',
    ])

    expect(result.exitCode).toBe(0)
    expect(result.stderr).toBe('')
    expect(result.stdout).toContain('command: validate')
    expect(result.stdout).toContain('status: ok')
    expect(result.stdout).toContain('errors: 0')
    expect(() => JSON.parse(result.stdout)).toThrow()
  })
})
