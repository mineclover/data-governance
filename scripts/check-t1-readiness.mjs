import { execFileSync } from 'node:child_process'
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

requireText(normalizedReadiness, '**Status: private preflight path available; T1 public release is not approved**', 'readiness status')
requireText(normalizedPacket, '**Status: recommendation prepared; owner approval required before any public-release action**', 'candidate packet status')
requireText(normalize(releaseGate), 'issues: read', 'release-gate issue permission')
requireText(normalize(releaseGate), 'Verify T1 owner approval', 'release-gate approval step')
requireText(normalize(releaseGate), 'gh issue view 2', 'release-gate Issue #2 lookup')
requireText(normalize(releaseGate), 'scripts/check-t1-approval.mjs', 'release-gate approval checker')
for (const [value, label] of [
  ['@mineclover/dpm', 'recommended public package identity'],
  ['npm public registry', 'recommended registry'],
  ['v0.1.0', 'recommended first release reference'],
  ['Apache-2.0', 'recommended license'],
  ['one subsequent release', 'compatibility window'],
]) {
  requireText(normalizedPacket, value, label)
}

for (const [value, label] of [
  ['does not authorize public registry publication', 'readiness non-authorization boundary'],
  ['does not finalize package metadata', 'packet non-authorization boundary'],
  ['declaring the license in package metadata', 'license deferral'],
  ['Creating `v0.1.0`', 'tag deferral'],
  ['Publishing to npm, GitHub Packages, or another registry.', 'registry deferral'],
  ['Replacing, redirecting, or removing the', 'adapter deferral'],
  ['Applying the PostgreSQL migration or deploying the authoring storage contract.', 'database deferral'],
]) {
  requireText(normalizedPacket.includes(value) ? normalizedPacket : normalizedReadiness, value, label)
}

if (rootPackage.private !== true) throw new Error('root package must remain private before T1 approval')
if (rootPackage.version !== '0.1.0') throw new Error(`root package version must remain 0.1.0 before T1 approval; received ${rootPackage.version}`)
if (dpmPackage.private !== true) throw new Error('DPM package must remain private before T1 approval')
if (dpmPackage.name !== '@oa-sdk/dpm') throw new Error(`DPM package identity changed before T1 approval: ${dpmPackage.name}`)
if (dpmPackage.version !== '0.1.0') throw new Error(`DPM package version must remain 0.1.0 before T1 approval; received ${dpmPackage.version}`)
if ('license' in dpmPackage || 'publishConfig' in dpmPackage) {
  throw new Error('public license or publish metadata appeared before T1 approval')
}

const licenseFiles = ['LICENSE', 'LICENSE.md', 'LICENSE.txt'].filter(file => existsSync(`${root}/${file}`))
if (licenseFiles.length > 0) throw new Error(`public license file appeared before T1 approval: ${licenseFiles.join(', ')}`)

const tags = execFileSync('git', ['tag', '--list', 'v*'], { cwd: root, encoding: 'utf8' }).trim()
if (tags) throw new Error(`release tag appeared before T1 approval: ${tags}`)

console.log('T1 readiness OK: private candidate and recommendation-only release gate are intact')

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
