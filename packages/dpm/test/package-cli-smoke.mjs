import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'

const packageRoot = new URL('..', import.meta.url)
const cliPath = new URL('../dist/cli/index.js', import.meta.url)
const fixtureRoot = new URL('./fixtures/authoring/', import.meta.url)
const fixtureNames = readdirSync(fixtureRoot).sort()
const fixtureContents = new Map(fixtureNames.map(name => [name, readFileSync(new URL(name, fixtureRoot))]))

const before = file('customer-before-revision.json')
const after = file('customer-after-draft.json')
const billing = file('billing-revision.json')
const audit = file('audit-events.json')
const outOfOrderAudit = file('audit-events-out-of-order.json')
const current = file('customer-current-revision.json')
const target = file('customer-target-revision.json')

const inspect = runJson(['authoring', 'inspect', '--revision', before])
assert(inspect.result.documentKind === 'published-revision', 'inspect result')

const diff = runJson(['authoring', 'diff', '--before', before, '--after', after])
assert(diff.result.breaking === true, 'semantic diff result')

const review = runJson(['authoring', 'review', '--before', before, '--after', after])
assert(review.result.approvalRequired === true, 'default review result')

const rollback = runJson(['authoring', 'rollback-plan', '--current', current, '--target', target])
assert(rollback.result.action === 'rollback' && rollback.result.mutation === 'none', 'rollback-plan safety boundary')

const validation = runJson(['authoring', 'validate', '--revision', before])
assert(validation.command === 'authoring-validate', 'validate command envelope')
assert(validation.result.valid === true, 'validate result')

const help = runText(['authoring', '--help'])
assert(help.includes('Usage: oa-dpm authoring <inspect|search|audit|validate|diff|review|apply-plan|rollback-plan> [options]'), 'authoring help routing')
assert(runText(['authoring', '--version']).trim() === '0.1.3', 'grouped version routing')

const search = runJson([
  'authoring',
  'search',
  '--revision',
  before,
  '--revision',
  billing,
  '--field-name',
  'customerNo',
])
assert(search.command === 'authoring-search', 'search command envelope')
assert(search.result.status === 'ready' && search.result.hits.length === 2, 'search result')

const auditReadback = runJson(['authoring', 'audit', '--events', audit])
assert(auditReadback.command === 'authoring-audit', 'audit command envelope')
assert(auditReadback.result.eventCount === 3 && auditReadback.result.chronological === true, 'audit result')

const invalidAudit = runFailure(['authoring', 'validate', '--events', outOfOrderAudit])
assert(invalidAudit.status === 2, 'invalid audit exit code')
assert(invalidAudit.stderr.includes('audit events must be in chronological order'), 'invalid audit diagnostic')

const applyPlan = runJson(['authoring', 'apply-plan', '--before', before, '--after', after])
assert(applyPlan.result.mutation === 'none' && applyPlan.result.executable === false, 'apply-plan safety boundary')
assert(applyPlan.result.authorization.defaultDeny === true, 'apply-plan authorization contract')
assert(applyPlan.result.concurrency.staleBaseMustBeRejected === true, 'apply-plan concurrency contract')
assert(applyPlan.result.idempotency.duplicateRequestReturnsOriginalOutcome === true, 'apply-plan idempotency contract')
assert(applyPlan.result.persistence.atomicAuditWithPublication === true, 'apply-plan audit contract')
assert(applyPlan.result.dryRun.default === true && applyPlan.result.rollback.targetRetentionRequired === true, 'apply-plan recovery contract')

const approvalFailure = runFailure([
  'authoring',
  'review',
  '--before',
  before,
  '--after',
  after,
  '--fail-on-approval-required',
  'true',
])
assert(approvalFailure.status === 1, 'approval-required exit code')
assert(JSON.parse(approvalFailure.stdout).result.approvalRequired === true, 'approval-required JSON result')
assert(approvalFailure.stderr === '', 'approval-required stderr boundary')

const unchangedReview = runJson([
  'authoring', 'review', '--before', before,
  '--after', file('customer-unchanged-draft.json'), '--fail-on-approval-required', 'true',
])
assert(unchangedReview.result.approvalRequired === false && unchangedReview.result.changeCount === 0, 'unchanged review passes approval gate')
const invalidReviewOption = runFailure(['authoring', 'diff', '--fail-on-approval-required', 'true'])
assert(invalidReviewOption.status === 2 && invalidReviewOption.stdout === '', 'review-only option misuse exit boundary')
assert(invalidReviewOption.stderr.includes('Unknown option --fail-on-approval-required'), 'review-only option misuse diagnostic')

console.log('DPM CLI binary smoke OK: input fixture bytes and directory entries unchanged after every command')

function file(name) {
  return new URL(name, fixtureRoot).pathname
}

function runJson(args) {
  return JSON.parse(runText(args))
}

function runText(args) {
  const result = runCli(args)
  assert(result.status === 0, `expected success: ${args.join(' ')}\n${result.stderr}`)
  return result.stdout
}

function runFailure(args) {
  const result = runCli(args)
  assert(result.status !== 0, `expected failure: ${args.join(' ')}`)
  return result
}

function runCli(args) {
  const result = spawnSync(process.execPath, [cliPath.pathname, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
  })
  const command = args.join(' ')
  assert(JSON.stringify(readdirSync(fixtureRoot).sort()) === JSON.stringify(fixtureNames), `input fixture directory changed after ${command}`)
  for (const [name, contents] of fixtureContents) {
    assert(readFileSync(new URL(name, fixtureRoot)).equals(contents), `input fixture bytes changed after ${command}: ${name}`)
  }
  assert(!result.error && result.signal === null && result.status !== null, `CLI process failed: ${command}`)
  return result
}

function assert(condition, label) {
  if (!condition) throw new Error(`DPM CLI binary smoke failed: ${label}`)
}
