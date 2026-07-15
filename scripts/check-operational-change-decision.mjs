import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const decision = read('docs/internal/goals/phase-8-operational-change-decision.md')
const packet = read('docs/internal/goals/phase-8-operational-migration-packet.md')
const normalizedDecision = decision.replace(/\s+/g, ' ')
const normalizedPacket = packet.replace(/\s+/g, ' ')

const requiredDecisionRows = [
  'Environment order',
  'Schema boundary',
  'Database roles',
  'Connection handling',
  'Migration mechanism',
  'Data state',
  'Backup',
  'Backend switch',
  'Cutover order',
  'Observation window',
  'Rollback',
]

const requiredOwnerFields = [
  'target environment/provider',
  'schema/migration owner role',
  'connection pool limits',
  'migration runner and operator',
  'managed snapshot and logical-backup retention policy',
  'target data-state confirmation',
  'feature-flag owner and previous-backend fallback path',
  'on-call owner, change record, start time',
]

const requiredMarkers = [
  [decision, '**Status: recommendation prepared; no operational change or database deployment authorized**'],
  [decision, 'DPM_AUTHORING_BACKEND=memory|postgres'],
  [decision, 'memory` as the default'],
  [normalizedPacket, 'createDpmConfiguredAsyncAuthoringService()'],
  [decision, 'No production database connection or migration is performed'],
  [decision, 'No public package metadata, registry publication, license finalization, tag, or adapter cutover'],
  [decision, 'No destructive DDL'],
  [packet, '**Status: prepared for review; no database migration or deployment authorized**'],
  [normalizedPacket, 'It is a runbook and approval artifact, not an execution record.'],
  [normalizedPacket, 'current repository has not applied this packet.'],
  [normalizedPacket, 'does not satisfy the owner-approved operational change requirement.'],
]

const failures = []
for (const row of requiredDecisionRows) {
  if (!decision.includes(`| ${row} |`)) failures.push(`decision row: ${row}`)
}
for (const field of requiredOwnerFields) {
  if (!decision.includes(field)) failures.push(`owner field: ${field}`)
}
for (const [source, marker] of requiredMarkers) {
  if (!source.includes(marker)) failures.push(`marker: ${marker}`)
}

if (failures.length > 0) {
  console.error(`Operational change decision check failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('Operational change decision OK: recommendation-only state and owner gates are present')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}
