import { stringSchema } from './openapi-schema.js'

export function pathParameter(name: string) {
  return {
    name,
    in: 'path',
    required: true,
    schema: stringSchema(),
  }
}
