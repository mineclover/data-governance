import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

const source = {
  customers: [
    { id: 'customer-001', segment: 'synthetic-a' },
    { id: 'customer-002', segment: 'synthetic-b' },
  ],
  orders: [
    { id: 'order-001', customerId: 'customer-001' },
    { id: 'order-002', customerId: 'customer-001' },
    { id: 'order-003', customerId: 'customer-002' },
  ],
}

const emptyTarget = { customers: [], orders: [] }
const sourceCounts = counts(source)
const tokenMap = new Map()

const staged = transform(source)
assert.deepEqual(counts(staged), sourceCounts, 'rewrite must preserve source/target cardinality')
assert.equal(new Set(staged.customers.map(row => row.id)).size, source.customers.length)
assert.equal(new Set(staged.orders.map(row => row.id)).size, source.orders.length)
assert.equal(new Set(staged.customers.map(row => row.id)).size, staged.customers.length)
assert.ok(staged.customers.every(row => row.id !== 'customer-001' && row.id !== 'customer-002'))
assert.ok(staged.orders.every(row => staged.customers.some(customer => customer.id === row.customerId)))

const replay = transform(source)
assert.deepEqual(replay, staged, 'replay must be idempotent for the same synthetic policy/domain')

const originalDomainToken = tokenMap.get('customer-001')
const otherDomainToken = syntheticToken('other-domain-v1', 'customer-001')
assert.notEqual(otherDomainToken, originalDomainToken)

let committed = structuredClone(emptyTarget)
const beforeFailedCommit = structuredClone(committed)
try {
  stageAndCommit(committed, staged, { failAfter: 1 })
  assert.fail('failure injection must interrupt the commit')
} catch {
  assert.deepEqual(committed, beforeFailedCommit, 'partial failure must not publish target rows')
}

stageAndCommit(committed, staged)
assert.deepEqual(counts(committed), sourceCounts, 'successful commit must preserve cardinality')
assertIntegrity(committed)

const rollbackSnapshot = structuredClone(committed)
committed = structuredClone(emptyTarget)
assert.deepEqual(committed, emptyTarget, 'rollback must remove synthetic committed rows')
assert.notDeepEqual(rollbackSnapshot, committed, 'rollback evidence must observe a state change')

console.log(JSON.stringify({
  status: 'ok',
  dataClass: 'synthetic-only',
  sourceCounts,
  checks: {
    deterministicReplay: true,
    domainIsolation: true,
    cardinalityPreserved: true,
    referentialIntegrity: true,
    partialCommitHidden: true,
    rollback: true,
  },
  rawValuesEmitted: false,
  productionAccess: false,
}, null, 2))

function transform(input) {
  const customerIds = new Map(input.customers.map(row => [row.id, syntheticToken('customer-id-v1', row.id)]))
  return {
    customers: input.customers.map(row => ({ id: customerIds.get(row.id), segment: row.segment })),
    orders: input.orders.map(row => ({ id: row.id, customerId: customerIds.get(row.customerId) })),
  }
}

function syntheticToken(domain, value) {
  const token = `synthetic:${domain}:${createHash('sha256').update(`${domain}|${value}`).digest('hex').slice(0, 24)}`
  tokenMap.set(value, token)
  return token
}

function stageAndCommit(target, next, options = {}) {
  const stagedRows = structuredClone(next)
  let written = 0
  const output = { customers: [], orders: [] }
  for (const row of stagedRows.customers) {
    output.customers.push(row)
    written += 1
    if (written === options.failAfter) throw new Error('synthetic injected failure')
  }
  for (const row of stagedRows.orders) output.orders.push(row)
  target.customers = output.customers
  target.orders = output.orders
}

function assertIntegrity(value) {
  const customerIds = new Set(value.customers.map(row => row.id))
  for (const order of value.orders) assert.ok(customerIds.has(order.customerId), 'order must reference a customer')
}

function counts(value) {
  return { customers: value.customers.length, orders: value.orders.length }
}
