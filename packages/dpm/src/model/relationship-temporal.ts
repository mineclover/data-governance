import type { TemporalRelationshipInput } from './relationship-types.js'

export function copyTemporalRelationshipInput(temporal: TemporalRelationshipInput): TemporalRelationshipInput {
  return {
    ...(temporal.validTimeColumn ? { validTimeColumn: temporal.validTimeColumn } : {}),
    ...(temporal.validTimeAbsentReason ? { validTimeAbsentReason: temporal.validTimeAbsentReason } : {}),
  }
}
