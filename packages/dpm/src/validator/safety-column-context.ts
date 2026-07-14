import type {
  SafetyColumnGateContext,
  SafetyColumnGateInput,
} from './safety-column-types.js'
import {
  asRecord,
  asString,
} from './value-utils.js'

export function createSafetyColumnGateContext(input: SafetyColumnGateInput): SafetyColumnGateContext {
  const pointer = `/columns/${input.index}`
  const transform = asRecord(input.column.transform)
  const relationshipSourcePointer = input.column.relationship
    ? `${pointer}/relationship`
    : `${pointer}/transform/relationship`

  return {
    ...input,
    pointer,
    role: asString(input.column.role),
    pii: input.column.pii === true,
    transformType: asString(transform.type),
    relationshipName: asString(input.column.relationship ?? transform.relationship),
    relationshipSourcePointer,
    entityName: asString(input.column.entity),
  }
}
