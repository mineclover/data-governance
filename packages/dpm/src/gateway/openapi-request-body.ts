import { ref } from './openapi-schema.js'

export function jsonRequestBody(schemaName: string) {
  return {
    required: true,
    content: {
      'application/json': {
        schema: ref(schemaName),
      },
    },
  }
}
