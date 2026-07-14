import type { RegistryEndpoint } from './registry-relationship-types.js'
import {
  requireArray,
  requireRecord,
  requireString,
} from './registry-yaml-values.js'

export {
  toRegistryYamlApproval,
  toRegistryYamlCondition,
  toRegistryYamlEvidence,
} from './registry-yaml-relationship-metadata.js'
export { toRegistryYamlStatus } from './registry-yaml-relationship-status.js'

export function toRegistryYamlEndpoint(raw: unknown, label: string): RegistryEndpoint {
  const record = requireRecord(raw, label)
  return {
    table: requireString(record.table, `${label}.table`),
    columns: requireArray(record.columns, `${label}.columns`).map((column, index) =>
      requireString(column, `${label}.columns[${index}]`),
    ),
  }
}
