import type { RegistryEvidence } from './registry-relationship-types.js'
import {
  optionalNumber,
  requireRecord,
  requireString,
} from './registry-yaml-values.js'

export function toRegistryYamlEvidence(raw: unknown): RegistryEvidence {
  const record = requireRecord(raw, 'relationship.evidence')
  const score = optionalNumber(record.score, 'evidence.score')
  const metadata =
    record.metadata && typeof record.metadata === 'object'
      ? { metadata: record.metadata as Record<string, unknown> }
      : {}

  return {
    kind: requireString(record.kind, 'evidence.kind'),
    message: requireString(record.message, 'evidence.message'),
    ...(score !== undefined ? { score } : {}),
    ...metadata,
  }
}
