import { describe, expect, it } from 'vitest'

import {
  createDpmIdentityDataDefinitions,
  explainDpmAuthoringDefinitions,
} from '../src/index.js'

describe('DPM authoring explain helper', () => {
  it('returns deterministic frozen logical/API/DB identity readback without values', () => {
    const definitions = createDpmIdentityDataDefinitions({
      version: '1.1',
      fields: [{
        objectId: 'customer-number',
        revisionId: 'customer-number-rev-1',
        entity: { datasetId: 'commerce', namespace: 'customer', name: 'customer' },
        name: 'customerNo',
        type: 'string',
        origin: 'persisted',
        storageRef: {
          table: 'public.customers',
          column: 'customer_no',
          catalog: { snapshotId: 'catalog-1', versionHash: 'sha256:catalog-1' },
        },
      }],
      apiBindings: [{
        bindingId: 'customer-number-response',
        dataField: { objectId: 'customer-number', revisionId: 'customer-number-rev-1' },
        api: {
          artifactId: 'commerce-api',
          pointer: '#/components/schemas/Customer/properties/customerNo',
          versionHash: 'sha256:api-1',
        },
        direction: 'response',
      }],
    })

    const explanation = explainDpmAuthoringDefinitions(definitions)
    expect(explanation).toMatchObject({
      version: '1.1',
      fieldCount: 1,
      apiBindingCount: 1,
      fields: [{
        objectId: 'customer-number',
        identity: 'data-field:customer-number',
        locator: {
          datasetId: 'commerce',
          namespace: 'customer',
          entity: 'customer',
          field: 'customerNo',
        },
        apiBindings: [{
          bindingId: 'customer-number-response',
          targetIdentity: expect.stringContaining('api:'),
        }],
      }],
    })
    expect(Object.isFrozen(explanation)).toBe(true)
    expect(Object.isFrozen(explanation.fields)).toBe(true)
    expect(Object.isFrozen(explanation.fields[0])).toBe(true)
    expect(Object.isFrozen(explanation.fields[0]?.apiBindings)).toBe(true)
    expect(JSON.stringify(explanation)).not.toContain('sample')
    expect(JSON.stringify(explanation)).not.toContain('token')
  })
})
