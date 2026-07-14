import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  storageDemoCommandTimeoutMs,
  storageDemoPackageRoot,
  storageDemoRoot,
} from './support/storage-demo-path-fixtures.js'

describe('DPM storage-backed customer orders demo command', () => {
  it('runs the documented storage demo command after a single catalog profiling pass', () => {
    const source = readFileSync(join(storageDemoRoot, 'run-demo.mjs'), 'utf8')
    const profileCalls = source.match(/\bprofilePostgresCatalog\s*\(/g) ?? []

    expect(profileCalls).toHaveLength(1)
    expect(source).toContain('applyDpmRegistryStorageSchema')
    expect(source).toContain('createDpmPostgresRegistryStorage')

    const result = spawnSync('corepack', ['pnpm', 'run', 'demo:storage'], {
      cwd: storageDemoPackageRoot,
      encoding: 'utf8',
      timeout: storageDemoCommandTimeoutMs,
    })
    const marker = '{\n  "demo": "dpm.customer-orders-storage"'
    const outputStart = result.stdout.indexOf(marker)
    const output = outputStart >= 0 ? JSON.parse(result.stdout.slice(outputStart)) : undefined

    expect(result.status, result.stderr || result.stdout).toBe(0)
    expect(output?.sourceDbMutation).toBe('none')
    expect(output?.persistedRawValues).toBe(false)
    expect(output?.steps.every((step: Record<string, unknown>) => step.status === 'pass')).toBe(true)
    expect(output?.steps[1]?.summary.appliedSchemaBlocks).toBe(4)
    expect(output?.steps[1]?.summary.storageAdapter).toBe('postgres-registry')
    expect(output?.steps[1]?.summary.approvalAuditEvents).toEqual([
      'audit:storage-demo:rel-orders-customer-approved',
    ])
  }, storageDemoCommandTimeoutMs + 5_000)
})
