import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contract = fs.readFileSync(
  path.join(root, 'docs/internal/goals/phase-8-cross-definition-read-model-contract.md'),
  'utf8',
)
const authoringIndex = fs.readFileSync(path.join(root, 'packages/dpm/src/authoring/index.ts'), 'utf8')
const publicAuthoring = fs.readFileSync(path.join(root, 'packages/dpm/src/public/authoring.ts'), 'utf8')
const shadowHarness = fs.readFileSync(path.join(root, 'packages/dpm/src/authoring/read-model-shadow.ts'), 'utf8')
const normalizedContract = contract.replace(/\s+/g, ' ')

const requiredMarkers = [
  '**Status: private contract prepared 2026-07-15; runtime activation deferred**',
  '**Runtime activation: deferred**',
  '## Contract invariants',
  'ownerNamespace, definitionId, revisionId, identityKind, identityKey, objectId',
  '`identityKind` is one of `object`, `api`, or `db`',
  '`freshnessIdentity`',
  '`read-model-unavailable`',
  'staged rebuild session',
  'atomic ready publication',
  'shadow parity harness',
  'freshness identity, result ordering, API binding context',
  'strict error mapping',
  'default policy is deny',
  '`pageSize` defaults to `25` and has a hard maximum of `100`',
  'No PostgreSQL migration',
  'public package metadata, registry publication, license finalization, `v*` tag, or adapter cutover',
]

const missing = requiredMarkers.filter((marker) => !normalizedContract.includes(marker))
if (missing.length > 0) {
  console.error(`Cross-definition read-model contract check failed:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

if (contract.includes('**Status: active')) {
  console.error('Cross-definition read-model contract must remain non-active before owner gates')
  process.exit(1)
}

if (authoringIndex.includes('read-model-contract') || publicAuthoring.includes('read-model-contract') ||
  authoringIndex.includes('read-model-shadow') || publicAuthoring.includes('read-model-shadow')) {
  console.error('Cross-definition read-model reference and shadow harness must not be exported from the public authoring seam')
  process.exit(1)
}

if (!shadowHarness.includes('compareDpmCrossDefinitionReadModelShadow') ||
  !shadowHarness.includes('compareFailure') || !shadowHarness.includes('expectedFailure')) {
  console.error('Cross-definition read-model shadow harness must compare bounded fallback parity and strict failures')
  process.exit(1)
}

console.log('Cross-definition read-model contract OK: contract prepared and runtime activation deferred')
