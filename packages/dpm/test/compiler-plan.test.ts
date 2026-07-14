import { describe, expect, it } from 'vitest'

import { compileDpmPlan } from '../src/index.js'
import {
  createCompileInput,
} from './support/compiler-input-fixtures.js'
import {
  expectedCompiledCustomerNamespaceBinding,
  expectedCompiledRelationshipStepNames,
} from './support/compiler-expected-fixtures.js'

describe('DPM compiler plan assembly', () => {
  it('compiles a validated manifest into approved relationship-first plan steps', () => {
    const result = compileDpmPlan(createCompileInput())

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('expected compile success')
    expect(result.plan.kind).toBe('dpm.compiled-plan.v1')
    expect(result.plan.identity).toBe('compiled-plan:commerce_ai@2026.07.01:reg-2026-07-01')
    expect(result.plan.canonicalKeyEncodingVersion).toBe('string-v1')
    expect(result.plan.stale).toBe(false)
    expect(result.plan.relationshipSteps.map(step => step.name)).toEqual([
      ...expectedCompiledRelationshipStepNames,
    ])
    expect(result.plan.relationshipSteps.every(step => step.registryStatus === 'approved')).toBe(true)
    expect(result.plan.namespaceBindings).toEqual([
      expect.objectContaining(expectedCompiledCustomerNamespaceBinding),
    ])
    expect(result.plan.freshness).toMatchObject({
      catalogVersionHash: result.plan.manifestCatalogVersionHash,
      registryVersion: 'reg-2026-07-01',
      canonicalKeyEncodingVersion: 'string-v1',
    })
  })
})
