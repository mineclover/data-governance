import { describe, expect, it } from 'vitest'

import {
  getDpmGatewaySchemaValue,
} from './support/gateway-schema-lookup.js'
import {
  profileTaxonomyProjectionCases,
} from './support/gateway-taxonomy-profile-fixtures.js'
import { formatSchemaPath } from './support/schema-path.js'

describe('DPM gateway profile taxonomy projection', () => {
  it('projects profile runtime taxonomies into the gateway schema', () => {
    for (const [schemaName, path, expected] of profileTaxonomyProjectionCases) {
      expect(getDpmGatewaySchemaValue(schemaName, path), `${schemaName}.${formatSchemaPath(path)}`).toEqual([
        ...expected,
      ])
    }
  })
})
