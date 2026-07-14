#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  POSTGRES_CATALOG_PROFILE_SQL,
  applyDpmRegistryStorageSchema,
  compileDpmPlan,
  createDpmDryRunReport,
  createDpmJobRepository,
  createDpmPostgresRegistryStorage,
  createDpmReportRepository,
  createDpmRegistryRepository,
  profilePostgresCatalog,
  validateDpmManifest,
} from '../../dist/index.js'

const demoDir = dirname(fileURLToPath(import.meta.url))

const manifest = readJson('manifest.json')
const catalogRows = readJson('catalog-profile-rows.json')
const registryRows = readJson('relationship-registry-rows.json')
const registryAuditEvents = readJson('relationship-registry-audit-events.json')
const estimatedRows = readJson('estimated-rows.json')
const jobRows = new Map()
const reportRows = new Map()
const steps = []

const catalog = await recordStep('profile catalog rows through explicit query client', async () => {
  const queryCalls = []
  const catalog = await profilePostgresCatalog({
    database: 'commerce',
    capturedAt: '2026-07-01T00:00:00.000Z',
    schemas: ['public'],
    client: {
      async query(sql, params) {
        queryCalls.push({ sql, params })
        return catalogRows
      },
    },
  })
  assertEqual(queryCalls[0]?.sql, POSTGRES_CATALOG_PROFILE_SQL, 'profile SQL')
  assertEqual(JSON.stringify(queryCalls[0]?.params), JSON.stringify([['public']]), 'profile params')
  manifest.catalog.version_hash = catalog.freshness.versionHash
  return {
    value: catalog,
    summary: {
      tables: catalog.tables.map(table => table.table),
      catalogVersionHash: catalog.freshness.versionHash,
      sourceDbMutation: 'none',
    },
  }
})

const registry = await recordStep('bootstrap schema and export approved registry snapshot from Postgres registry adapter', async () => {
  const postgresRegistryClient = createFixturePostgresRegistryClient({
    relationshipRows: registryRows,
    auditEvents: registryAuditEvents,
  })
  const schemaApply = await applyDpmRegistryStorageSchema(postgresRegistryClient)
  const repository = createDpmRegistryRepository(
    createDpmPostgresRegistryStorage(postgresRegistryClient),
  )
  const snapshot = await repository.exportSnapshot({
    datasetId: manifest.relationship_registry.dataset_id,
    registryVersion: manifest.relationship_registry.registry_version,
    exportedAt: '2026-07-01T00:00:00.000Z',
  })
  const auditEvents = await repository.listRelationshipAuditEvents?.({
    datasetId: manifest.relationship_registry.dataset_id,
    registryVersion: manifest.relationship_registry.registry_version,
  })
  return {
    value: snapshot,
    summary: {
      schemaVersion: schemaApply.schemaVersion,
      appliedSchemaBlocks: schemaApply.appliedBlockCount,
      storageAdapter: 'postgres-registry',
      approvedRelationships: snapshot.approvedRelationships.map(relationship => relationship.name),
      nonExecutable: snapshot.nonExecutableRelationships.length,
      approvalAuditEvents: auditEvents?.map(event => event.eventId) ?? [],
      postgresQueries: postgresRegistryClient.queryCalls
        .filter(call => call.table !== 'dpm.registry_storage_schema')
        .map(call => call.table),
    },
  }
})

const validation = await recordStep('validate storage-backed manifest', async () => {
  const result = validateDpmManifest({ manifest, catalog, registry })
  assertEqual(result.summary.errors, 0, 'validate errors')
  return {
    value: result,
    summary: {
      errors: result.summary.errors,
      warnings: result.summary.warnings,
    },
  }
})

const compiled = await recordStep('compile storage-backed plan', async () => {
  const result = compileDpmPlan({ manifest, catalog, registry })
  assertEqual(result.ok, true, 'compile ok')
  assertEqual(result.plan.stale, false, 'plan stale')
  return {
    value: result,
    summary: {
      planIdentity: result.plan.identity,
      freshness: result.plan.freshness,
    },
  }
})

const dryRun = await recordStep('persist dry-run impact and retrieve gateway report', async () => {
  const report = createDpmDryRunReport({
    plan: compiled.plan,
    estimatedRows,
    sampleValues: {
      customer_no: 'C-001',
    },
  })
  const jobRepository = createDpmJobRepository({
    upsertJob(row) {
      jobRows.set(row.jobId, row)
    },
    getJob(request) {
      return jobRows.get(request.jobId)
    },
  })
  const reportRepository = createDpmReportRepository({
    upsertReport(row) {
      reportRows.set(row.jobId, row)
    },
    getValidationReport(request) {
      return reportRows.get(request.jobId)
    },
  })
  const job = await jobRepository.saveJob({
    jobId: 'job_storage_demo_001',
    operation: 'dry_run',
    status: 'completed',
    datasetId: compiled.plan.datasetId,
    manifestId: compiled.plan.manifestId,
    planIdentity: compiled.plan.identity,
    freshness: compiled.plan.freshness,
    diagnostics: validation.diagnostics,
    validationReportRef: 'dpm-report:job_storage_demo_001',
    createdAt: '2026-07-01T00:00:00.000Z',
    completedAt: '2026-07-01T00:00:01.000Z',
  })
  const stored = await reportRepository.saveReport({
    jobId: job.jobId,
    status: 'completed',
    validationReportRef: job.validationReportRef,
    diagnostics: validation.diagnostics,
    planIdentity: compiled.plan.identity,
    freshness: compiled.plan.freshness,
    impact: report.impact,
    categories: report.categories,
    createdAt: '2026-07-01T00:00:01.000Z',
    rawSamples: {
      customer_no: 'C-001',
    },
  })
  const jobReport = await reportRepository.getJobReport({ jobId: job.jobId })
  return {
    value: { report, stored, jobReport },
    summary: {
      impact: report.impact,
      rawValuesIncluded: report.rawValuesIncluded,
      storedImpact: stored.impact,
      jobReport,
    },
  }
})

