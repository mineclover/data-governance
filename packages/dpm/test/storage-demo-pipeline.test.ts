import { describe, expect, it, vi } from 'vitest'

import {
  DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS,
  POSTGRES_CATALOG_PROFILE_SQL,
  applyDpmRegistryStorageSchema,
  compileDpmPlan,
  createDpmDryRunReport,
  profilePostgresCatalog,
  validateDpmManifest,
} from '../src/index.js'
import {
  storageDemoCapturedAt,
  storageDemoCompletedAt,
  storageDemoDatabase,
  storageDemoJobId,
  storageDemoSchemas,
  storageDemoUnsafeCustomerNoSample,
  storageDemoValidationReportRef,
} from './support/storage-demo-constant-fixtures.js'
import {
  createExpectedStorageDemoJobReport,
  expectedStorageDemoDryRunImpact,
  expectedStorageDemoValidationSummary,
} from './support/storage-demo-expected-fixtures.js'
import { readStorageDemoPipelineFixtures } from './support/storage-demo-io-fixtures.js'
import {
  createStorageDemoFixtureCatalog,
} from './support/storage-demo-catalog-fixtures.js'
import {
  createStorageDemoPersistenceRepositories,
} from './support/storage-demo-memory-repository-fixtures.js'
import {
  createStorageDemoPostgresRegistryRepository,
} from './support/storage-demo-postgres-registry-fixtures.js'
import {
  expectedStorageRegistryApprovedRelationshipNames,
} from './support/storage-registry-projection-fixtures.js'
import { expectStorageReportPayloadExcludesUnsafeFragments } from './support/storage-report-fixtures.js'

describe('DPM storage-backed customer orders demo pipeline', () => {
  it('profiles catalog rows, exports registry rows, runs validate/compile/dry-run, and retrieves reports without raw values', async () => {
    const {
      manifest,
      catalogRows,
      registryRows,
      registryAuditEvents,
      estimatedRows,
    } = readStorageDemoPipelineFixtures()
    const catalogQuery = vi.fn(async () => catalogRows)
    const { jobRows, reportRows, jobRepository, reportRepository } =
      createStorageDemoPersistenceRepositories()

    const catalog = await profilePostgresCatalog({
      database: storageDemoDatabase,
      capturedAt: storageDemoCapturedAt,
      schemas: [...storageDemoSchemas],
      client: { query: catalogQuery },
    })
    const fixtureCatalog = createStorageDemoFixtureCatalog(catalogRows)
    manifest.catalog.version_hash = catalog.freshness.versionHash

    const {
      client: registryPostgresClient,
      repository: registryRepository,
    } = createStorageDemoPostgresRegistryRepository(registryRows, registryAuditEvents)
    const schemaApply = await applyDpmRegistryStorageSchema(registryPostgresClient)
    const registry = await registryRepository.exportSnapshot({
      datasetId: manifest.relationship_registry.dataset_id,
      registryVersion: manifest.relationship_registry.registry_version,
      exportedAt: storageDemoCapturedAt,
    })
    const auditEvents = await registryRepository.listRelationshipAuditEvents?.({
      datasetId: manifest.relationship_registry.dataset_id,
      registryVersion: manifest.relationship_registry.registry_version,
    })

    const validation = validateDpmManifest({ manifest, catalog, registry })
    const compiled = compileDpmPlan({ manifest, catalog, registry })
    if (!compiled.ok) throw new Error('expected storage demo compile success')
    const dryRun = createDpmDryRunReport({
      plan: compiled.plan,
      estimatedRows,
      sampleValues: {
        customer_no: storageDemoUnsafeCustomerNoSample,
      },
    })
    const job = await jobRepository.saveJob({
      jobId: storageDemoJobId,
      operation: 'dry_run',
      status: 'completed',
      datasetId: compiled.plan.datasetId,
      manifestId: compiled.plan.manifestId,
      planIdentity: compiled.plan.identity,
      freshness: compiled.plan.freshness,
      diagnostics: validation.diagnostics,
      validationReportRef: storageDemoValidationReportRef,
      createdAt: storageDemoCapturedAt,
      completedAt: storageDemoCompletedAt,
    })
    const report = await reportRepository.saveReport({
      jobId: job.jobId,
      status: 'completed',
      validationReportRef: job.validationReportRef,
      diagnostics: validation.diagnostics,
      planIdentity: compiled.plan.identity,
      freshness: compiled.plan.freshness,
      impact: dryRun.impact,
      categories: dryRun.categories,
      createdAt: storageDemoCompletedAt,
      rawSamples: {
        customer_no: storageDemoUnsafeCustomerNoSample,
      },
    } as any)
    const jobReport = await reportRepository.getJobReport({ jobId: job.jobId })

    expect(catalogQuery).toHaveBeenCalledWith(POSTGRES_CATALOG_PROFILE_SQL, [[...storageDemoSchemas]])
    expect(catalog).toEqual(fixtureCatalog)
    expect(schemaApply.appliedBlockCount).toBe(DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS.length)
    expect(registryPostgresClient.queryCalls.slice(0, DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS.length))
      .toEqual(DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS.map(sql => ({
        sql,
        params: [],
      })))
    const firstRegistryQueryIndex = DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS.length
    expect(registryPostgresClient.queryCalls[firstRegistryQueryIndex]?.sql)
      .toContain('from dpm.relationship_registry')
    expect(registryPostgresClient.queryCalls[firstRegistryQueryIndex + 1]?.sql)
      .toContain('from dpm.relationship_registry_contracts')
    expect(registryPostgresClient.queryCalls[firstRegistryQueryIndex + 2]?.sql)
      .toContain('from dpm.relationship_registry_audit_events')
    expect(auditEvents?.map(event => event.eventId)).toEqual([
      'audit:storage-demo:rel-orders-customer-approved',
    ])
    expect(validation.summary).toEqual(expectedStorageDemoValidationSummary)
    expect(registry.approvedRelationships.map(relationship => relationship.name)).toEqual([
      ...expectedStorageRegistryApprovedRelationshipNames,
    ])
    expect(compiled.plan.stale).toBe(false)
    expect(dryRun.impact).toEqual(expectedStorageDemoDryRunImpact)
    expect(jobRows.get(job.jobId)?.planIdentity).toBe(compiled.plan.identity)
    expect(reportRows.get(job.jobId)?.impact).toEqual(dryRun.impact)
    expect(jobReport).toEqual(createExpectedStorageDemoJobReport(report.diagnostics))
    expectStorageReportPayloadExcludesUnsafeFragments({ job, report, jobReport })
  })
})
