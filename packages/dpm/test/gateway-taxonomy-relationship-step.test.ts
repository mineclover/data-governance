import { describe, expect, it } from 'vitest'

import {
  getDpmGatewaySchemaValue,
} from './support/gateway-schema-lookup.js'
import {
  relationshipStepTaxonomyProjectionCases,
} from './support/gateway-taxonomy-relationship-step-fixtures.js'
import { formatSchemaPath } from './support/schema-path.js'

describe('DPM gateway relationship step taxonomy projection', () => {
  it('projects relationship step runtime taxonomies into the gateway schema', () => {
    for (const [schemaName, path, expected] of relationshipStepTaxonomyProjectionCases) {
      expect(getDpmGatewaySchemaValue(schemaName, path), `${schemaName}.${formatSchemaPath(path)}`).toEqual([
        ...expected,
      ])
    }
  })
})
