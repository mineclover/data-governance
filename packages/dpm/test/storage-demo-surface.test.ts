import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { storageDemoRoot } from './support/storage-demo-path-fixtures.js'

describe('DPM storage-backed customer orders demo surface', () => {
  it('ships a reproducible fixture-backed storage demo surface', () => {
    expect(existsSync(join(storageDemoRoot, 'README.md'))).toBe(true)
    expect(existsSync(join(storageDemoRoot, 'run-demo.mjs'))).toBe(true)
    expect(existsSync(join(storageDemoRoot, 'manifest.json'))).toBe(true)
    expect(existsSync(join(storageDemoRoot, 'catalog-profile-rows.json'))).toBe(true)
    expect(existsSync(join(storageDemoRoot, 'relationship-registry-rows.json'))).toBe(true)
    expect(existsSync(join(storageDemoRoot, 'relationship-registry-audit-events.json'))).toBe(true)
    expect(existsSync(join(storageDemoRoot, 'estimated-rows.json'))).toBe(true)
  })
})
