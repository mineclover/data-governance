import { describe, expect, it } from 'vitest'

import {
  diagnosticTaxonomyProjectionCases,
} from './support/gateway-taxonomy-diagnostic-fixtures.js'
import {
  getDpmGatewaySchemaValue,
} from './support/gateway-schema-lookup.js'
import { formatSchemaPath } from './support/schema-path.js'

describe('DPM gateway diagnostic taxonomy projection', () => {
  it('projects the runtime diagnostic code taxonomy into the gateway schema', () => {
    for (const [schemaName, path, expected] of diagnosticTaxonomyProjectionCases) {
      expect(getDpmGatewaySchemaValue(schemaName, path), `${schemaName}.${formatSchemaPath(path)}`).toEqual([
        ...expected,
      ])
    }
  })
})
