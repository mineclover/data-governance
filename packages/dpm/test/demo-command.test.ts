import { spawnSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

import { demoCommandTimeoutMs, demoPackageRoot } from './support/demo-path-fixtures.js'

describe('DPM customer orders demo command', () => {
  it('runs the documented primary demo command', () => {
    const result = spawnSync('corepack', ['pnpm', 'run', 'demo'], {
      cwd: demoPackageRoot,
      encoding: 'utf8',
      timeout: demoCommandTimeoutMs,
    })
    const marker = '{\n  "demo": "dpm.customer-orders"'
    const outputStart = result.stdout.indexOf(marker)
    const output = outputStart >= 0 ? JSON.parse(result.stdout.slice(outputStart)) : undefined

    expect(result.status, result.stderr || result.stdout).toBe(0)
    expect(output?.steps.every((step: Record<string, unknown>) => step.status === 'pass')).toBe(true)
  }, demoCommandTimeoutMs + 5_000)
})
