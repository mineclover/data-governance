import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID,
  DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_VERSION,
  profileKafkaTopic,
} from '@context-action/dpm/profile'
import {
  createDpmGatewayRuntime,
} from '@context-action/dpm/gateway'
import {
  DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE,
  DpmRegistryApprovedRelationshipConflictError,
  createDpmRegistryRepository,
  isDpmRegistryApprovedRelationshipConflictError,
} from '@context-action/dpm/storage'

const testDir = dirname(fileURLToPath(import.meta.url))
const fixturePath = join(testDir, '../examples/profile-kafka/kafka-orders-created.json')
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))
const unsafeFragments = [
  'rawSample',
  'payloadSample',
  'credential',
  'secret',
  'reverseLookup',
  'vaultMaterial',
]

const connectorResult = profileKafkaTopic({
  ...fixture,
  connectorId: DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID,
  connectorVersion: DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_VERSION,
  captureMode: 'snapshot',
})
assertEqual(connectorResult.status, 'completed', 'connector status')

const profileArtifact = required(connectorResult.profileArtifact, 'expected profile artifact')
const runtime = createDpmGatewayRuntime()
const analysisResponse = await runtime.analyzeDpmProfile({ profileArtifact })
assertEqual(analysisResponse.statusCode, 200, 'profile analysis status code')

const relationshipHint = required(
  analysisResponse.body.result.analysisReport.relationshipHints.find(hint =>
    hint.id === 'proposal:edge:relationship-hint:hint:orders-created-customer'
  ),
  'expected orders-created customer relationship hint',
)
const registryRows = []
const registryAuditEvents = []
const registryRepository = createDpmRegistryRepository({
  upsertRelationshipRow(row) {
    registryRows.push(row)
  },
  appendRelationshipAuditEvent(row) {
    registryAuditEvents.push(row)
  },
  listRelationshipRows(request) {
    return registryRows.filter(row =>
      row.datasetId === request.datasetId && row.registryVersion === request.registryVersion,
    )
  },
  listRelationshipAuditEvents(request) {
    return registryAuditEvents.filter(row =>
      row.datasetId === request.datasetId
      && row.registryVersion === request.registryVersion
      && (!request.relationshipName || row.relationshipName === request.relationshipName),
    )
  },
})
const conflict = new DpmRegistryApprovedRelationshipConflictError({
  datasetId: profileArtifact.datasetId,
  registryVersion: 'registry-consumer-workflow-v1',
  relationshipName: 'rel_orders_customer',
  relationshipVersion: '2',
  constraint: 'dpm_registry_repository_single_approved_relationship_name',
})
assertEqual(
  conflict.code,
  DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE,
  'approved relationship conflict code',
)
assertEqual(
  isDpmRegistryApprovedRelationshipConflictError(conflict),
  true,
  'approved relationship conflict type guard',
)

const approvalResponse = await runtime.approveDpmProfileRelationshipHint({
  profileArtifact,
  relationshipHint,
  relationshipName: 'rel_orders_customer',
  childTableByPathPrefix: {
    'orders.created': 'public.orders',
  },
  registryVersion: 'registry-consumer-workflow-v1',
  version: '1',
  namespace: 'customer',
  transformStrategy: 'relationship_token',
  orphanPolicy: 'block',
  owner: 'privacy-platform',
  approvedBy: 'dpm-reviewer@example.com',
  reason: 'Kafka profile hint was mapped to a customer relationship for pseudonymized analytics.',
  approvedAt: '2026-07-07T00:10:00.000Z',
  auditEventId: 'audit:consumer-workflow:rel-orders-customer-approved',
  sourceFreshnessHash: analysisResponse.body.result.analysisReport.freshness.reportHash,
  createdAt: '2026-07-07T00:10:00.000Z',
  updatedAt: '2026-07-07T00:10:00.000Z',
  exportedAt: '2026-07-07T00:11:00.000Z',
  registryRepository,
})

assertEqual(approvalResponse.statusCode, 200, 'profile hint approval status code')
assertEqual(approvalResponse.body.result.status, 'approved', 'profile hint approval status')
assertEqual(
  approvalResponse.body.result.relationshipWriteReceipt.approvalAuditEventId,
  'audit:consumer-workflow:rel-orders-customer-approved',
  'approval audit event id',
)
assertEqual(
  approvalResponse.body.result.registrySnapshot.approvedRelationships[0]?.name,
  'rel_orders_customer',
  'approved relationship name',
)
assertEqual(registryRows.length, 1, 'registry row count')
assertEqual(registryAuditEvents.length, 1, 'registry audit event count')

