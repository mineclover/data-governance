import Ajv2020 from 'ajv/dist/2020.js'

import { getDpmGatewayOpenApiDocument } from '../../src/index.js'

export function compileGatewayComponentSchema(name: string) {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  ajv.addSchema(getDpmGatewayOpenApiDocument(), 'dpm-gateway')
  return ajv.compile({ $ref: `dpm-gateway#/components/schemas/${name}` })
}
