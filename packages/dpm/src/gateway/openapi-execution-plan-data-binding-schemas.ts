import {
  arrayOf,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

const dataFieldTypes = [
  'string',
  'integer',
  'number',
  'boolean',
  'date',
  'date-time',
  'object',
  'array',
  'json',
  'unknown',
] as const

export function createDpmGatewayPlanDataBindingSchemas() {
  return {
    DpmDataSourceCoordinate: {
      oneOf: [
        requiredObjectSchema({
          kind: { type: 'string', const: 'file' },
          filePath: stringSchema(),
          pointer: stringSchema(),
          line: { type: 'integer', minimum: 1 },
          column: { type: 'integer', minimum: 1 },
        }, ['kind', 'filePath', 'pointer']),
        requiredObjectSchema({
          kind: { type: 'string', const: 'db' },
          entity: stringSchema(),
          id: stringSchema(),
          pointer: stringSchema(),
        }),
      ],
    },
    DpmEntityRef: requiredObjectSchema({
      datasetId: stringSchema(),
      namespace: stringSchema(),
      name: stringSchema(),
    }),
    DpmDataFieldLocator: requiredObjectSchema({
      datasetId: stringSchema(),
      namespace: stringSchema(),
      entity: stringSchema(),
      field: stringSchema(),
    }),
    DpmCatalogSnapshotRef: requiredObjectSchema({
      snapshotId: stringSchema(),
      versionHash: stringSchema(),
      sourceCoordinate: ref('DpmDataSourceCoordinate'),
    }, ['snapshotId', 'versionHash']),
    DpmDataBindingApiArtifactFreshness: requiredObjectSchema({
      artifactId: stringSchema(),
      versionHash: stringSchema(),
      provenanceVersionHash: stringSchema(),
    }, ['artifactId', 'versionHash']),
    DpmDataBindingFreshness: requiredObjectSchema({
      dataDefinitionVersion: { type: 'string', const: '1.1' },
      catalogSnapshots: arrayOf(ref('DpmCatalogSnapshotRef')),
      apiArtifacts: arrayOf(ref('DpmDataBindingApiArtifactFreshness')),
      identityHash: stringSchema(),
    }),
    DpmNeutralDataBindingStorage: requiredObjectSchema({
      identity: stringSchema(),
      table: stringSchema(),
      column: stringSchema(),
      catalog: ref('DpmCatalogSnapshotRef'),
    }),
    DpmNeutralDataBindingField: requiredObjectSchema({
      identity: stringSchema(),
      objectId: stringSchema(),
      revisionId: stringSchema(),
      locator: ref('DpmDataFieldLocator'),
      entity: ref('DpmEntityRef'),
      name: stringSchema(),
      type: { type: 'string', enum: [...dataFieldTypes] },
      origin: { type: 'string', enum: ['persisted', 'derived', 'computed', 'api_only'] },
      nullable: { type: 'boolean' },
      description: { type: 'string' },
      lifecycle: { type: 'string', enum: ['active', 'deprecated', 'superseded'] },
      aliases: arrayOf(stringSchema()),
      supersededByObjectId: stringSchema(),
      storage: ref('DpmNeutralDataBindingStorage'),
    }, [
      'identity',
      'objectId',
      'revisionId',
      'locator',
      'entity',
      'name',
      'type',
      'origin',
      'lifecycle',
      'aliases',
    ]),
    DpmNeutralDataBindingApi: requiredObjectSchema({
      artifactId: stringSchema(),
      pointer: stringSchema(),
      versionHash: stringSchema(),
      operationId: stringSchema(),
      identity: stringSchema(),
    }, ['artifactId', 'pointer', 'versionHash', 'identity']),
    DpmNeutralDataBindingApiBinding: requiredObjectSchema({
      identity: stringSchema(),
      bindingId: stringSchema(),
      dataField: requiredObjectSchema({
        objectId: stringSchema(),
        revisionId: stringSchema(),
        identity: stringSchema(),
      }),
      api: ref('DpmNeutralDataBindingApi'),
      direction: { type: 'string', enum: ['request', 'response', 'both'] },
      targetIdentity: stringSchema(),
    }),
    DpmDataBindingApiArtifactLink: requiredObjectSchema({
      artifactId: stringSchema(),
      versionHash: stringSchema(),
      sourceCoordinate: ref('DpmDataSourceCoordinate'),
    }, ['artifactId', 'versionHash']),
    DpmDataBindingBehaviorTraceLink: requiredObjectSchema({
      behaviorId: stringSchema(),
      traceId: stringSchema(),
      correlationId: stringSchema(),
      recordRef: stringSchema(),
      sourceCoordinate: ref('DpmDataSourceCoordinate'),
    }, ['behaviorId']),
    DpmDataBindingReviewLink: requiredObjectSchema({
      reviewId: stringSchema(),
      recordRef: stringSchema(),
      sourceCoordinate: ref('DpmDataSourceCoordinate'),
    }, ['reviewId']),
    DpmNeutralDataBindingProvenance: requiredObjectSchema({
      apiArtifacts: arrayOf(ref('DpmDataBindingApiArtifactLink')),
      catalogSnapshots: arrayOf(ref('DpmCatalogSnapshotRef')),
      behaviorTraces: arrayOf(ref('DpmDataBindingBehaviorTraceLink')),
      reviews: arrayOf(ref('DpmDataBindingReviewLink')),
    }),
    DpmNeutralDataBindingArtifact: requiredObjectSchema({
      kind: { type: 'string', const: 'dpm.data-binding-artifact.v1' },
      version: { type: 'string', const: '1.0' },
      identity: stringSchema(),
      freshness: ref('DpmDataBindingFreshness'),
      fields: arrayOf(ref('DpmNeutralDataBindingField')),
      apiBindings: arrayOf(ref('DpmNeutralDataBindingApiBinding')),
      provenance: ref('DpmNeutralDataBindingProvenance'),
    }),
  } as const
}
