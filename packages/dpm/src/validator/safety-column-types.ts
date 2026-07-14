import type { SafetyLookupContext } from './safety-types.js'

export type SafetyColumnGateInput = SafetyLookupContext & {
  column: Record<string, unknown>
  index: number
}

export type SafetyColumnGateContext = SafetyColumnGateInput & {
  pointer: string
  role: string
  pii: boolean
  transformType: string
  relationshipName: string
  relationshipSourcePointer: string
  entityName: string
}
