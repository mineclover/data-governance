import Ajv2020 from 'ajv/dist/2020.js'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readDpmJsonFixture } from './support/fixture-io.js'

const schemaUrl = new URL('../src/schema/dpm-manifest.schema.json', import.meta.url)
const schema = JSON.parse(readFileSync(schemaUrl, 'utf8')) as Record<string, unknown>

describe('DPM data definition manifest contract', () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  const validate = ajv.compile(schema)

  it('accepts distinct logical data and API references', () => {
    const manifest = structuredClone(
      readDpmJsonFixture('valid/customer-orders.json'),
    ) as Record<string, any>
    manifest.data_definitions = {
      version: '1.0',
      fields: [{
        entity: 'customer',
        name: 'customerNo',
        type: 'string',
        storage_ref: {
          table: 'public.customers',
          column: 'customer_no',
        },
      }],
      api_bindings: [{
        data_field: {
          entity: 'customer',
          field: 'customerNo',
        },
        api: {
          artifact_id: 'commerce-api',
          operation_id: 'getCustomer',
          pointer: '#/paths/~1customers~1{customerId}/get/responses/200',
          version_hash: 'sha256:api-v1',
        },
        direction: 'response',
      }],
    }

    expect(validate(manifest), JSON.stringify(validate.errors, null, 2)).toBe(true)
  })

  it('rejects an API address that is not an OpenAPI JSON pointer', () => {
    const manifest = structuredClone(
      readDpmJsonFixture('valid/customer-orders.json'),
    ) as Record<string, any>
    manifest.data_definitions = {
      version: '1.0',
      fields: [{
        entity: 'customer',
        name: 'customerNo',
        type: 'string',
      }],
      api_bindings: [{
        data_field: {
          entity: 'customer',
          field: 'customerNo',
        },
        api: {
          artifact_id: 'commerce-api',
          pointer: '/paths/customers/get',
        },
        direction: 'response',
      }],
    }

    expect(validate(manifest)).toBe(false)
    expect((validate.errors ?? []).map(error => error.instancePath))
      .toContain('/data_definitions/api_bindings/0/api/pointer')
  })

  it('accepts the experimental 1.1 identity contract', () => {
    const manifest = structuredClone(
      readDpmJsonFixture('valid/customer-orders.json'),
    ) as Record<string, any>
    manifest.data_definitions = {
      version: '1.1',
      fields: [{
        object_id: 'customer-number',
        revision_id: 'customer-number-rev-1',
        entity: {
          dataset_id: 'commerce_ai',
          namespace: 'customer',
          name: 'customer',
        },
        name: 'customerNo',
        type: 'string',
        origin: 'persisted',
        storage_ref: {
          table: 'public.customers',
          column: 'customer_no',
          catalog: {
            snapshot_id: 'commerce-catalog-2026-07-14',
            version_hash: 'sha256:catalog-v1',
            source_coordinate: {
              kind: 'db',
              entity: 'catalog_column',
              id: 'public.customers.customer_no',
              pointer: '#/tables/public.customers/columns/customer_no',
            },
          },
        },
      }],
      api_bindings: [{
        binding_id: 'customer-number-response',
        data_field: {
          object_id: 'customer-number',
          revision_id: 'customer-number-rev-1',
        },
        api: {
          artifact_id: 'commerce-api',
          operation_id: 'getCustomer',
          pointer: '#/paths/~1customers/get/responses/200/content/application~1json/schema/properties/customerNo',
          version_hash: 'sha256:api-v1',
        },
        direction: 'response',
      }],
    }

    expect(validate(manifest), JSON.stringify(validate.errors, null, 2)).toBe(true)
  })

  it('rejects identity fields without required origin-specific bindings', () => {
    const manifest = structuredClone(
      readDpmJsonFixture('valid/customer-orders.json'),
    ) as Record<string, any>
    manifest.data_definitions = {
      version: '1.1',
      fields: [{
        object_id: 'customer-number',
        revision_id: 'customer-number-rev-1',
        entity: {
          dataset_id: 'commerce_ai',
          namespace: 'customer',
          name: 'customer',
        },
        name: 'customerNo',
        type: 'string',
        origin: 'persisted',
      }],
      api_bindings: [],
    }

    expect(validate(manifest)).toBe(false)
  })
})
