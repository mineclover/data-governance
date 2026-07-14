import { describe, expect, it } from 'vitest'

import {
  compiledPlanTaxonomyProjectionCases,
} from './support/gateway-taxonomy-plan-fixtures.js'
import {
  getDpmGatewaySchemaValue,
} from './support/gateway-schema-lookup.js'
import { formatSchemaPath } from './support/schema-path.js'

describe('DPM gateway compiled plan taxonomy projection', () => {
  it('projects compiled plan runtime taxonomies into the gateway schema', () => {
    for (const [schemaName, path, expected] of compiledPlanTaxonomyProjectionCases) {
      expect(getDpmGatewaySchemaValue(schemaName, path), `${schemaName}.${formatSchemaPath(path)}`).toEqual([
        ...expected,
      ])
    }
  })
})
