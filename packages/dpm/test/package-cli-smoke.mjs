import { execFileSync } from 'node:child_process'

const packageRoot = new URL('..', import.meta.url)
const cliPath = new URL('../dist/cli/index.js', import.meta.url)
const fixtureRoot = new URL('./fixtures/authoring/', import.meta.url)

const before = file('customer-before-revision.json')
const after = file('customer-after-draft.json')
const billing = file('billing-revision.json')
const audit = file('audit-events.json')

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

const applyPlan = runText(['authoring', 'apply-plan', '--before', before, '--after', after, '--format', 'text'])
assert(applyPlan.includes('mutation: none') && applyPlan.includes('executable: false'), 'apply-plan safety boundary')

console.log('DPM CLI binary smoke OK')

function file(name) {
  return new URL(name, fixtureRoot).pathname
}

function runJson(args) {
  return JSON.parse(runText(args))
}

function runText(args) {
  return execFileSync(process.execPath, [cliPath.pathname, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
  })
}

function assert(condition, label) {
  if (!condition) throw new Error(`DPM CLI binary smoke failed: ${label}`)
}
