import { describe, expect, it } from 'vitest'

import {
  createDpmPublishingContext,
} from '../src/index.js'
import {
  createPublishingCompiledPlan,
} from './support/publishing-plan-fixtures.js'

describe('DPM publishing context safety', () => {
  it('excludes vault and reverse token lookup details from publishing context', () => {
    const context = createDpmPublishingContext({
      plan: createPublishingCompiledPlan(),
      includeExamples: true,
      includePhysicalForeignKeyRecommendations: true,
    })
    const serialized = JSON.stringify(context).toLowerCase()

    expect(serialized).not.toContain('vault')
    expect(serialized).not.toContain('reverse')
    expect(serialized).not.toContain('resolve')
  })
})
