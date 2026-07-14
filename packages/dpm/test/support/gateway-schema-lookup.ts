import {
  getDpmGatewayOpenApiDocument,
} from '../../src/index.js'
import {
  getSchemaPathValue,
  type SchemaPath,
} from './schema-path.js'

export type GatewayTaxonomyProjectionCase = readonly [
  schemaName: string,
  path: SchemaPath,
  expected: readonly string[],
]

export function getDpmGatewaySchema(name: string): Record<string, any> {
  const schema = getDpmGatewayOpenApiDocument().components?.schemas?.[name]
  if (!schema || typeof schema !== 'object') {
    throw new Error(`expected DPM gateway schema: ${name}`)
  }
  return schema as Record<string, any>
}

export function getDpmGatewaySchemaValue(name: string, path: SchemaPath): unknown {
  return getSchemaPathValue(getDpmGatewaySchema(name), path)
}
