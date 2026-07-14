import { describe, expect, it } from 'vitest'

import { compileDpmPlan } from '../src/index.js'
import {
  createCompileInput,
} from './support/compiler-input-fixtures.js'
import {
  expectedCatalogStaleReasons,
} from './support/compiler-expected-fixtures.js'

describe('DPM compiler staleness', () => {
  it('marks compiled plans stale when manifest freshness differs from snapshots', () => {
    const input = createCompileInput()
    const manifest = structuredClone(input.manifest) as Record<string, any>
    manifest.catalog.version_hash = 'sha256:stale-catalog'

    const result = compileDpmPlan({
      ...input,
      manifest,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('expected stale compile success')
    expect(result.plan.stale).toBe(true)
    expect(result.plan.staleReasons).toEqual([...expectedCatalogStaleReasons])
  })
})
