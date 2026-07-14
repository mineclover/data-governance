import {
  createDpmProfileConnectorHashInput,
} from './connector-hash-input.js'
import { createDpmProfileConnectorStructuralResult } from './connector-normalize.js'
import {
  computeDpmProfileConnectorStructuralHash,
} from './connector-structural-hash.js'
import { DPM_PROFILE_CONNECTOR_RESULT_KIND } from './connector-result-kind.js'
import type {
  DpmProfileConnectorResult,
  DpmProfileConnectorResultInput,
} from './connector-types.js'

export function computeDpmProfileConnectorRunHash(
  input: Omit<DpmProfileConnectorResult, 'freshness'> | DpmProfileConnectorResultInput,
): string {
  const structural = 'kind' in input
    ? createDpmProfileConnectorStructuralResult(input, input.kind)
    : createDpmProfileConnectorHashInput(input, DPM_PROFILE_CONNECTOR_RESULT_KIND)

  return computeDpmProfileConnectorStructuralHash(structural)
}
