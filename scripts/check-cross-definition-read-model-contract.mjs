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
const normalizedContract = contract.replace(/\s+/g, ' ')

const requiredMarkers = [
  '**Status: private contract prepared 2026-07-15; runtime activation deferred**',
  '**Runtime activation: deferred**',
  '## Contract invariants',
  'ownerNamespace, definitionId, revisionId, identityKind, identityKey, objectId',
  '`identityKind` is one of `object`, `api`, or `db`',
  '`freshnessIdentity`',
  '`read-model-unavailable`',
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

if (authoringIndex.includes('read-model-contract') || publicAuthoring.includes('read-model-contract')) {
  console.error('Cross-definition read-model reference must not be exported from the public authoring seam')
  process.exit(1)
}

console.log('Cross-definition read-model contract OK: contract prepared and runtime activation deferred')
