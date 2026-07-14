import { describe, expect, it } from 'vitest'

import {
  getDpmGatewaySchemaValue,
} from './support/gateway-schema-lookup.js'
import {
  workflowTaxonomyProjectionCases,
} from './support/gateway-taxonomy-workflow-fixtures.js'
import { formatSchemaPath } from './support/schema-path.js'

describe('DPM gateway workflow taxonomy projection', () => {
  it('projects workflow response runtime taxonomies into the gateway schema', () => {
    for (const [schemaName, path, expected] of workflowTaxonomyProjectionCases) {
      expect(getDpmGatewaySchemaValue(schemaName, path), `${schemaName}.${formatSchemaPath(path)}`).toEqual([
        ...expected,
      ])
    }
  })
})
