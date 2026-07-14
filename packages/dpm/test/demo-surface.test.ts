import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { demoRoot } from './support/demo-path-fixtures.js'

describe('DPM customer orders demo surface', () => {
  it('ships a runnable primary-use demo surface', () => {
    expect(existsSync(join(demoRoot, 'README.md'))).toBe(true)
    expect(existsSync(join(demoRoot, 'run-demo.mjs'))).toBe(true)
    expect(existsSync(join(demoRoot, 'manifest.json'))).toBe(true)
    expect(existsSync(join(demoRoot, 'catalog.snapshot.json'))).toBe(true)
    expect(existsSync(join(demoRoot, 'relationship-registry.yaml'))).toBe(true)
    expect(existsSync(join(demoRoot, 'estimated-rows.json'))).toBe(true)
  })
})
