import {
  DPM_PROFILE_CAPTURE_MODES,
  DPM_PROFILE_SOURCE_KINDS,
} from '../profile/types.js'
import {
  arrayOf,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmProfileSourceGatewaySchemas() {
  return {
    DpmProfileCoordinate: requiredObjectSchema({
      kind: { type: 'string', enum: [...DPM_PROFILE_SOURCE_KINDS] },
      path: stringSchema(),
      sourceId: stringSchema(),
      pointer: stringSchema(),
      externalId: stringSchema(),
    }, ['kind', 'path']),
    DpmProfileSourceDescriptor: requiredObjectSchema({
      id: stringSchema(),
      kind: { type: 'string', enum: [...DPM_PROFILE_SOURCE_KINDS] },
      connectorId: stringSchema(),
      connectorVersion: stringSchema(),
      refs: arrayOf(stringSchema()),
      captureMode: { type: 'string', enum: [...DPM_PROFILE_CAPTURE_MODES] },
      capturedAt: stringSchema(),
      sourceVersionHash: stringSchema(),
    }, ['id', 'kind', 'connectorId', 'connectorVersion', 'refs', 'captureMode']),
    DpmProfileEvidenceSource: requiredObjectSchema({
      coordinate: ref('DpmProfileCoordinate'),
      connectorId: stringSchema(),
      capturedAt: stringSchema(),
      description: stringSchema(),
    }, ['coordinate']),
  } as const
}
