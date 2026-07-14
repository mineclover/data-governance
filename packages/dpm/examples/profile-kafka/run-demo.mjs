#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID,
  DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_VERSION,
  createDpmGatewayRuntime,
  createDpmProfileArtifactSnapshot,
  createDpmProfileBaselineRepository,
  createDpmRegistryRepository,
  createDpmRelationshipCandidateInputFromProfileHint,
  profileKafkaTopic,
  resolveDpmGatewayProfileAnalysisRequest,
  validateDpmProfileArtifactSchema,
  validateDpmProfileConnectorResult,
} from '../../dist/index.js'

const demoDir = dirname(fileURLToPath(import.meta.url))
const fixturePath = join(demoDir, 'kafka-orders-created.json')
const unsafeFragments = [
  'rawSample',
  'payloadSample',
  'credential',
  'secret',
  'reverseLookup',
  'vaultMaterial',
]

const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))
const runtime = createDpmGatewayRuntime()
const profileBaselineRows = new Map()
const registryRows = []
const registryAuditEvents = []
const profileBaselineRepository = createDpmProfileBaselineRepository({
  upsertProfileBaseline: row => profileBaselineRows.set(row.baselineRef, row),
  getProfileBaseline: request => profileBaselineRows.get(request.baselineRef),
  listProfileBaselines: request =>
    [...profileBaselineRows.values()]
      .filter(row => row.datasetId === request.datasetId && row.profileId === request.profileId)
      .slice(0, request.limit),
})
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
const steps = []
let connectorResult

await recordStep('flatten captured Kafka topic bundle into profile artifact', async () => {
  const result = profileKafkaTopicBundle(fixture)
  const profileArtifact = required(result.profileArtifact, 'expected Kafka profile artifact')
  const artifactValidation = validateDpmProfileArtifactSchema(profileArtifact)
  const connectorValidation = validateDpmProfileConnectorResult(result)

  assertEqual(result.status, 'completed', 'connector status')
  assertEqual(result.sourceKind, 'kafka_topic_bundle', 'connector source kind')
  assertEqual(artifactValidation.valid, true, 'profile artifact schema validity')
  assertEqual(connectorValidation.valid, true, 'connector result validity')
  assertNoUnsafeFragments(JSON.stringify(result))
  connectorResult = result

  return {
    connectorId: result.connectorId,
    runHash: result.freshness.runHash,
    profileVersionHash: profileArtifact.freshness.versionHash,
    sourceKinds: profileArtifact.sources.map(source => source.kind),
    nodeCount: profileArtifact.nodes.length,
    edgeCount: profileArtifact.edges.length,
    metricCount: profileArtifact.metrics.length,
    diagnosticCount: profileArtifact.diagnostics.length,
  }
})

const profileArtifact = required(connectorResult.profileArtifact, 'expected profile artifact after connector step')

await recordStep('create read-only SDK profile artifact snapshot', async () => {
  const probeResult = profileKafkaTopicBundle(fixture)
  const probeProfile = required(probeResult.profileArtifact, 'expected probe profile artifact')
  const snapshot = createDpmProfileArtifactSnapshot(probeProfile)
  const firstNodeLabel = snapshot.nodes[0]?.label
  const evidenceId = Object.keys(probeProfile.evidenceSources)[0]
  const evidencePath = snapshot.evidenceSources[evidenceId]?.coordinate.path

  probeProfile.nodes[0].label = 'mutated after SDK snapshot'
  probeProfile.evidenceSources[evidenceId].coordinate.path = 'mutated.after.sdk.snapshot'

  assertEqual(snapshot.nodes[0]?.label, firstNodeLabel, 'SDK snapshot node label')
  assertEqual(snapshot.evidenceSources[evidenceId]?.coordinate.path, evidencePath, 'SDK snapshot evidence path')
  assertEqual(Object.isFrozen(snapshot), true, 'SDK snapshot root frozen')
  assertEqual(Object.isFrozen(snapshot.nodes), true, 'SDK snapshot node collection frozen')
  assertEqual(Object.isFrozen(snapshot.nodes[0]), true, 'SDK snapshot node frozen')

  return {
    profileVersionHash: snapshot.freshness.versionHash,
    nodeLabel: snapshot.nodes[0]?.label,
    evidencePath,
    frozen: Object.isFrozen(snapshot),
  }
})

await recordStep('inspect profile artifact for editor runtime', async () => {
  const response = await runtime.inspectDpmProfile({ profileArtifact })

  assertEqual(response.statusCode, 200, 'profile inspection status code')
  assertEqual(response.body.result.nodeCount, profileArtifact.nodes.length, 'inspection node count')
  assertEqual(response.body.result.edgeCount, profileArtifact.edges.length, 'inspection edge count')
  assertEqual(response.body.result.metricCount, profileArtifact.metrics.length, 'inspection metric count')
  assertNoUnsafeFragments(JSON.stringify(response.body.result))

  return {
    command: response.body.command,
    nodeCount: response.body.result.nodeCount,
    edgeCount: response.body.result.edgeCount,
    metricCount: response.body.result.metricCount,
  }
})

