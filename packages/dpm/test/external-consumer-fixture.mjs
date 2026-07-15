import {
  DPM_NEUTRAL_DATA_BINDING_ARTIFACT_KIND,
  DPM_NEUTRAL_DATA_BINDING_ARTIFACT_VERSIONS,
  createDpmIdentityDataDefinitions,
} from '@mineclover/dpm/data'
import {
  DPM_PACKAGE_NAME,
} from '@mineclover/dpm/package'
import {
  createDpmNeutralDataBindingArtifact,
} from '@mineclover/dpm/relationship'

const definitions = createDpmIdentityDataDefinitions({
  version: '1.1',
  fields: [{
    objectId: 'external-customer-number',
    revisionId: 'external-customer-number-rev-1',
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

if (DPM_PACKAGE_NAME !== '@mineclover/dpm') throw new Error('package name contract changed')
if (DPM_NEUTRAL_DATA_BINDING_ARTIFACT_KIND !== 'dpm.data-binding-artifact.v1') {
  throw new Error('neutral artifact kind contract changed')
}
if (!DPM_NEUTRAL_DATA_BINDING_ARTIFACT_VERSIONS.includes('1.0')) {
  throw new Error('neutral artifact version contract changed')
}
if (definitions.fields[0]?.objectId !== 'external-customer-number') {
  throw new Error('data subpath identity contract could not be consumed')
}
if (typeof createDpmNeutralDataBindingArtifact !== 'function') {
  throw new Error('relationship subpath neutral artifact builder could not be consumed')
}

console.log(JSON.stringify({
  status: 'ok',
  packageName: DPM_PACKAGE_NAME,
  imports: ['@mineclover/dpm/data', '@mineclover/dpm/relationship'],
  artifactKind: DPM_NEUTRAL_DATA_BINDING_ARTIFACT_KIND,
  artifactVersions: DPM_NEUTRAL_DATA_BINDING_ARTIFACT_VERSIONS,
  fieldObjectId: definitions.fields[0].objectId,
}))
