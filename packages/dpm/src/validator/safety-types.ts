import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type { DpmValidationPhase } from './validation-types.js'

export type DpmSafetyValidationInput = {
  manifest: Record<string, unknown>
  registry: RegistrySnapshot
  phase: DpmValidationPhase
}

export type SafetyLookupContext = {
  registry: RegistrySnapshot
  relationshipByName: ReadonlyMap<string, Record<string, unknown>>
  entityByName: ReadonlyMap<string, Record<string, unknown>>
}