let analysisReport

await recordStep('analyze profile artifact into review signals', async () => {
  const response = await runtime.analyzeDpmProfile({ profileArtifact })
  const report = response.body.result.analysisReport

  assertEqual(response.statusCode, 200, 'profile analysis status code')
  assertGreaterThan(report.relationshipHints.length, 0, 'relationship hint count')
  assertGreaterThan(report.keyCandidates.length, 0, 'key candidate count')
  assertGreaterThan(report.riskIndicators.length, 0, 'risk indicator count')
  assertNoUnsafeFragments(JSON.stringify(report))
  analysisReport = report

  return {
    command: response.body.command,
    reportHash: report.freshness.reportHash,
    relationshipHints: report.relationshipHints.map(hint => ({
      id: hint.id,
      status: hint.status,
      confidence: hint.confidence,
      targetRef: hint.targetRef,
    })),
    keyCandidateCount: report.keyCandidates.length,
    riskIndicatorCount: report.riskIndicators.length,
    measuredNodeRatio: report.coverage.measuredNodeRatio,
  }
})

await recordStep('compare profile artifact with previous measurement baseline', async () => {
  const previousFixture = createFixtureWithCustomerNoPresence(fixture, 0.91)
  const previousResult = profileKafkaTopicBundle(previousFixture)
  const previousProfileArtifact = required(previousResult.profileArtifact, 'expected previous profile artifact')
  const previousAnalysisResponse = await runtime.analyzeDpmProfile({
    profileArtifact: previousProfileArtifact,
  })
  const baseline = await profileBaselineRepository.saveProfileBaseline({
    profileArtifact: previousProfileArtifact,
    analysisReport: previousAnalysisResponse.body.result.analysisReport,
    measuredAt: '2026-07-07T00:00:00.000Z',
    measurementRunHash: previousResult.freshness.runHash,
    storedAt: '2026-07-07T00:05:00.000Z',
  })
  const baselineHistoryResponse = await runtime.listDpmProfileBaselineSummaries({
    datasetId: profileArtifact.datasetId,
    profileId: profileArtifact.profileId,
    profileBaselineRepository,
  })
  const baselineHistory = baselineHistoryResponse.body.result.baselineSummaries
  const resolvedRequest = await resolveDpmGatewayProfileAnalysisRequest({
    request: {
      profileArtifact,
      previousProfileBaseline: { selectionStrategy: 'latest_previous' },
    },
    profileBaselineRepository,
  })
  const selectedBaseline = required(
    resolvedRequest.previousProfileBaselineSummary,
    'expected selected previous profile baseline summary',
  )
  const response = await runtime.analyzeDpmProfile(resolvedRequest.runtimeInput)
  const report = response.body.result.analysisReport
  const driftKinds = report.driftSignals.map(signal => signal.kind)
  const customerPresenceDrift = required(
    report.driftSignals.find(signal =>
      signal.kind === 'metric_value_changed'
      && signal.metricId === 'metric:orders.created.value.customer.customer_no.presence'
    ),
    'expected customer_no presence metric drift signal',
  )

  assertEqual(response.statusCode, 200, 'profile baseline analysis status code')
  assertEqual(selectedBaseline.baselineRef, baseline.baselineRef, 'selected profile baseline ref')
  assertEqual(selectedBaseline.measurementId, baseline.measurementId, 'selected profile baseline measurement id')
  assertEqual(report.freshness.profileVersionHash, profileArtifact.freshness.versionHash, 'current profile version hash')
  assertEqual(
    report.freshness.previousProfileVersionHash,
    previousProfileArtifact.freshness.versionHash,
    'previous profile version hash',
  )
  assertGreaterThan(report.driftSignals.length, 0, 'profile drift signal count')
  assertContains(driftKinds, 'profile_hash_changed', 'profile drift kinds')
  assertContains(driftKinds, 'metric_value_changed', 'profile drift kinds')
  assertEqual(customerPresenceDrift.previousValue, 0.91, 'customer_no previous presence')
  assertEqual(customerPresenceDrift.currentValue, 0.997, 'customer_no current presence')
  assertNoUnsafeFragments(JSON.stringify(report))

  return {
    command: response.body.command,
    baselineHistoryCommand: baselineHistoryResponse.body.command,
    baselineRef: selectedBaseline.baselineRef,
    baselineMeasurementId: selectedBaseline.measurementId,
    baselineMeasuredAt: selectedBaseline.measuredAt,
    baselineMeasurementRunHash: selectedBaseline.measurementRunHash,
    selectedBaselineSummary: selectedBaseline,
    baselineHistory,
    baselineSelectionStrategy: 'latest_previous',
    baselineReportHash: selectedBaseline.reportHash,
    currentProfileVersionHash: report.freshness.profileVersionHash,
    previousProfileVersionHash: report.freshness.previousProfileVersionHash,
    driftSignalCount: report.driftSignals.length,
    driftKinds,
    customerPresence: {
      previousValue: customerPresenceDrift.previousValue,
      currentValue: customerPresenceDrift.currentValue,
    },
  }
})

