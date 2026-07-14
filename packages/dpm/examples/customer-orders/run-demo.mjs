#!/usr/bin/env node
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runDpmCli } from '../../dist/cli/index.js'

const demoDir = dirname(fileURLToPath(import.meta.url))
const manifestPath = join(demoDir, 'manifest.json')
const catalogPath = join(demoDir, 'catalog.snapshot.json')
const registryPath = join(demoDir, 'relationship-registry.yaml')
const estimatedRowsPath = join(demoDir, 'estimated-rows.json')

const tempDir = mkdtempSync(join(tmpdir(), 'oa-dpm-customer-orders-demo-'))

const steps = []

await recordStep('validate clean manifest', async () => {
  const result = await runCommand('validate', manifestPath)
  assertExit(result, 0)
  assertEqual(result.output.result.summary.errors, 0, 'validate errors')
  assertEqual(result.output.result.summary.warnings, 0, 'validate warnings')
  return {
    errors: result.output.result.summary.errors,
    warnings: result.output.result.summary.warnings,
  }
})

await recordStep('compile approved relationship plan', async () => {
  const result = await runCommand('compile', manifestPath)
  assertExit(result, 0)
  const plan = result.output.result.plan
  assertEqual(result.output.result.ok, true, 'compile ok')
  assertEqual(plan.stale, false, 'plan stale')
  return {
    planIdentity: plan.identity,
    namespaceBindings: plan.namespaceBindings.map(binding => binding.namespace),
    relationshipSteps: plan.relationshipSteps.map(step => step.name),
  }
})

await recordStep('dry-run impact without raw values', async () => {
  const result = await runCommand('dry-run', manifestPath, ['--estimated-rows', estimatedRowsPath])
  assertExit(result, 0)
  const report = result.output.result
  assertEqual(report.rawValuesIncluded, false, 'raw values included')
  assertEqual(report.impact.estimatedRows, 7000, 'estimated rows')
  return {
    impact: report.impact,
    rawValuesIncluded: report.rawValuesIncluded,
  }
})

await recordStep('schema gate rejects malformed manifest', async () => {
  const malformedPath = writeJson('malformed-manifest.json', {
    scope: {
      include_tables: ['public.customers'],
    },
    relationships: [],
    columns: [],
    quality_gates: [
      {
        name: 'relationship_drift',
      },
    ],
  })
  const result = await runCommand('validate', malformedPath)
  assertExit(result, 1)
  assertContains(diagnosticCodes(result), 'SYN001', 'diagnostic codes')
  return {
    diagnostics: diagnosticCodes(result),
  }
})

await recordStep('registry snapshot guard rejects relationship spoofing', async () => {
  const manifest = readManifest()
  manifest.relationships[0].namespace = 'account'
  const spoofPath = writeJson('spoofed-relationship.json', manifest)
  const result = await runCommand('compile', spoofPath)
  assertExit(result, 1)
  assertContains(diagnosticCodes(result), 'REL013', 'diagnostic codes')
  return {
    diagnostics: diagnosticCodes(result),
  }
})

await recordStep('column relationship guard rejects missing relationship references', async () => {
  const manifest = readManifest()
  manifest.columns[1].relationship = 'rel_missing_customer'
  manifest.columns[1].transform.relationship = 'rel_missing_customer'
  const missingPath = writeJson('missing-column-relationship.json', manifest)
  const result = await runCommand('compile', missingPath)
  assertExit(result, 1)
  assertContains(diagnosticCodes(result), 'SAF012', 'diagnostic codes')
  return {
    diagnostics: diagnosticCodes(result),
  }
})

console.log(JSON.stringify({
  demo: 'dpm.customer-orders',
  description: 'Relationship-first DPM validate -> compile -> dry-run without source DB access.',
  steps,
}, null, 2))

async function recordStep(name, run) {
  const summary = await run()
  steps.push({
    name,
    status: 'pass',
    summary,
  })
}

async function runCommand(command, manifest, extraArgs = []) {
  const result = await runDpmCli([
    command,
    '--manifest',
    manifest,
    '--catalog',
    catalogPath,
    '--registry',
    registryPath,
    ...extraArgs,
  ])
  return {
    ...result,
    output: result.stdout ? JSON.parse(result.stdout) : undefined,
  }
}

function diagnosticCodes(result) {
  const payload = result.output?.result
  const diagnostics = payload?.diagnostics ?? payload?.validation?.diagnostics ?? []
  return diagnostics.map(diagnostic => diagnostic.code)
}

function readManifest() {
  return JSON.parse(readFileSync(manifestPath, 'utf8'))
}

function writeJson(name, value) {
  const path = join(tempDir, name)
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
  return path
}

function assertExit(result, expected) {
  assertEqual(result.exitCode, expected, `${result.output?.command ?? 'command'} exit code`)
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
  }
}

function assertContains(values, expected, label) {
  if (!values.includes(expected)) {
    throw new Error(`${label}: expected ${expected} in ${JSON.stringify(values)}`)
  }
}
