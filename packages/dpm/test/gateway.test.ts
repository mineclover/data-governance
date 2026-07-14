import { describe, expect, it } from 'vitest'

import {
  getDpmGatewayOpenApiDocument,
} from '../src/index.js'
import {
  GATEWAY_OPENAPI_PATHS,
  GATEWAY_SECRET_BEARING_OPERATION_FRAGMENTS,
} from './support/gateway-contract-fixtures.js'

describe('DPM gateway OpenAPI contract', () => {
  it('models the full DPM gateway workflow without exposing secret-bearing operations', () => {
    const document = getDpmGatewayOpenApiDocument()

    expect(Object.keys(document.paths).sort()).toEqual([...GATEWAY_OPENAPI_PATHS].sort())
    const serialized = JSON.stringify(document).toLowerCase()

    for (const forbiddenFragment of GATEWAY_SECRET_BEARING_OPERATION_FRAGMENTS) {
      expect(serialized).not.toContain(forbiddenFragment)
    }
  })
})