const relationshipHint = required(
  analysisReport.relationshipHints[0],
  'expected at least one relationship hint',
)

await recordStep('review relationship hint proposal without registry mutation', async () => {
  const response = await runtime.reviewDpmProfileProposal({
    proposalId: relationshipHint.id,
    status: 'needs_changes',
    reviewedBy: 'dpm-reviewer@example.com',
    reason: 'Needs registry approval before execution.',
    relationshipHint,
  })

  assertEqual(response.statusCode, 200, 'proposal review status code')
  assertEqual(response.body.result.diagnostics.length, 0, 'proposal review diagnostics')
  assertEqual(response.body.result.relationshipHint?.id, relationshipHint.id, 'review relationship hint id')

  return {
    command: response.body.command,
    proposalId: response.body.result.proposalId,
    status: response.body.result.status,
    diagnostics: response.body.result.diagnostics.map(diagnostic => diagnostic.code),
  }
})

await recordStep('bridge relationship hint into candidate import review', async () => {
  const candidate = createDpmRelationshipCandidateInputFromProfileHint({
    profileArtifact,
    relationshipHint,
    relationshipName: 'rel_orders_customer',
    parent: {
      table: 'public.customers',
      columns: ['customer_no'],
    },
    child: {
      table: 'public.orders',
      columns: ['customer_no'],
    },
  })
  const response = await runtime.importDpmRelationshipCandidates({
    datasetId: profileArtifact.datasetId,
    candidates: [candidate],
  })
  const importedCandidate = required(
    response.body.result.report.candidates[0],
    'expected imported profile relationship candidate',
  )

  assertEqual(response.statusCode, 200, 'profile candidate import status code')
  assertEqual(response.body.result.imported, 1, 'profile candidate import count')
  assertEqual(response.body.result.rejected, 0, 'profile candidate rejected count')
  assertEqual(importedCandidate.relationshipName, 'rel_orders_customer', 'profile candidate relationship name')
  assertEqual(importedCandidate.executable, false, 'profile candidate executable flag')
  assertNoUnsafeFragments(JSON.stringify(response.body.result))

  return {
    command: response.body.command,
    candidateId: importedCandidate.id,
    relationshipName: importedCandidate.relationshipName,
    recommendation: importedCandidate.recommendation,
    executable: importedCandidate.executable,
  }
})

await recordStep('approve candidate and return registry write receipt', async () => {
  const response = await runtime.approveDpmProfileRelationshipHint({
    profileArtifact,
    relationshipHint,
    relationshipName: 'rel_orders_customer',
    childTableByPathPrefix: {
      'orders.created': 'public.orders',
    },
    registryVersion: 'registry-profile-demo-v1',
    version: '1',
    namespace: 'customer',
    transformStrategy: 'relationship_token',
    orphanPolicy: 'block',
    owner: 'privacy-platform',
    approvedBy: 'dpm-reviewer@example.com',
    reason: 'Kafka profile hint was mapped to a customer relationship for pseudonymized analytics.',
    approvedAt: '2026-07-07T00:10:00.000Z',
    auditEventId: 'audit:profile-demo:rel-orders-customer-approved',
    sourceFreshnessHash: analysisReport.freshness.reportHash,
    createdAt: '2026-07-07T00:10:00.000Z',
    updatedAt: '2026-07-07T00:10:00.000Z',
    exportedAt: '2026-07-07T00:11:00.000Z',
    registryRepository,
  })
  const receipt = response.body.result.relationshipWriteReceipt
  const registrySnapshot = response.body.result.registrySnapshot

  assertEqual(response.statusCode, 200, 'profile relationship hint approval workflow status code')
  assertEqual(receipt.relationshipName, 'rel_orders_customer', 'write receipt relationship name')
  assertEqual(receipt.status, 'approved', 'write receipt relationship status')
  assertEqual(receipt.relationshipIdentity, 'commerce_ai/rel_orders_customer@1', 'write receipt relationship identity')
  assertEqual(
    receipt.approvalAuditEventId,
    'audit:profile-demo:rel-orders-customer-approved',
    'write receipt approval audit event id',
  )
  assertEqual(registrySnapshot.approvedRelationships.length, 1, 'exported approved relationship count')
  assertEqual(registrySnapshot.approvedRelationships[0]?.name, 'rel_orders_customer', 'exported relationship name')
  assertEqual(registryAuditEvents.length, 1, 'approval audit event count')
  assertEqual(
    registryAuditEvents[0]?.eventId,
    'audit:profile-demo:rel-orders-customer-approved',
    'stored approval audit event id',
  )
  assertNoUnsafeFragments(JSON.stringify(registrySnapshot))

  return {
    workflowCommand: response.body.command,
    imported: response.body.result.candidateImport.imported,
    rejected: response.body.result.candidateImport.rejected,
    relationshipName: receipt.relationshipName,
    registryVersion: receipt.registryVersion,
    relationshipIdentity: receipt.relationshipIdentity,
    approvalAuditEventId: receipt.approvalAuditEventId,
    sourceFreshnessHash: receipt.sourceFreshnessHash,
    auditEventCount: registryAuditEvents.length,
    approvedRelationships: registrySnapshot.approvedRelationships.map(relationship => relationship.name),
    nonExecutableRelationships: registrySnapshot.nonExecutableRelationships.length,
  }
})

