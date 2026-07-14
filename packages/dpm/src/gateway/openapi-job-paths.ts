import {
  gatewayOperation,
} from './openapi-operation.js'
import { pathParameter } from './openapi-parameters.js'
import { jsonRequestBody } from './openapi-request-body.js'

export function createDpmJobGatewayPaths() {
  return {
    '/dpm/jobs/execute': {
      post: gatewayOperation({
        operationId: 'executeDpmJob',
        tags: ['jobs'],
        summary: 'Start a DPM execution job from a compiled plan reference.',
        requestBody: jsonRequestBody('DpmExecuteJobRequest'),
        responseSchema: 'DpmExecuteJobResponse',
        statusCode: '202',
      }),
    },
    '/dpm/jobs/{jobId}/report': {
      get: gatewayOperation({
        operationId: 'getDpmValidationReport',
        tags: ['jobs'],
        summary: 'Fetch a DPM execution validation report.',
        parameters: [pathParameter('jobId')],
        responseSchema: 'DpmJobReport',
      }),
    },
  } as const
}
