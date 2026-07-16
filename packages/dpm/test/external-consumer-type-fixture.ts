import {
  createDpmIdentityDataDefinitions,
  type DpmNeutralDataBindingArtifact,
} from '@context-action/dpm/data'
import {
  createDpmAuthoringQuickFixes,
  resolveDpmAuthoringBackend,
  type DpmAuthoringBackend,
  type DpmAuthoringBackendAdapters,
  type DpmAsyncAuthoringRepository,
  type DpmAuthoringExplanation,
  type DpmAuthoringSemanticDiff,
  type DpmConfiguredAsyncAuthoringServiceOptions,
} from '@context-action/dpm/authoring'

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
const authoringBackend: DpmAuthoringBackend = resolveDpmAuthoringBackend({ env: {} }).backend
const authoringRepositories: DpmAuthoringBackendAdapters<DpmAsyncAuthoringRepository> | undefined = undefined
const authoringOptions: DpmConfiguredAsyncAuthoringServiceOptions | undefined = undefined
const authoringDiff: DpmAuthoringSemanticDiff | undefined = undefined
const authoringExplanation: DpmAuthoringExplanation | undefined = undefined
const authoringQuickFixes = authoringDiff
  ? createDpmAuthoringQuickFixes(authoringDiff)
  : undefined

if (definitions.fields[0]?.objectId !== 'external-type-customer-number') {
  throw new Error('packed data declaration consumer could not construct v1.1 identity')
}

void artifact
void authoringBackend
void authoringRepositories
void authoringOptions
void authoringDiff
void authoringExplanation
void authoringQuickFixes
