import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const readiness = read('docs/internal/goals/t1-readiness.md')
const packet = read('docs/internal/goals/t1-candidate-decision-packet.md')
const releaseGate = read('.github/workflows/release-gate.yml')
const rootPackage = readJson('package.json')
const dpmPackage = readJson('packages/dpm/package.json')
const normalizedReadiness = normalize(readiness)
const normalizedPacket = normalize(packet)

requireText(normalizedReadiness, '**Status: v0.1.1 package-identity transition; release execution in progress**', 'readiness status')
requireText(normalizedPacket, '**Status: owner-approved; public release execution authorized**', 'candidate packet status')
requireText(normalize(releaseGate), 'issues: read', 'release-gate issue permission')
requireText(normalize(releaseGate), 'Verify T1 owner approval', 'release-gate approval step')
requireText(normalize(releaseGate), 'gh issue view 2', 'release-gate Issue #2 lookup')
requireText(normalize(releaseGate), 'scripts/check-t1-approval.mjs', 'release-gate approval checker')
requireText(normalize(releaseGate), 'Check cross-definition read-model contract', 'release-gate read-model contract step')
requireText(normalize(releaseGate), 'pnpm check:read-model-contract', 'release-gate read-model contract checker')
requireText(normalize(releaseGate), 'Check read-model activation packet', 'release-gate activation packet step')
requireText(normalize(releaseGate), 'pnpm check:read-model-activation', 'release-gate activation packet checker')
for (const [value, label] of [
  ['@context-action/dpm', 'recommended public package identity'],
  ['npm public registry', 'recommended registry'],
  ['v0.1.1', 'approved corrected release reference'],
  ['Apache-2.0', 'recommended license'],
  ['one subsequent release', 'compatibility window'],
]) {
  requireText(normalizedPacket, value, label)
}

requireText(normalizedPacket, 'Publish `@context-action/dpm@0.1.1` from the approved tag.', 'approved publication sequence')
requireText(normalizedPacket, 'Keep `@oa-sdk/dpm` as a forwarding adapter', 'approved compatibility sequence')
requireText(normalizedReadiness, 'Create the exact `v0.1.1` tag on `main`', 'tag execution sequence')

if (rootPackage.private !== true) throw new Error('root package must remain private before T1 approval')
if (rootPackage.version !== '0.1.1') throw new Error(`root package version must remain 0.1.1 for the corrected release; received ${rootPackage.version}`)
if (dpmPackage.private === true) throw new Error('DPM package must be publishable after T1 approval')
if (dpmPackage.name !== '@context-action/dpm') throw new Error(`DPM package identity does not match approved public target: ${dpmPackage.name}`)
if (dpmPackage.version !== '0.1.1') throw new Error(`DPM package version must remain 0.1.1 for the corrected release; received ${dpmPackage.version}`)
if (dpmPackage.license !== 'Apache-2.0') throw new Error(`DPM package license must be Apache-2.0; received ${dpmPackage.license ?? '<missing>'}`)
if (dpmPackage.publishConfig?.access !== 'public') throw new Error('DPM package must declare public npm access')
if (!dpmPackage.files?.includes('LICENSE')) throw new Error('DPM package files must include LICENSE')

for (const licenseFile of ['LICENSE', 'packages/dpm/LICENSE']) {
  if (!existsSync(`${root}/${licenseFile}`)) throw new Error(`approved license file is missing: ${licenseFile}`)
}

console.log('T1 readiness OK: owner-approved public candidate and release gate are intact')

function read(relativePath) {
  return readFileSync(`${root}/${relativePath}`, 'utf8')
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath))
}

function normalize(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function requireText(value, expected, label) {
  if (!value.includes(expected)) throw new Error(`Missing T1 readiness ${label}: ${expected}`)
}
