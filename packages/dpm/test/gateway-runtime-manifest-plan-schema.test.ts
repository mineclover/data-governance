import { describe, expect, it } from 'vitest'

import { createDpmGatewayRuntime } from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'
import {
  createRuntimeInput,
} from './support/gateway-runtime-manifest-fixtures.js'
import {
  invalidCompiledPlanTaxonomyCases,
  invalidRelationshipStepTaxonomyCases,
} from './support/gateway-runtime-manifest-plan-taxonomy-fixtures.js'

describe('DPM gateway manifest runtime plan schemas', () => {
  it('rejects compiled plan taxonomy values outside the DPM plan contract', async () => {
    const runtime = createDpmGatewayRuntime()
    const compile = await runtime.compileDpmManifest(createRuntimeInput())
    const schema = compileGatewayComponentSchema('DpmCompiledPlan')

    for (const [field, value] of invalidCompiledPlanTaxonomyCases) {
      expect(schema({
        ...compile.body.result.plan,
        [field]: value,
      }), `DpmCompiledPlan unexpectedly accepted ${field}=${JSON.stringify(value)}`).toBe(false)
    }
  })

  it('rejects relationship step taxonomy values outside the DPM plan contract', async () => {
    const runtime = createDpmGatewayRuntime()
    const compile = await runtime.compileDpmManifest(createRuntimeInput())
    const schema = compileGatewayComponentSchema('DpmRelationshipStep')
    const step = compile.body.result.plan.relationshipSteps[0]

    for (const [field, value] of invalidRelationshipStepTaxonomyCases) {
      expect(schema({
        ...step,
        [field]: value,
      }), `DpmRelationshipStep unexpectedly accepted ${field}=${value}`).toBe(false)
    }
  })
})
