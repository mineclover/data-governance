import {
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayPlanColumnSchemas() {
  return {
    DpmColumnStep: requiredObjectSchema({
      table: stringSchema(),
      column: stringSchema(),
      columnRef: stringSchema(),
      role: stringSchema(),
      pii: { type: 'boolean' },
      transform: stringSchema(),
      relationship: stringSchema(),
      namespace: stringSchema(),
    }, ['table', 'column', 'columnRef', 'role', 'pii', 'transform']),
  } as const
}
