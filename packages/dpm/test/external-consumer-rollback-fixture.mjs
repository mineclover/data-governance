import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { createPostgresCatalogSnapshot } from '@context-action/dpm/catalog'
import {
  compileDpmPlan,
  computeDpmApiArtifactVersionHash,
  parseRegistrySnapshotYaml,
} from '@context-action/dpm/relationship'

const manifest = JSON.parse(readFileSync('./fixtures/customer-orders.json', 'utf8'))
const catalog = createPostgresCatalogSnapshot(JSON.parse(
  readFileSync('./fixtures/catalog/postgres-commerce.json', 'utf8'),
))
const registry = parseRegistrySnapshotYaml(readFileSync('./fixtures/commerce-registry.yaml', 'utf8'))
manifest.catalog.version_hash = catalog.freshness.versionHash

const apiDocument = {
  openapi: '3.2.0',
  paths: {
    '/customers/{customerId}': {
      get: {
        operationId: 'getCustomer',
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    customerNo: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}
const apiVersionHash = computeDpmApiArtifactVersionHash(apiDocument)
manifest.data_definitions = {
  version: '1.1',
  fields: [{
    object_id: 'customer-number',
    revision_id: 'customer-number-rev-1',
    entity: {
      dataset_id: 'commerce_ai',
      namespace: 'customer',
      name: 'customer',
    },
    name: 'customerNo',
    type: 'string',
    origin: 'persisted',
    storage_ref: {
      table: 'public.customers',
      column: 'customer_no',
      catalog: {
        snapshot_id: 'catalogs/commerce-postgres.json',
        version_hash: catalog.freshness.versionHash,
      },
    },
  }],
  api_bindings: [{
    binding_id: 'customer-number-response',
    data_field: {
      object_id: 'customer-number',
      revision_id: 'customer-number-rev-1',
    },
    api: {
      artifact_id: 'commerce-api',
      operation_id: 'getCustomer',
      pointer: '#/paths/~1customers~1%7BcustomerId%7D/get/responses/200/content/application~1json/schema/properties/customerNo',
      version_hash: apiVersionHash,
    },
    direction: 'response',
  }],
}

const apiArtifacts = [{
  artifactId: 'commerce-api',
  document: apiDocument,
  provenance: {
    versionHash: apiVersionHash,
    sourceCoordinate: {
      kind: 'file',
      filePath: 'artifacts/commerce-api.yaml',
      pointer: '#/paths/~1customers~1{customerId}/get',
    },
  },
}]

function compile(inputManifest, inputApiArtifacts) {
  return compileDpmPlan({
    manifest: inputManifest,
    catalog,
    registry,
    apiArtifacts: inputApiArtifacts,
    phase: 'compile',
  })
}

const original = compile(manifest, apiArtifacts)
assert.equal(original.ok, true, 'preserved inputs must compile before migration')
if (!original.ok) throw new Error('preserved inputs did not compile')

const changedDocument = structuredClone(apiDocument)
changedDocument.info = { version: '2.0.0' }
const changedHash = computeDpmApiArtifactVersionHash(changedDocument)
const changedManifest = structuredClone(manifest)
changedManifest.data_definitions.api_bindings[0].api.version_hash = changedHash
const changedArtifacts = [{
  ...apiArtifacts[0],
  document: changedDocument,
  provenance: {
    ...apiArtifacts[0].provenance,
    versionHash: changedHash,
  },
}]

const changed = compile(changedManifest, changedArtifacts)
assert.equal(changed.ok, true, 'accepted artifact migration must compile')
if (!changed.ok) throw new Error('changed artifact did not compile')
assert.notEqual(changed.plan.identity, original.plan.identity)
assert.equal(changed.plan.freshness.dataBindingFreshness.apiArtifacts[0].versionHash, changedHash)

const rejectedStaleRollout = compile(changedManifest, apiArtifacts)
assert.equal(rejectedStaleRollout.ok, false, 'stale rollout must be rejected before execution')
assert.ok(rejectedStaleRollout.diagnostics.some(diagnostic => diagnostic.code === 'DAT007'))

const rollback = compile(manifest, apiArtifacts)
assert.equal(rollback.ok, true, 'rollback must recompile from preserved inputs')
if (!rollback.ok) throw new Error('rollback inputs did not compile')
assert.equal(rollback.plan.identity, original.plan.identity)
assert.notEqual(rollback.plan.identity, changed.plan.identity)
assert.equal(
  rollback.plan.dataBindingArtifact?.freshness.identityHash,
  original.plan.dataBindingArtifact?.freshness.identityHash,
)

console.log(JSON.stringify({
  status: 'ok',
  originalPlanIdentity: original.plan.identity,
  changedPlanIdentity: changed.plan.identity,
  rollbackPlanIdentity: rollback.plan.identity,
  rejectedDiagnosticCodes: rejectedStaleRollout.diagnostics
    .filter(diagnostic => diagnostic.code === 'DAT007')
    .map(diagnostic => diagnostic.code),
}, null, 2))
