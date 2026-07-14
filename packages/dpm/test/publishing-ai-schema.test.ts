import { describe, expect, it } from 'vitest'

import {
  createDpmPublishingContext,
} from '../src/index.js'
import {
  createPublishingCompiledPlan,
} from './support/publishing-plan-fixtures.js'
import {
  expectedPublishingAiRelationshipContext,
  expectedPublishingReadonlyGrantHints,
  expectedPublishingRelationshipMetadata,
} from './support/publishing-ai-schema-fixtures.js'

describe('DPM publishing AI schema context', () => {
  it('publishes AI relationship context only from validated relationship steps', () => {
    const plan = createPublishingCompiledPlan()
    const context = createDpmPublishingContext({
      plan,
      includeExamples: true,
    })

    expect(context.kind).toBe('dpm.publishing-context.v1')
    expect(context.relationshipMetadata.map(relationship => relationship.name)).toEqual(
      plan.relationshipSteps.map(step => step.name),
    )
    expect(context.relationshipMetadata).toEqual([
      expect.objectContaining(expectedPublishingRelationshipMetadata[0]),
    ])
    expect(context.aiSchemaContext.relationships[0]).toMatchObject(
      expectedPublishingAiRelationshipContext,
    )
    expect(context.aiSchemaContext.readonlyGrantHints).toEqual([
      ...expectedPublishingReadonlyGrantHints,
    ])
  })
})
