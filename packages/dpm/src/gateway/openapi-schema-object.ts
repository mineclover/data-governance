import { integerSchema } from './openapi-schema-scalar.js'

export function objectSchema(properties: Record<string, unknown>) {
  return {
    type: 'object',
    additionalProperties: false,
    properties,
  }
}

export function requiredObjectSchema(
  properties: Record<string, unknown>,
  required = Object.keys(properties),
) {
  return {
    ...objectSchema(properties),
    required,
  }
}

export function informativeObjectSchema(properties: Record<string, unknown>) {
  return {
    ...objectSchema(properties),
    minProperties: 1,
  }
}

export function recordOf(additionalProperties: unknown) {
  return {
    type: 'object',
    additionalProperties,
  }
}

export function countRecordSchema(keys: readonly string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: Object.fromEntries(keys.map(key => [key, integerSchema()])),
  }
}
