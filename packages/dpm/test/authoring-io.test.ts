import { describe, expect, it } from 'vitest'

import {
  createDpmIdentityDataDefinitions,
  DpmAuthoringError,
  exportDpmAuthoringDefinitions,
  importDpmAuthoringDefinitions,
} from '../src/index.js'

describe('DPM authoring import/export helpers', () => {
  it('exports deterministic portable input and round-trips derived identities', () => {
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

    const exported = exportDpmAuthoringDefinitions(definitions)
    expect(exported).toBe(exportDpmAuthoringDefinitions(definitions))
    expect(exported.endsWith('\n')).toBe(true)
    expect(exported).not.toContain('"locator"')
    expect(exported).not.toContain('"identity"')
    expect(exported).not.toContain('"targetIdentity"')
    expect(importDpmAuthoringDefinitions(exported)).toEqual(definitions)
  })

  it('sorts fields and bindings by stable identity', () => {
    const definitions = createDpmIdentityDataDefinitions({
      version: '1.1',
      fields: [
        createFieldInput('z-field', 'zName'),
        createFieldInput('a-field', 'aName'),
      ],
      apiBindings: [
        createBindingInput('z-binding', 'z-field', 'zName'),
        createBindingInput('a-binding', 'a-field', 'aName'),
      ],
    })

    const document = JSON.parse(exportDpmAuthoringDefinitions(definitions)) as {
      fields: Array<{ objectId: string }>
      apiBindings: Array<{ bindingId: string }>
    }
    expect(document.fields.map(field => field.objectId)).toEqual(['a-field', 'z-field'])
    expect(document.apiBindings.map(binding => binding.bindingId)).toEqual(['a-binding', 'z-binding'])
  })

  it('rejects malformed JSON, unsupported versions, and invalid definitions', () => {
    expect(() => importDpmAuthoringDefinitions('{')).toThrow(DpmAuthoringError)
    expect(() => importDpmAuthoringDefinitions('{"version":"1.0","fields":[]}')).toThrow(/version 1.1/)
    expect(() => importDpmAuthoringDefinitions('{"version":"1.1","fields":[{"objectId":"x"}]}'))
      .toThrow(DpmAuthoringError)
  })
})

function createFieldInput(objectId: string, name: string) {
  return {
    objectId,
    revisionId: `${objectId}-revision-1`,
    entity: { datasetId: 'commerce', namespace: 'customer', name: 'customer' },
    name,
    type: 'string' as const,
    origin: 'api_only' as const,
  }
}

function createBindingInput(bindingId: string, objectId: string, name: string) {
  return {
    bindingId,
    dataField: { objectId, revisionId: `${objectId}-revision-1` },
    api: {
      artifactId: 'commerce-api',
      pointer: `#/components/schemas/Customer/properties/${name}`,
      versionHash: 'sha256:api-1',
    },
    direction: 'response' as const,
  }
}
