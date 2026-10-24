import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const runner = read('packages/dpm/src/cli/runner-authoring.ts')
const cliPackage = JSON.parse(read('packages/dpm/package.json'))
const workspacePackage = JSON.parse(read('package.json'))
const checkpoint = read('docs/internal/goals/dpm-cli-checkpoint-2026-10-24.md')
const mutationContract = read('docs/internal/goals/phase-8-authoring-mutation-entry-contract.md')

const requiredRunnerMarkers = [
  "'authoring-apply-plan'",
  "mutation: 'none'",
  'executable: false',
  'staleBaseMustBeRejected: true',
  'duplicateRequestReturnsOriginalOutcome: true',
  'atomicAuditWithPublication: true',
  'targetRetentionRequired: true',
]
const failures = []

for (const marker of requiredRunnerMarkers) {
  if (!runner.includes(marker)) failures.push(`runner marker: ${marker}`)
}
if (typeof cliPackage.scripts?.['demo:authoring'] !== 'string') failures.push('DPM demo:authoring script')
if (!workspacePackage.scripts?.['smoke:dpm']?.includes('demo:authoring')) failures.push('root smoke:dpm authoring demo gate')
if (!checkpoint.includes('authoring apply-plan')) failures.push('checkpoint read-only apply-plan boundary')
if (!mutationContract.includes('**Status: recommendation prepared; mutation activation deferred**')) {
  failures.push('mutation contract deferred status')
}

if (failures.length > 0) {
  console.error(`Authoring CLI boundary check failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('Authoring CLI boundary OK: plans remain non-executable and mutation activation is deferred')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}
