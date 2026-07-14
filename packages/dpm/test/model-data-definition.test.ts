import { describe, expect, it } from 'vitest'

import {
  createDpmApiObjectCanonicalIdentity,
  createDpmApiBinding,
  createDpmApiObjectIdentity,
  createDpmDatabaseColumnIdentity,
  createDpmDataDefinitions,
  createDpmDataField,
  createDpmDataFieldIdentity,
  createDpmDataFieldLocator,
  createDpmEntityRefIdentity,
  createDpmIdentityApiBinding,
  createDpmIdentityDataDefinitions,
  createDpmIdentityDataField,
  createDpmIdentityDatabaseColumnIdentity,
  renderDpmDataFieldLocator,
} from '../src/index.js'

describe('DPM logical data definitions', () => {
  it('keeps logical field, database column, and API object identities separate', () => {
    const field = createDpmDataField({
      entity: 'customer',
      name: 'customerNo',
      type: 'string',
      storageRef: {
        table: 'public.customers',
        column: 'customer_no',
      },
    })
    const binding = createDpmApiBinding({
      dataField: {
        entity: 'customer',
        field: 'customerNo',
      },
      api: {
        artifactId: 'commerce-api',
        operationId: 'getCustomer',
        pointer: '#/paths/~1customers~1{customerId}/get/responses/200/content/application~1json/schema/properties/customerNo',
        versionHash: 'sha256:api-v1',
      },
      direction: 'response',
    })

    expect(field.identity).toBe('field:customer/customerNo')
    expect(createDpmDataFieldIdentity(binding.dataField)).toBe(field.identity)
    expect(field.storageRef).toEqual({
      table: 'public.customers',
      column: 'customer_no',
    })
    expect(createDpmDatabaseColumnIdentity(field.storageRef!)).toBe('db:public.customers#customer_no')
    expect(createDpmApiObjectIdentity(binding.api)).toBe(
      'api:commerce-api@sha256:api-v1:#/paths/~1customers~1{customerId}/get/responses/200/content/application~1json/schema/properties/customerNo',
    )
    expect(binding.identity).toContain('binding:field:customer/customerNo@api:commerce-api')
    expect(binding.api.pointer).not.toBe(field.storageRef?.column)
  })

  it('rejects bindings that reference a field outside the data definition', () => {
    expect(() => createDpmDataDefinitions({
      fields: [{
        entity: 'customer',
        name: 'customerNo',
        type: 'string',
      }],
      apiBindings: [{
        dataField: {
          entity: 'order',
          field: 'customerNo',
        },
        api: {
          artifactId: 'commerce-api',
          pointer: '#/components/schemas/Order/properties/customerNo',
        },
        direction: 'response',
      }],
    })).toThrow('unknown data field field:order/customerNo')
  })

  it('rejects non-pointer API addresses at the model boundary', () => {
    expect(() => createDpmApiBinding({
      dataField: {
        entity: 'customer',
        field: 'customerNo',
      },
      api: {
        artifactId: 'commerce-api',
        pointer: '/paths/customers/get',
      },
      direction: 'response',
    })).toThrow('must be an OpenAPI JSON pointer')
  })

  it('keeps namespace, locator, object, revision, catalog, and API identities distinct', () => {
    const storageRef = {
      table: 'public.customers',
      column: 'customer_no',
      catalog: {
        snapshotId: 'commerce-catalog-2026-07-14',
        versionHash: 'sha256:catalog-v1',
        sourceCoordinate: {
          kind: 'db' as const,
          entity: 'catalog_column',
          id: 'public.customers.customer_no',
          pointer: '#/tables/public.customers/columns/customer_no',
        },
      },
    }
    const field = createDpmIdentityDataField({
      objectId: 'customer-number',
      revisionId: 'customer-number-rev-1',
      entity: {
        datasetId: 'commerce_ai',
        namespace: 'customer',
        name: 'customer',
      },
      name: 'customerNo',
      type: 'string',
      origin: 'persisted',
      storageRef,
      aliases: ['field:commerce_ai/customer/customer/customerNumber'],
    })
    const renamed = createDpmIdentityDataField({
      ...field,
      revisionId: 'customer-number-rev-2',
      name: 'customerNumber',
      aliases: ['field:commerce_ai/customer/customer/customerNo'],
    })
    const otherDatasetEntity = {
      datasetId: 'support_ai',
      namespace: 'customer',
      name: 'customer',
    }

    expect(createDpmEntityRefIdentity(field.entity)).toBe('entity:commerce_ai/customer/customer')
    expect(renderDpmDataFieldLocator(field.locator)).toBe(
      'field:commerce_ai/customer/customer/customerNo',
    )
    expect(createDpmDataFieldLocator({
      datasetId: 'support_ai',
      namespace: 'customer',
      entity: 'customer',
      field: 'customerNo',
    })).not.toEqual(field.locator)
    expect(field.identity).toBe('data-field:customer-number')
    expect(renamed.identity).toBe(field.identity)
    expect(renamed.revisionId).not.toBe(field.revisionId)
    expect(createDpmEntityRefIdentity(otherDatasetEntity)).not.toBe(createDpmEntityRefIdentity(field.entity))
    expect(createDpmIdentityDatabaseColumnIdentity(storageRef)).toBe(
      'db:commerce-catalog-2026-07-14@sha256%3Acatalog-v1:public.customers#customer_no',
    )

    const apiV1 = createDpmIdentityApiBinding({
      bindingId: 'customer-number-response',
      dataField: {
        objectId: field.objectId,
        revisionId: field.revisionId,
      },
      api: {
        artifactId: 'commerce-api',
        versionHash: 'sha256:api-v1',
        operationId: 'getCustomer',
        pointer: '#/paths/~1customers/get/responses/200/content/application~1json/schema/properties/customerNo',
      },
      direction: 'response',
    })
    const apiOperationRename = createDpmIdentityApiBinding({
      ...apiV1,
      api: {
        ...apiV1.api,
        operationId: 'fetchCustomer',
      },
    })
    const apiV2 = createDpmIdentityApiBinding({
      ...apiV1,
      api: {
        ...apiV1.api,
        versionHash: 'sha256:api-v2',
      },
    })

    expect(createDpmApiObjectCanonicalIdentity(apiV1.api)).toBe(apiOperationRename.targetIdentity)
    expect(apiV2.targetIdentity).not.toBe(apiV1.targetIdentity)
    expect(apiV1.identity).toBe('binding:customer-number-response')
  })

  it('enforces field origin storage and supersession rules', () => {
    const base = {
      objectId: 'derived-total',
      revisionId: 'derived-total-rev-1',
      entity: { datasetId: 'commerce_ai', namespace: 'order', name: 'order' },
      name: 'total',
      type: 'number' as const,
    }

    expect(() => createDpmIdentityDataField({
      ...base,
      origin: 'persisted',
    })).toThrow('require storageRef')
    expect(() => createDpmIdentityDataField({
      ...base,
      origin: 'api_only',
      storageRef: {
        table: 'public.orders',
        column: 'total',
        catalog: { snapshotId: 'catalog', versionHash: 'sha256:catalog' },
      },
    })).toThrow('cannot declare storageRef')
    expect(() => createDpmIdentityDataField({
      ...base,
      origin: 'superseded' as never,
      lifecycle: 'superseded',
    })).toThrow('origin')
    expect(() => createDpmIdentityDataField({
      ...base,
      origin: 'computed',
      lifecycle: 'superseded',
    })).toThrow('requires supersededByObjectId')
  })

  it('rejects duplicate reverse API bindings and unknown supersession targets', () => {
    const field = {
      objectId: 'customer-number',
      revisionId: 'customer-number-rev-1',
      entity: { datasetId: 'commerce_ai', namespace: 'customer', name: 'customer' },
      name: 'customerNo',
      type: 'string' as const,
      origin: 'api_only' as const,
    }
    const otherField = {
      ...field,
      objectId: 'order-customer-number',
      revisionId: 'order-customer-number-rev-1',
      entity: { datasetId: 'commerce_ai', namespace: 'order', name: 'order' },
      name: 'customerNo',
    }
    const api = {
      artifactId: 'commerce-api',
      versionHash: 'sha256:api-v1',
      pointer: '#/components/schemas/Customer/properties/customerNo',
    }

    expect(() => createDpmIdentityDataDefinitions({
      version: '1.1',
      fields: [field, otherField],
      apiBindings: [
        { bindingId: 'customer-binding', dataField: { objectId: field.objectId, revisionId: field.revisionId }, api, direction: 'response' },
        { bindingId: 'order-binding', dataField: { objectId: otherField.objectId, revisionId: otherField.revisionId }, api, direction: 'response' },
      ],
    })).toThrow('multiple logical fields')

    expect(() => createDpmIdentityDataDefinitions({
      version: '1.1',
      fields: [{
        ...field,
        lifecycle: 'superseded',
        supersededByObjectId: 'missing-field',
      }],
    })).toThrow('unknown objectId')
  })
})
