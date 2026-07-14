import { describe, expect, it } from 'vitest'

import {
  createDpmPublishingContext,
} from '../src/index.js'
import {
  createPublishingCompiledPlan,
} from './support/publishing-plan-fixtures.js'
import {
  expectedPublishingPhysicalForeignKeyRecommendations,
} from './support/publishing-physical-fk-fixtures.js'

describe('DPM publishing physical foreign key recommendations', () => {
  it('marks physical foreign key output as recommendations instead of mutations', () => {
    const context = createDpmPublishingContext({
      plan: createPublishingCompiledPlan(),
      includePhysicalForeignKeyRecommendations: true,
    })

    expect(context.physicalForeignKeyRecommendations).toEqual([
      ...expectedPublishingPhysicalForeignKeyRecommendations,
    ])
  })
})
