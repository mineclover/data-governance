import {
  ref,
} from './openapi-schema.js'
import type { DpmGatewayOperationId } from './openapi-operation-ids.js'

export function gatewayOperation(input: {
  operationId: DpmGatewayOperationId
  tags: string[]
  summary: string
  requestBody?: unknown
  responseSchema: string
  blockingResponseSchema?: string
  parameters?: unknown[]
  statusCode?: '200' | '202'
}) {
  return {
    operationId: input.operationId,
    tags: input.tags,
    summary: input.summary,
    ...(input.parameters ? { parameters: input.parameters } : {}),
    ...(input.requestBody ? { requestBody: input.requestBody } : {}),
    responses: {
      [input.statusCode ?? '200']: jsonResponse(input.responseSchema),
      ...(input.blockingResponseSchema
        ? { 400: jsonResponse(input.blockingResponseSchema, 'Blocking diagnostic response.') }
        : {}),
    },
  }
}

function jsonResponse(schemaName: string, description = 'JSON response.') {
  return {
    description,
    content: {
      'application/json': {
        schema: ref(schemaName),
      },
    },
  }
}
