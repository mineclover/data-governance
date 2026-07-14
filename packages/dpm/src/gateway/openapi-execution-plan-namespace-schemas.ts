import {
  arrayOf,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayPlanNamespaceSchemas() {
  return {
    DpmNamespaceBinding: requiredObjectSchema({
      namespace: stringSchema(),
      entity: stringSchema(),
      relationships: arrayOf(stringSchema()),
      columns: arrayOf(stringSchema()),
      transform: stringSchema(),
    }),
  } as const
}
