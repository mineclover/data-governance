import type {
  LogicalRelationship,
  LogicalRelationshipCondition,
} from './relationship-types.js'

export function normalizeRelationshipCondition(
  condition: LogicalRelationshipCondition | undefined,
): LogicalRelationship['condition'] {
  return {
    contextColumns: [...(condition?.contextColumns ?? [])],
    ...(condition?.conditionSql ? { conditionSql: condition.conditionSql } : {}),
    ...(condition?.temporalCondition ? { temporalCondition: condition.temporalCondition } : {}),
    ...(condition?.metadata ? { metadata: JSON.parse(JSON.stringify(condition.metadata)) as Record<string, unknown> } : {}),
  }
}
