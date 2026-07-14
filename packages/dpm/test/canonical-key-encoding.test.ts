import { describe, expect, it } from 'vitest'

import {
  assertDpmCanonicalKeyEncodingVersionMatchesPlan,
  createEntityDeclaration,
  createLogicalRelationship,
  DPM_CANONICAL_KEY_ENCODING_VERSIONS,
  DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION,
  renderEntityCanonicalKey,
  renderEntityCanonicalKeyForPlan,
  renderRelationshipCanonicalKey,
  resolveDpmCanonicalKeyEncodingVersion,
} from '../src/index.js'
import {
  createSingleColumnCustomerEntityInput,
  createTenantScopedCustomerEntityInput,
} from './support/model-entity-fixtures.js'
import {
  createPolymorphicCustomerActivityWithPredicateInput,
} from './support/model-relationship-polymorphic-fixtures.js'

describe('DPM canonical key encoding versions', () => {
  it('keeps string-v1 as the default and preserves existing golden output', () => {
    const entity = createEntityDeclaration(createSingleColumnCustomerEntityInput())

    expect(DPM_CANONICAL_KEY_ENCODING_VERSIONS).toEqual(['string-v1', 'typed-v2'])
    expect(DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION).toBe('string-v1')
    expect(resolveDpmCanonicalKeyEncodingVersion(undefined)).toBe('string-v1')
    expect(entity.keyStrategy.encodingVersion).toBe('string-v1')
    expect(renderEntityCanonicalKey(entity, { customer_no: 'C-001' }))
      .toBe('customer:customer_no=C-001')
  })

  it('renders typed-v2 structural segments with UTF-8 byte lengths', () => {
    const input = createTenantScopedCustomerEntityInput()
    const entity = createEntityDeclaration({
      ...input,
      keyStrategy: {
        ...input.keyStrategy,
        encodingVersion: 'typed-v2',
      },
    })

    expect(renderEntityCanonicalKey(entity, {
      customer_no: 'C:001',
      tenant_id: '고객|서부',
    })).toBe(
      'typed-v2|n|8:customer|t|9:tenant_id|s|13:고객|서부|c|11:customer_no|s|5:C:001',
    )
  })

  it('preserves predicate position in typed-v2 relationship keys', () => {
    const input = createPolymorphicCustomerActivityWithPredicateInput()
    const relationship = createLogicalRelationship({
      ...input,
      canonicalKey: {
        ...input.canonicalKey!,
        encodingVersion: 'typed-v2',
      },
    })

    expect(renderRelationshipCanonicalKey(relationship, { object_id: 'C-001' })).toBe(
      "typed-v2|n|8:customer|p|s|24:object_type = 'CUSTOMER'|c|9:object_id|s|5:C-001",
    )
  })

  it.each([
    [1, '1'],
    [null, 'null'],
    [true, 'true'],
    [1n, '1'],
    [new Date('2026-01-01T00:00:00.000Z'), '2026-01-01T00:00:00.000Z'],
    [-0, 0],
  ])('keeps typed-v2 values distinct for %p and %p', (left, right) => {
    const entity = createTypedV2CustomerEntity()

    expect(renderEntityCanonicalKey(entity, { customer_no: left }))
      .not.toBe(renderEntityCanonicalKey(entity, { customer_no: right }))
  })

  it('is deterministic across invocation order', () => {
    const entity = createTypedV2CustomerEntity()
    const values = [1, '1', null, 'null', true, 'true', 1n, '2026-01-01T00:00:00.000Z'] as const
    const first = values.map(value => renderEntityCanonicalKey(entity, { customer_no: value }))
    const reordered = [...values].reverse()
      .map(value => renderEntityCanonicalKey(entity, { customer_no: value }))
      .reverse()

    expect(reordered).toEqual(first)
  })

  it.each([
    [Number.NaN, 'must be a finite number'],
    [Number.POSITIVE_INFINITY, 'must be a finite number'],
    [Number.NEGATIVE_INFINITY, 'must be a finite number'],
    [new Date(Number.NaN), 'must be a valid Date'],
  ])('rejects invalid typed-v2 value %p', (value, expectedMessage) => {
    const entity = createTypedV2CustomerEntity()

    expect(() => renderEntityCanonicalKey(entity, { customer_no: value }))
      .toThrow(expectedMessage)
  })

  it('rejects missing and unsupported typed-v2 values explicitly', () => {
    const entity = createTypedV2CustomerEntity()

    expect(() => renderEntityCanonicalKey(entity, {}))
      .toThrow('canonical key value for customer_no is required')
    expect(() => renderEntityCanonicalKey(entity, { customer_no: {} as never }))
      .toThrow('must be a string, finite number, boolean, bigint, valid Date, or null')
    expect(() => resolveDpmCanonicalKeyEncodingVersion('typed-v3'))
      .toThrow('must be one of string-v1, typed-v2')
  })

  it.each([
    ['unpaired high surrogate', '\uD800'],
    ['unpaired low surrogate', '\uDC00'],
  ])('rejects %s before UTF-8 framing can replace it', (_label, value) => {
    const entity = createTypedV2CustomerEntity()

    expect(() => renderEntityCanonicalKey(entity, { customer_no: value }))
      .toThrow('must contain only well-formed Unicode')
  })

  it('binds plan-driven rendering to the compiled encoding contract', () => {
    const typedPlan = { canonicalKeyEncodingVersion: 'typed-v2' as const }
    const implicitV1Entity = createEntityDeclaration(createSingleColumnCustomerEntityInput())
    const typedEntity = createTypedV2CustomerEntity()

    expect(() => assertDpmCanonicalKeyEncodingVersionMatchesPlan(typedPlan))
      .toThrow('uses canonical key encoding string-v1, but compiled plan requires typed-v2')
    expect(() => renderEntityCanonicalKeyForPlan(
      typedPlan,
      implicitV1Entity,
      { customer_no: 1 },
    )).toThrow('entity canonical key renderer uses canonical key encoding string-v1')
    expect(renderEntityCanonicalKeyForPlan(
      typedPlan,
      typedEntity,
      { customer_no: 1 },
    )).toBe('typed-v2|n|8:customer|c|11:customer_no|n|1:1')
  })
})

function createTypedV2CustomerEntity() {
  const input = createSingleColumnCustomerEntityInput()
  return createEntityDeclaration({
    ...input,
    keyStrategy: {
      ...input.keyStrategy,
      encodingVersion: 'typed-v2',
    },
  })
}
