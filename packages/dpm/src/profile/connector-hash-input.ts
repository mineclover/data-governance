import type {
  DpmProfileConnectorResult,
  DpmProfileConnectorResultInput,
} from './connector-types.js'
import { createDpmProfileConnectorStructuralResult } from './connector-normalize.js'

export function createDpmProfileConnectorHashInput(
  input: DpmProfileConnectorResultInput,
  kind: DpmProfileConnectorResult['kind'],
): Omit<DpmProfileConnectorResult, 'freshness'> {
  return createDpmProfileConnectorStructuralResult(input, kind)
}
