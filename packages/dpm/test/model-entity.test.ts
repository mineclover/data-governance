import { describe, expect, it } from 'vitest'

import {
  createEntityDeclaration,
  renderEntityCanonicalKey,
} from '../src/index.js'
import {
  createSingleColumnCustomerEntityInput,
  createTenantScopedCustomerEntityInput,
} from './support/model-entity-fixtures.js'

describe('DPM entity model', () => {
  it('renders a single-column entity canonical key from the entity root key only', () => {
    const entity = createEntityDeclaration(
      createSingleColumnCustomerEntityInput(),
    )

    expect(entity.identity).toBe('entity:customer/customer')
    expect(renderEntityCanonicalKey(entity, { customer_no: 'C-001' })).toBe(
      'customer:customer_no=C-001',
    )
    expect(entity).not.toHaveProperty('child')
    expect(entity).not.toHaveProperty('childColumns')
  })

  it('renders composite and tenant-scoped entity canonical keys deterministically', () => {
    const entity = createEntityDeclaration(
      createTenantScopedCustomerEntityInput(),
    )

    expect(
      renderEntityCanonicalKey(entity, {
        customer_no: 'C:001',
        tenant_id: 'tenant:west',
      }),
    ).toBe('customer:tenant_id=tenant%3Awest:customer_no=C%3A001')
  })
})
