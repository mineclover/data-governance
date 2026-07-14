import { spawnSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

import {
  profileDemoCommandTimeoutMs,
  profileDemoPackageRoot,
} from './support/profile-demo-path-fixtures.js'

describe('DPM Kafka profile demo command', () => {
  it('runs the documented Kafka profile demo command', () => {
    const result = spawnSync('corepack', ['pnpm', 'run', 'demo:profile'], {
      cwd: profileDemoPackageRoot,
      encoding: 'utf8',
      timeout: profileDemoCommandTimeoutMs,
    })
    const marker = '{\n  "demo": "dpm.profile-kafka"'
    const outputStart = result.stdout.indexOf(marker)
    const output = outputStart >= 0 ? JSON.parse(result.stdout.slice(outputStart)) : undefined

    expect(result.status, result.stderr || result.stdout).toBe(0)
    expect(output?.steps.every((step: Record<string, unknown>) => step.status === 'pass')).toBe(true)
    expect(
      output?.steps.find((step: { name: string }) =>
        step.name === 'create read-only SDK profile artifact snapshot'
      )?.summary?.frozen,
    ).toBe(true)
    const baselineStep = output?.steps.find((step: { name: string }) =>
      step.name === 'compare profile artifact with previous measurement baseline'
    )
    expect(baselineStep?.summary?.baselineRef).toContain('dpm-profile-baseline:')
    expect(baselineStep?.summary?.baselineMeasurementId).toEqual(expect.stringMatching(/^sha256:/))
    expect(baselineStep?.summary?.baselineMeasuredAt).toBe('2026-07-07T00:00:00.000Z')
    expect(baselineStep?.summary?.baselineMeasurementRunHash).toEqual(expect.stringMatching(/^sha256:/))
    expect(baselineStep?.summary?.baselineHistoryCommand).toBe('list-profile-baseline-summaries')
    expect(baselineStep?.summary?.baselineHistory).toEqual([
      expect.objectContaining({
        baselineRef: baselineStep?.summary?.baselineRef,
        measurementId: baselineStep?.summary?.baselineMeasurementId,
        hasAnalysisReport: true,
        profileSummary: expect.objectContaining({
          nodeCount: expect.any(Number),
          metricCount: expect.any(Number),
        }),
      }),
    ])
    expect(baselineStep?.summary?.selectedBaselineSummary).toEqual(expect.objectContaining({
      baselineRef: baselineStep?.summary?.baselineRef,
      measurementId: baselineStep?.summary?.baselineMeasurementId,
      hasAnalysisReport: true,
    }))
    expect(baselineStep?.summary?.baselineSelectionStrategy).toBe('latest_previous')
    expect(baselineStep?.summary?.baselineReportHash).toEqual(expect.any(String))
    expect(baselineStep?.summary?.driftSignalCount).toBeGreaterThan(0)
    expect(baselineStep?.summary?.driftKinds).toEqual(expect.arrayContaining([
      'profile_hash_changed',
      'metric_value_changed',
    ]))
    expect(baselineStep?.summary?.customerPresence).toMatchObject({
      previousValue: 0.91,
      currentValue: 0.997,
    })
    const bridgeStep = output?.steps.find((step: { name: string }) =>
      step.name === 'bridge relationship hint into candidate import review'
    )
    expect(bridgeStep?.summary).toMatchObject({
      command: 'import-relationship-candidates',
      relationshipName: 'rel_orders_customer',
      recommendation: 'review',
      executable: false,
    })
    const approvalStep = output?.steps.find((step: { name: string }) =>
      step.name === 'approve candidate and return registry write receipt'
    )
    expect(approvalStep?.summary).toMatchObject({
      workflowCommand: 'approve-profile-relationship-hint',
      imported: 1,
      rejected: 0,
      relationshipName: 'rel_orders_customer',
      registryVersion: 'registry-profile-demo-v1',
      relationshipIdentity: 'commerce_ai/rel_orders_customer@1',
      approvalAuditEventId: 'audit:profile-demo:rel-orders-customer-approved',
      sourceFreshnessHash: expect.stringMatching(/^sha256:/),
      auditEventCount: 1,
      approvedRelationships: ['rel_orders_customer'],
      nonExecutableRelationships: 0,
    })
    expect(output?.steps.map((step: { name: string }) => step.name)).toEqual([
      'flatten captured Kafka topic bundle into profile artifact',
      'create read-only SDK profile artifact snapshot',
      'inspect profile artifact for editor runtime',
      'analyze profile artifact into review signals',
      'compare profile artifact with previous measurement baseline',
      'review relationship hint proposal without registry mutation',
      'bridge relationship hint into candidate import review',
      'approve candidate and return registry write receipt',
      'reject mismatched proposal review target',
      'preserve inspection snapshot after caller mutation',
    ])
  }, profileDemoCommandTimeoutMs + 5_000)
})
