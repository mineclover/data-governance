import {
  DPM_PROFILE_EDGE_KINDS,
  DPM_PROFILE_METRIC_KINDS,
  DPM_PROFILE_NODE_KINDS,
} from '../profile/types.js'
import { unsafeProfileShapeKeyPattern } from '../profile/schema-fragments.js'
import {
  arrayOf,
  numberSchema,
  ratioSchema,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

const profileShapeGatewaySchema = {
  type: 'object',
  propertyNames: {
    type: 'string',
    not: { pattern: unsafeProfileShapeKeyPattern },
  },
  additionalProperties: {
    oneOf: [stringSchema(), numberSchema(), { type: 'boolean' }, { type: 'null' }],
  },
} as const

export function createDpmProfileGraphGatewaySchemas() {
  return {
    DpmProfileNode: requiredObjectSchema({
      id: stringSchema(),
      kind: { type: 'string', enum: [...DPM_PROFILE_NODE_KINDS] },
      label: stringSchema(),
      coordinate: ref('DpmProfileCoordinate'),
      dataType: stringSchema(),
      shape: profileShapeGatewaySchema,
    }, ['id', 'kind', 'label', 'coordinate']),
    DpmProfileEdge: requiredObjectSchema({
      id: stringSchema(),
      kind: { type: 'string', enum: [...DPM_PROFILE_EDGE_KINDS] },
      fromNodeId: stringSchema(),
      toNodeId: stringSchema(),
      evidenceIds: arrayOf(stringSchema()),
      confidence: ratioSchema(),
    }, ['id', 'kind', 'fromNodeId', 'toNodeId', 'evidenceIds']),
    DpmProfileMetric: requiredObjectSchema({
      id: stringSchema(),
      kind: { type: 'string', enum: [...DPM_PROFILE_METRIC_KINDS] },
      subjectId: stringSchema(),
      value: { oneOf: [numberSchema(), stringSchema()] },
      unit: stringSchema(),
      evidenceIds: arrayOf(stringSchema()),
    }, ['id', 'kind', 'subjectId', 'value', 'evidenceIds']),
  } as const
}