await recordStep('reject mismatched proposal review target', async () => {
  const response = await runtime.reviewDpmProfileProposal({
    proposalId: 'proposal:wrong-target',
    status: 'accepted',
    reviewedBy: 'dpm-reviewer@example.com',
    reason: 'Intentional mismatch guard.',
    relationshipHint,
  })

  assertEqual(response.statusCode, 400, 'mismatched proposal review status code')
  assertContains(
    response.body.result.diagnostics.map(diagnostic => diagnostic.code),
    'PROF201',
    'mismatch diagnostic codes',
  )

  return {
    command: response.body.command,
    diagnostics: response.body.result.diagnostics.map(diagnostic => diagnostic.code),
  }
})

await recordStep('preserve inspection snapshot after caller mutation', async () => {
  const probeResult = profileKafkaTopicBundle(fixture)
  const probeProfile = required(probeResult.profileArtifact, 'expected probe profile artifact')
  const response = await runtime.inspectDpmProfile({ profileArtifact: probeProfile })
  const firstNodeLabel = response.body.result.profileArtifact.nodes[0]?.label
  const evidenceId = Object.keys(probeProfile.evidenceSources)[0]
  const evidencePath = response.body.result.profileArtifact.evidenceSources[evidenceId]?.coordinate.path

  probeProfile.nodes[0].label = 'mutated after inspection'
  probeProfile.evidenceSources[evidenceId].coordinate.path = 'mutated.after.inspection'

  assertEqual(response.body.result.profileArtifact.nodes[0]?.label, firstNodeLabel, 'snapshot node label')
  assertEqual(
    response.body.result.profileArtifact.evidenceSources[evidenceId]?.coordinate.path,
    evidencePath,
    'snapshot evidence path',
  )

  return {
    nodeLabel: response.body.result.profileArtifact.nodes[0]?.label,
    evidencePath,
  }
})

console.log(JSON.stringify({
  demo: 'dpm.profile-kafka',
  description: 'Captured Kafka topic bundle profiling, analysis, and editor review without live Kafka access.',
  steps,
}, null, 2))

async function recordStep(name, run) {
  const summary = await run()
  steps.push({
    name,
    status: 'pass',
    summary,
  })
  return summary
}

function required(value, message) {
  if (!value) throw new Error(message)
  return value
}

function createFixtureWithCustomerNoPresence(input, presenceRatio) {
  return {
    ...input,
    topic: {
      ...input.topic,
      value: {
        ...input.topic.value,
        fields: input.topic.value.fields.map(field =>
          field.name === 'customer'
            ? {
                ...field,
                fields: field.fields?.map(child =>
                  child.name === 'customer_no'
                    ? { ...child, presenceRatio }
                    : child
                ),
              }
            : field
        ),
      },
    },
  }
}

function profileKafkaTopicBundle(input) {
  return profileKafkaTopic({
    ...input,
    connectorId: DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID,
    connectorVersion: DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_VERSION,
    captureMode: 'snapshot',
  })
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
  }
}

function assertGreaterThan(actual, threshold, label) {
  if (!(actual > threshold)) {
    throw new Error(`${label}: expected > ${threshold}, received ${actual}`)
  }
}

function assertContains(values, expected, label) {
  if (!values.includes(expected)) {
    throw new Error(`${label}: expected ${expected} in ${JSON.stringify(values)}`)
  }
}

function assertNoUnsafeFragments(serialized) {
  for (const unsafe of unsafeFragments) {
    if (serialized.includes(unsafe)) {
      throw new Error(`unsafe fragment leaked into profile demo output: ${unsafe}`)
    }
  }
}
