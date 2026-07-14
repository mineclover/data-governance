import { describe, expect, it } from 'vitest'

import {
  compileDpmPlan,
  createPlanFreshness,
  validateDpmManifest,
} from '../src/index.js'
import {
  createCanonicalKeyEncodingMigrationInput,
  createIdentityMismatchedRegistryCompileInput,
  createPreV2FieldDeletedRegistryCompileInput,
  LEGACY_STRING_V1_PLAN_IDENTITY,
  PRE_V2_LITERAL_PLAN_GOLDEN,
} from './support/canonical-key-encoding-migration-fixtures.js'

describe('DPM canonical key encoding migration contract', () => {
  it('keeps legacy string-v1 defaults and rollback plans unchanged', () => {
    const legacyInput = createPreV2FieldDeletedRegistryCompileInput()
    const legacyValidation = validateDpmManifest(legacyInput)
    const legacy = compileDpmPlan(legacyInput)
    const typedCutover = compileDpmPlan(createCanonicalKeyEncodingMigrationInput({
      manifestEncodingVersion: 'typed-v2',
      registryEncodingVersion: 'typed-v2',
    }))
    const rollback = compileDpmPlan(createPreV2FieldDeletedRegistryCompileInput())

    expect(legacyValidation.valid).toBe(true)
    expect(legacy.ok).toBe(true)
    expect(typedCutover.ok).toBe(true)
    expect(rollback.ok).toBe(true)
    if (!legacy.ok || !rollback.ok) throw new Error('expected legacy compile success')
    expect(legacy.plan.identity).toBe(LEGACY_STRING_V1_PLAN_IDENTITY)
    expect(legacy.plan.canonicalKeyEncodingVersion).toBe('string-v1')
    expect(legacy.plan.freshness.canonicalKeyEncodingVersion).toBe('string-v1')
    expect(toPreV2PlanShape(legacy.plan)).toEqual(PRE_V2_LITERAL_PLAN_GOLDEN)
    expect(toPreV2PlanShape(rollback.plan)).toEqual(PRE_V2_LITERAL_PLAN_GOLDEN)
  })

  it('normalizes legacy snapshots at the public freshness helper boundary', () => {
    const legacyInput = createPreV2FieldDeletedRegistryCompileInput()
    const freshness = createPlanFreshness({
      catalog: legacyInput.catalog,
      registry: legacyInput.registry,
    })

    expect(freshness.canonicalKeyEncodingVersion).toBe('string-v1')
    expect(freshness.registryIdentity).toBe('commerce_ai@reg-2026-07-01')
  })

  it('carries an explicit typed-v2 registry contract into a distinct plan identity and freshness record', () => {
    const result = compileDpmPlan(createCanonicalKeyEncodingMigrationInput({
      manifestEncodingVersion: 'typed-v2',
      registryEncodingVersion: 'typed-v2',
    }))

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('expected typed-v2 compile success')
    expect(result.plan.identity).toBe(
      'dpm.compiled-plan.typed-v2'
      + '|m|22:commerce_ai@2026.07.01|r|14:reg-2026-07-01',
    )
    expect(result.plan.canonicalKeyEncodingVersion).toBe('typed-v2')
    expect(result.plan.freshness.canonicalKeyEncodingVersion).toBe('typed-v2')
    expect(result.plan.freshness.registryIdentity).toBe(
      'dpm.relationship.registry-snapshot.typed-v2'
      + '|d|11:commerce_ai|r|14:reg-2026-07-01',
    )
  })

  it('keeps typed-v2 plan and registry identities outside legacy suffix grammars', () => {
    const typed = compileDpmPlan(createCanonicalKeyEncodingMigrationInput({
      manifestEncodingVersion: 'typed-v2',
      registryEncodingVersion: 'typed-v2',
    }))
    const legacySuffixCandidate = compileDpmPlan(createCanonicalKeyEncodingMigrationInput({
      registryVersion: 'reg-2026-07-01:typed-v2',
    }))
    const v1Registry = createCanonicalKeyEncodingMigrationInput().registry
    const v2Registry = createCanonicalKeyEncodingMigrationInput({
      manifestEncodingVersion: 'typed-v2',
      registryEncodingVersion: 'typed-v2',
    }).registry

    expect(typed.ok).toBe(true)
    expect(legacySuffixCandidate.ok).toBe(true)
    if (!typed.ok || !legacySuffixCandidate.ok) throw new Error('expected identity compile success')
    expect(typed.plan.identity).not.toBe(legacySuffixCandidate.plan.identity)
    expect(v1Registry.identity).toBe('commerce_ai@reg-2026-07-01')
    expect(v2Registry.identity).not.toBe(v1Registry.identity)
  })

  it('blocks custom snapshots whose identity does not match their resolved encoding version', () => {
    const mismatched = createIdentityMismatchedRegistryCompileInput()

    expect(() => validateDpmManifest(mismatched)).toThrow(
      'does not match canonical key encoding typed-v2',
    )
    expect(() => compileDpmPlan(mismatched)).toThrow(
      'expected dpm.relationship.registry-snapshot.typed-v2',
    )
    expect(() => createPlanFreshness({
      catalog: mismatched.catalog,
      registry: mismatched.registry,
    })).toThrow('does not match canonical key encoding typed-v2')
  })

  it.each([
    {
      label: 'typed-v2 manifest with a string-v1 registry',
      manifestEncodingVersion: 'typed-v2' as const,
      registryEncodingVersion: 'string-v1' as const,
    },
    {
      label: 'implicit string-v1 manifest with a typed-v2 registry',
      manifestEncodingVersion: undefined,
      registryEncodingVersion: 'typed-v2' as const,
    },
  ])('blocks $label before plan generation', ({ manifestEncodingVersion, registryEncodingVersion }) => {
    const result = compileDpmPlan(createCanonicalKeyEncodingMigrationInput({
      ...(manifestEncodingVersion ? { manifestEncodingVersion } : {}),
      registryEncodingVersion,
    }))

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('expected canonical key encoding mismatch failure')
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      severity: 'error',
      code: 'REL011',
      sourcePointer: '/relationship_registry/canonical_key_encoding_version',
    }))
    expect('plan' in result).toBe(false)
  })
})

function toPreV2PlanShape(
  plan: Extract<ReturnType<typeof compileDpmPlan>, { ok: true }>['plan'],
) {
  const {
    canonicalKeyEncodingVersion: _planEncodingVersion,
    freshness,
    ...preV2Plan
  } = plan
  const {
    canonicalKeyEncodingVersion: _freshnessEncodingVersion,
    ...preV2Freshness
  } = freshness

  return {
    ...preV2Plan,
    freshness: preV2Freshness,
  }
}
