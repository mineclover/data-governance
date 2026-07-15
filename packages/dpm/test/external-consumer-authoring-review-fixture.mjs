import assert from 'node:assert/strict'

import {
  createDpmAuthoringQuickFixes,
  createDpmAuthoringSemanticDiff,
  explainDpmAuthoringDefinitions,
  exportDpmAuthoringDefinitions,
  importDpmAuthoringDefinitions,
} from '@oa-sdk/dpm/authoring'
import { createDpmIdentityDataDefinitions } from '@oa-sdk/dpm/data'

const definitions = createDefinitions()
const exported = exportDpmAuthoringDefinitions(definitions)
const imported = importDpmAuthoringDefinitions(exported)

assert.equal(exported, exportDpmAuthoringDefinitions(definitions))
assert.deepEqual(imported, definitions)
assert.equal(exported.includes('"identity"'), false)
assert.equal(exported.includes('"targetIdentity"'), false)

const explanation = explainDpmAuthoringDefinitions(definitions)
assert.equal(explanation.fieldCount, 1)
assert.equal(explanation.apiBindingCount, 1)
assert.equal(Object.isFrozen(explanation), true)
assert.equal(Object.isFrozen(explanation.fields), true)
assert.equal(JSON.stringify(explanation).includes('sample'), false)
assert.equal(JSON.stringify(explanation).includes('token'), false)

const breakingFixes = createDpmAuthoringQuickFixes(createDiff(createDefinitions({ type: 'number' })))
assert.deepEqual(breakingFixes.map(fix => fix.kind), ['review-breaking-change'])
assert.equal(breakingFixes[0]?.requiresApproval, true)
assert.equal(breakingFixes[0]?.autoApplicable, false)

const renameFixes = createDpmAuthoringQuickFixes(createDiff(createDefinitions({
  name: 'customerNumber',
  aliases: ['field:commerce/customer/customer/customerNo'],
})))
assert.deepEqual(renameFixes.map(fix => fix.kind), ['confirm-rename-alias'])

const deprecationFixes = createDpmAuthoringQuickFixes(createDiff(createDefinitions({ lifecycle: 'deprecated' })))
assert.deepEqual(deprecationFixes.map(fix => fix.kind), ['confirm-deprecation'])

console.log(JSON.stringify({
  status: 'ok',
  roundTrip: 'canonical-1.1',
  explanation: 'identity-only',
  quickFixKinds: [
    ...breakingFixes.map(fix => fix.kind),
    ...renameFixes.map(fix => fix.kind),
    ...deprecationFixes.map(fix => fix.kind),
  ],
  mutation: 'review-only',
}))

function createDiff(draftDefinitions) {
  return createDpmAuthoringSemanticDiff({
    definitionId: 'external-authoring-review',
    revisionId: 'revision-1',
    definitions,
    reason: 'initial',
    createdBy: 'owner',
    createdAt: '2026-07-15T00:00:00.000Z',
  }, {
    definitionId: 'external-authoring-review',
    draftId: 'draft-1',
    baseRevisionId: 'revision-1',
    definitions: draftDefinitions,
    status: 'draft',
    createdBy: 'editor',
    createdAt: '2026-07-15T00:01:00.000Z',
  })
}

function createDefinitions(overrides = {}) {
  return createDpmIdentityDataDefinitions({
    version: '1.1',
    fields: [{
      objectId: 'customer-number',
      revisionId: 'customer-number-rev-1',
      entity: { datasetId: 'commerce', namespace: 'customer', name: 'customer' },
      name: 'customerNo',
      type: 'string',
      origin: 'persisted',
      storageRef: {
        table: 'public.customers',
        column: 'customer_no',
        catalog: { snapshotId: 'commerce-catalog-1', versionHash: 'sha256:catalog-1' },
      },
      ...overrides,
    }],
    apiBindings: [{
      bindingId: 'customer-number-response',
      dataField: { objectId: 'customer-number', revisionId: 'customer-number-rev-1' },
      api: {
        artifactId: 'commerce-api',
        pointer: '#/components/schemas/Customer/properties/customerNo',
        versionHash: 'sha256:api-1',
      },
      direction: 'response',
    }],
  })
}
