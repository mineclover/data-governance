import { describe, expect, it } from 'vitest'

import {
  createLogicalRelationship,
  renderRelationshipCanonicalKey,
} from '../src/index.js'
import {
  createPolymorphicCustomerActivityInput,
  createPolymorphicCustomerActivityWithPredicateInput,
} from './support/model-relationship-polymorphic-fixtures.js'
import {
  createTemporalProductPriceHistoryInput,
  createTemporalProductPriceHistoryWithValidTimeInput,
} from './support/model-relationship-temporal-fixtures.js'

describe('DPM logical relationship model', () => {
  it('requires polymorphic relationships to declare a predicate and includes it in the canonical key', () => {
    expect(() =>
      createLogicalRelationship(createPolymorphicCustomerActivityInput()),
    ).toThrow('polymorphic relationships require conditionSql')

    const relationship = createLogicalRelationship(
      createPolymorphicCustomerActivityWithPredicateInput(),
    )

    expect(relationship.canonicalKey.encodingVersion).toBe('string-v1')
    expect(renderRelationshipCanonicalKey(relationship, { object_id: 'C-001' })).toBe(
      'customer:predicate=object_type%20%3D%20%27CUSTOMER%27:object_id=C-001',
    )
  })

  it('requires temporal relationships to declare valid-time input or a documented absence', () => {
    expect(() =>
      createLogicalRelationship(createTemporalProductPriceHistoryInput()),
    ).toThrow('temporal relationships require validTimeColumn or validTimeAbsentReason')

    const relationship = createLogicalRelationship(
      createTemporalProductPriceHistoryWithValidTimeInput(),
    )

    expect(relationship.temporal).toEqual({ validTimeColumn: 'observed_at' })
  })
})
