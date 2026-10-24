#!/usr/bin/env node
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runDpmCli } from '../../dist/cli/index.js'

const demoDir = dirname(fileURLToPath(import.meta.url))
const fixtureDir = join(demoDir, '../../test/fixtures/authoring')
const pathFor = name => join(fixtureDir, name)
const before = pathFor('customer-before-revision.json')
const after = pathFor('customer-after-draft.json')
const current = pathFor('customer-current-revision.json')
const target = pathFor('customer-target-revision.json')
const billing = pathFor('billing-revision.json')
const events = pathFor('audit-events.json')

const checks = []
const inspect = await runJson(['authoring', 'inspect', '--revision', before])
checks.push({ name: 'inspect revision', pass: inspect.command === 'authoring-inspect' && inspect.result.documentKind === 'published-revision' })

const diff = await runJson(['authoring', 'diff', '--before', before, '--after', after])
checks.push({ name: 'semantic diff', pass: diff.command === 'authoring-diff' && diff.result.breaking === true })

const review = await runJson(['authoring', 'review', '--before', before, '--after', after])
checks.push({ name: 'approval review', pass: review.command === 'authoring-review' && review.result.approvalRequired === true })

const reviewGate = await runExpectedFailure([
  'authoring',
  'review',
  '--before',
  before,
  '--after',
  after,
  '--fail-on-approval-required',
  'true',
])
checks.push({
  name: 'approval review CI gate',
  pass: reviewGate.exitCode === 1
    && JSON.parse(reviewGate.stdout).result.approvalRequired === true
    && reviewGate.stderr === '',
})

const applyPlan = await runJson(['authoring', 'apply-plan', '--before', before, '--after', after])
checks.push({
  name: 'apply plan remains read-only',
  pass: applyPlan.result.mutation === 'none'
    && applyPlan.result.executable === false
    && applyPlan.result.authorization.defaultDeny === true
    && applyPlan.result.concurrency.staleBaseMustBeRejected === true
    && applyPlan.result.idempotency.duplicateRequestReturnsOriginalOutcome === true
    && applyPlan.result.persistence.atomicAuditWithPublication === true
    && applyPlan.result.dryRun.default === true
    && applyPlan.result.rollback.targetRetentionRequired === true,
})

const audit = await runJson(['authoring', 'audit', '--events', events])
checks.push({ name: 'audit readback', pass: audit.command === 'authoring-audit' && audit.result.chronological === true })

const validation = await runJson(['authoring', 'validate', '--revision', before])
checks.push({ name: 'artifact validation', pass: validation.command === 'authoring-validate' && validation.result.valid === true })

const search = await runJson([
  'authoring',
  'search',
  '--revision',
  before,
  '--revision',
  billing,
  '--field-name',
  'customerNo',
])
checks.push({ name: 'offline cross-definition search', pass: search.result.status === 'ready' && search.result.hits.length === 2 })

const rollback = await runJson(['authoring', 'rollback-plan', '--current', current, '--target', target])
checks.push({ name: 'rollback plan', pass: rollback.result.action === 'rollback' && rollback.result.mutation === 'none' })

if (checks.some(check => !check.pass)) {
  throw new Error(`Authoring demo failed: ${JSON.stringify(checks)}`)
}

console.log(JSON.stringify({
  demo: 'dpm.authoring-review',
  description: 'Read-only authoring inspect, review, planning, audit, validation, search, and rollback rehearsal.',
  mutation: 'none',
  fixtureRoot: fixtureDir,
  checks,
}, null, 2))

async function runJson(args) {
  const result = await runDpmCli(args)
  if (result.exitCode !== 0) throw new Error(result.stderr || `CLI failed: ${args.join(' ')}`)
  return JSON.parse(result.stdout)
}

async function runExpectedFailure(args) {
  const result = await runDpmCli(args)
  return {
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
  }
}
