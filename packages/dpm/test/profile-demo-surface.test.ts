import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  profileDemoFixturePath,
  profileDemoRoot,
} from './support/profile-demo-path-fixtures.js'

describe('DPM Kafka profile demo surface', () => {
  it('ships a runnable Kafka profile demo surface', () => {
    expect(existsSync(join(profileDemoRoot, 'README.md'))).toBe(true)
    expect(existsSync(join(profileDemoRoot, 'run-demo.mjs'))).toBe(true)
    expect(existsSync(profileDemoFixturePath)).toBe(true)
  })
})
