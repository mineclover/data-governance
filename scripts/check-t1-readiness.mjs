import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const readiness = read('docs/internal/goals/t1-readiness.md')
const packet = read('docs/internal/goals/t1-candidate-decision-packet.md')
const releaseGate = read('.github/workflows/release-gate.yml')
const publishWorkflow = read('.github/workflows/publish.yml')
const rootPackage = readJson('package.json')
const dpmPackage = readJson('packages/dpm/package.json')
const normalizedReadiness = normalize(readiness)
const normalizedPacket = normalize(packet)

requireText(normalizedReadiness, '**Status: v0.1.3 OIDC validation complete; repository public (confirmed 2026-10-24)**', 'readiness status')
requireText(normalizedPacket, '**Status: owner-approved; `@oa-sdk/dpm@0.1.3` OIDC-published 2026-10-24**', 'candidate packet status')
requireText(normalize(releaseGate), 'issues: read', 'release-gate issue permission')
requireText(normalize(releaseGate), 'Verify T1 owner approval', 'release-gate approval step')
requireText(normalize(releaseGate), 'RELEASE_APPROVAL_ISSUE: 3', 'release-gate v0.1.3 approval issue')
requireText(normalize(releaseGate), 'RELEASE_VERSION: 0.1.3', 'release-gate v0.1.3 version')
requireText(normalize(releaseGate), 'gh issue view "$RELEASE_APPROVAL_ISSUE"', 'release-gate approval issue lookup')
requireText(normalize(releaseGate), 'scripts/check-t1-approval.mjs', 'release-gate approval checker')
requireText(normalize(releaseGate), 'Check cross-definition read-model contract', 'release-gate read-model contract step')
requireText(normalize(releaseGate), 'pnpm check:read-model-contract', 'release-gate read-model contract checker')
requireText(normalize(releaseGate), 'Check read-model activation packet', 'release-gate activation packet step')
requireText(normalize(releaseGate), 'pnpm check:read-model-activation', 'release-gate activation packet checker')
requireText(normalize(publishWorkflow), 'id-token: write', 'npm trusted-publishing permission')
requireText(normalize(publishWorkflow), 'npm publish --access public --provenance', 'public npm publication command')
if (/NPM_TOKEN|NODE_AUTH_TOKEN/.test(publishWorkflow)) {
  throw new Error('publish workflow must not depend on NPM_TOKEN or NODE_AUTH_TOKEN after OIDC migration')
}
for (const [value, label] of [
  ['@oa-sdk/dpm', 'recommended public package identity'],
  ['npm public registry', 'recommended registry'],
  ['v0.1.3', 'OIDC validation release reference'],
  ['Apache-2.0', 'recommended license'],
  ['existing `@oa-sdk/dpm` import identity', 'package continuity'],
]) {
  requireText(normalizedPacket, value, label)
}

requireText(normalizedPacket, 'npm Trusted Publishing', 'approved publication sequence')
requireText(normalizedPacket, 'Reuse the existing `@oa-sdk/dpm` import identity from the canonical owner repository', 'approved package continuity sequence')
requireText(normalizedReadiness, 'create the exact `v0.1.3` tag on `main`', 'tag execution sequence')

if (rootPackage.private !== true) throw new Error('root workspace package must remain private')
if (rootPackage.version !== '0.1.3') throw new Error(`root package version must remain 0.1.3 for the OIDC validation release; received ${rootPackage.version}`)
if (dpmPackage.private === true) throw new Error('DPM package must be publishable')
if (dpmPackage.name !== '@oa-sdk/dpm') throw new Error(`DPM package identity does not match approved public target: ${dpmPackage.name}`)
if (dpmPackage.version !== '0.1.3') throw new Error(`DPM package version must remain 0.1.3 for the OIDC validation release; received ${dpmPackage.version}`)
if (dpmPackage.license !== 'Apache-2.0') throw new Error(`DPM package license must be Apache-2.0; received ${dpmPackage.license ?? '<missing>'}`)
if (dpmPackage.publishConfig?.access !== 'public') throw new Error('DPM package must declare public npm access')
if (!dpmPackage.files?.includes('LICENSE')) throw new Error('DPM package files must include LICENSE')
if (dpmPackage.repository?.url !== 'git+https://github.com/mineclover/data-governance.git') throw new Error('DPM package repository URL must match the canonical GitHub repository')

for (const licenseFile of ['LICENSE', 'packages/dpm/LICENSE']) {
  if (!existsSync(`${root}/${licenseFile}`)) throw new Error(`approved license file is missing: ${licenseFile}`)
}

console.log('T1 readiness OK: published package identity and release gate are intact')

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
