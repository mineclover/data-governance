import type { RegistryConditionMetadata } from './registry-relationship-types.js'
import {
  optionalString,
  requireArray,
  requireRecord,
  requireString,
} from './registry-yaml-values.js'

export function toRegistryYamlCondition(raw: unknown): RegistryConditionMetadata | undefined {
  if (raw === undefined || raw === null) return undefined
  const record = requireRecord(raw, 'relationship.condition')
  const conditionSql = optionalString(record.conditionSql ?? record.condition_sql, 'condition.conditionSql')
  const temporalCondition = optionalString(
    record.temporalCondition ?? record.temporal_condition,
    'condition.temporalCondition',
  )

  return {
    contextColumns: requireArray(record.contextColumns ?? record.context_columns ?? [], 'condition.contextColumns')
      .map((column, index) => requireString(column, `condition.contextColumns[${index}]`)),
    ...(conditionSql ? { conditionSql } : {}),
    ...(temporalCondition ? { temporalCondition } : {}),
  }
}