const output = {
  demo: 'dpm.customer-orders-storage',
  description: 'Fixture-backed DPM storage integration without source DB mutation.',
  sourceDbMutation: 'none',
  persistedRawValues: false,
  steps,
  report: dryRun.jobReport,
}
assertNoUnsafePayload(output)
console.log(`${JSON.stringify(output, null, 2)}\n`)

async function recordStep(name, run) {
  const result = await run()
  const summary = result && typeof result === 'object' && 'summary' in result ? result.summary : result
  steps.push({
    name,
    status: 'pass',
    summary,
  })
  return result && typeof result === 'object' && 'value' in result ? result.value : result
}

function readJson(name) {
  return JSON.parse(readFileSync(join(demoDir, name), 'utf8'))
}

function createFixturePostgresRegistryClient({ relationshipRows, auditEvents }) {
  const relationshipDbRows = relationshipRows.map(toPostgresRelationshipDbRow)
  const registryContractDbRows = toPostgresRegistryContractDbRows(relationshipRows)
  const auditEventDbRows = auditEvents.map(toPostgresAuditEventDbRow)
  const queryCalls = []
  const client = {
    queryCalls,
    async query(sql, params) {
      if (isRegistrySchemaSql(sql)) {
        queryCalls.push({ table: 'dpm.registry_storage_schema', sql, params })
        return { rows: [] }
      }
      if (sql.includes('from dpm.relationship_registry_audit_events')) {
        queryCalls.push({ table: 'dpm.relationship_registry_audit_events', sql, params })
        const [datasetId, registryVersion, relationshipName] = params
        return {
          rows: auditEventDbRows.filter(row =>
            row.dataset_id === datasetId
            && row.registry_version === registryVersion
            && (relationshipName === null || row.relationship_name === relationshipName),
          ),
        }
      }
      if (sql.includes('from dpm.relationship_registry_contracts')) {
        queryCalls.push({ table: 'dpm.relationship_registry_contracts', sql, params })
        const [datasetId, registryVersion] = params
        return {
          rows: registryContractDbRows.filter(row =>
            row.dataset_id === datasetId && row.registry_version === registryVersion,
          ),
        }
      }
      if (sql.includes('from dpm.relationship_registry')) {
        queryCalls.push({ table: 'dpm.relationship_registry', sql, params })
        const [datasetId, registryVersion] = params
        return {
          rows: relationshipDbRows.filter(row =>
            row.dataset_id === datasetId && row.registry_version === registryVersion,
          ),
        }
      }

      throw new Error('unexpected storage demo Postgres registry query')
    },
    async transaction(operation) {
      return operation(client)
    },
  }

  return client
}

function toPostgresRegistryContractDbRows(rows) {
  const contracts = new Map()
  for (const row of rows) {
    const key = `${row.datasetId}\u0000${row.registryVersion}`
    contracts.set(key, {
      dataset_id: row.datasetId,
      registry_version: row.registryVersion,
      canonical_key_encoding_version: row.canonicalKeyEncodingVersion ?? 'string-v1',
    })
  }
  return [...contracts.values()]
}

function isRegistrySchemaSql(sql) {
  const normalized = sql.trim().toLowerCase()
  return normalized.startsWith('create schema')
    || normalized.startsWith('create table')
    || normalized.startsWith('create unique index')
    || normalized.startsWith('create index')
    || normalized.startsWith('alter table')
}

function toPostgresRelationshipDbRow(row) {
  return {
    dataset_id: row.datasetId,
    registry_version: row.registryVersion,
    canonical_key_encoding_version: row.canonicalKeyEncodingVersion ?? null,
    relationship_name: row.relationshipName,
    relationship_version: row.relationshipVersion,
    status: row.status,
    relationship_type: row.relationshipType,
    parent_table: row.parentTable,
    parent_columns: row.parentColumns,
    child_table: row.childTable,
    child_columns: row.childColumns,
    namespace: row.namespace,
    transform_strategy: row.transformStrategy,
    orphan_policy: row.orphanPolicy,
    context_columns: row.contextColumns,
    condition_sql: row.conditionSql ?? null,
    temporal_condition: row.temporalCondition ?? null,
    confidence_score: row.confidenceScore ?? null,
    evidence: row.evidence,
    approval: row.approval,
    supersedes: row.supersedes ?? null,
    superseded_by: row.supersededBy ?? null,
    source: row.source ?? null,
    source_freshness_hash: row.sourceFreshnessHash ?? null,
    created_at: row.createdAt ?? null,
    updated_at: row.updatedAt ?? null,
  }
}

function toPostgresAuditEventDbRow(row) {
  return {
    event_id: row.eventId,
    event_type: row.eventType,
    dataset_id: row.datasetId,
    registry_version: row.registryVersion,
    relationship_name: row.relationshipName,
    relationship_version: row.relationshipVersion,
    relationship_status: row.relationshipStatus,
    actor: row.actor,
    reason: row.reason,
    source_freshness_hash: row.sourceFreshnessHash ?? null,
    approval: row.approval,
    source: row.source ?? null,
    occurred_at: row.occurredAt,
    created_at: row.createdAt ?? null,
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
  }
}

function assertNoUnsafePayload(value) {
  const serialized = JSON.stringify(value)
  for (const unsafe of ['C-001', 'source-secret', 'vault-secret', 'tokenReverseLookup']) {
    if (serialized.includes(unsafe)) {
      throw new Error(`unsafe payload leaked into storage demo output: ${unsafe}`)
    }
  }
}
