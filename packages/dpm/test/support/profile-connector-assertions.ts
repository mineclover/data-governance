import { expect } from 'vitest'

import {
  DPM_PROFILE_CONNECTOR_RESULT_KIND,
  validateDpmProfileConnectorResult,
  type DpmProfileConnectorResult,
} from '../../src/index.js'

export function expectValidConnectorResult(result: DpmProfileConnectorResult): void {
  const validation = validateDpmProfileConnectorResult(result)

  expect(result.kind).toBe(DPM_PROFILE_CONNECTOR_RESULT_KIND)
  expect(result.freshness.runHash).toMatch(/^sha256:[a-f0-9]{64}$/)
  expect(validation.diagnostics, JSON.stringify(validation.diagnostics, null, 2)).toEqual([])
  expect(validation.valid).toBe(true)
}