const auditTimelineResponse = await runtime.listDpmRegistryRelationshipAuditEvents({
  datasetId: profileArtifact.datasetId,
  registryVersion: 'registry-consumer-workflow-v1',
  relationshipName: 'rel_orders_customer',
  registryAuditEventRepository: registryRepository,
})

assertEqual(auditTimelineResponse.statusCode, 200, 'approval audit timeline status code')
assertEqual(
  auditTimelineResponse.body.result.auditEvents[0]?.eventId,
  'audit:consumer-workflow:rel-orders-customer-approved',
  'approval audit timeline event id',
)
assertEqual(
  auditTimelineResponse.body.result.auditEvents[0]?.relationshipVersion,
  '1',
  'approval audit timeline relationship version',
)

const blockingResponse = await runtime.approveDpmProfileRelationshipHint({
  profileArtifact,
  relationshipHint,
  relationshipName: 'rel_orders_customer',
  childTableByPathPrefix: {
    'orders.created': 'public.orders',
  },
  registryVersion: 'registry-consumer-workflow-v1',
  version: '2',
  namespace: 'customer',
  transformStrategy: 'relationship_token',
  orphanPolicy: 'block',
  owner: 'privacy-platform',
  approvedBy: 'dpm-reviewer@example.com',
  reason: 'Concurrent approved version should be blocked by the registry repository.',
  approvedAt: '2026-07-07T00:12:00.000Z',
  auditEventId: 'audit:consumer-workflow:rel-orders-customer-conflict',
  sourceFreshnessHash: analysisResponse.body.result.analysisReport.freshness.reportHash,
  createdAt: '2026-07-07T00:12:00.000Z',
  updatedAt: '2026-07-07T00:12:00.000Z',
  exportedAt: '2026-07-07T00:13:00.000Z',
  registryRepository,
})

assertEqual(blockingResponse.statusCode, 400, 'profile hint conflict status code')
assertEqual(blockingResponse.body.result.status, 'blocked', 'profile hint conflict status')
assertEqual(
  blockingResponse.body.result.diagnostics[0]?.code,
  'PROF204',
  'profile hint conflict diagnostic code',
)
assertEqual(registryRows.length, 1, 'registry row count after conflict')
assertEqual(registryAuditEvents.length, 1, 'registry audit event count after conflict')
const auditTimelineAfterConflictResponse = await runtime.listDpmRegistryRelationshipAuditEvents({
  datasetId: profileArtifact.datasetId,
  registryVersion: 'registry-consumer-workflow-v1',
  relationshipName: 'rel_orders_customer',
  registryAuditEventRepository: registryRepository,
})
assertEqual(
  auditTimelineAfterConflictResponse.body.result.auditEvents.length,
  1,
  'approval audit timeline count after conflict',
)
assertNoUnsafeFragments(JSON.stringify({
  connectorResult,
  analysis: analysisResponse.body.result,
  approval: approvalResponse.body.result,
  auditTimeline: auditTimelineResponse.body.result,
  blocking: blockingResponse.body.result,
  auditTimelineAfterConflict: auditTimelineAfterConflictResponse.body.result,
}))

console.log(JSON.stringify({
  status: 'ok',
  workflow: 'dpm.package-consumer.profile-to-registry',
  imports: [
    '@context-action/dpm/profile',
    '@context-action/dpm/gateway',
    '@context-action/dpm/storage',
  ],
  profileId: profileArtifact.profileId,
  relationshipName: approvalResponse.body.result.relationshipName,
  registryVersion: approvalResponse.body.result.relationshipWriteReceipt.registryVersion,
  approvalAuditEventId: approvalResponse.body.result.relationshipWriteReceipt.approvalAuditEventId,
  auditEventCount: auditTimelineAfterConflictResponse.body.result.auditEvents.length,
  blockingDiagnosticCode: blockingResponse.body.result.diagnostics[0]?.code,
}, null, 2))

function required(value, message) {
  if (!value) throw new Error(message)
  return value
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
  }
}

function assertNoUnsafeFragments(serialized) {
  for (const unsafe of unsafeFragments) {
    if (serialized.includes(unsafe)) {
      throw new Error(`unsafe fragment leaked into consumer workflow smoke: ${unsafe}`)
    }
  }
}
