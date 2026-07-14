import {
  createDpmIdentityDataDefinitions,
  type DpmNeutralDataBindingArtifact,
} from '@oa-sdk/dpm/data'

const definitions = createDpmIdentityDataDefinitions({
  version: '1.1',
  fields: [{
    objectId: 'external-type-customer-number',
    revisionId: 'external-type-customer-number-rev-1',
    entity: {
      datasetId: 'external_fixture',
      namespace: 'customer',
      name: 'customer',
    },
    name: 'customerNo',
    type: 'string',
    origin: 'api_only',
  }],
})

const artifact: DpmNeutralDataBindingArtifact | undefined = undefined

if (definitions.fields[0]?.objectId !== 'external-type-customer-number') {
  throw new Error('packed data declaration consumer could not construct v1.1 identity')
}

void artifact
