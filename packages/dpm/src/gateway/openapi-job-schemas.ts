import {
  arrayOf,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayJobSchemas() {
  return {
    DpmExecuteJobRequest: requiredObjectSchema({
      planRef: stringSchema(),
      targetDatasetRef: stringSchema(),
    }),
    DpmExecuteJobResponse: requiredObjectSchema({
      jobId: stringSchema(),
      status: { type: 'string', enum: ['accepted'] },
    }),
    DpmJobReport: requiredObjectSchema({
      jobId: stringSchema(),
      status: { type: 'string', enum: ['completed', 'failed'] },
      validationReportRef: stringSchema(),
      diagnostics: arrayOf(ref('DpmDiagnostic')),
    }),
  } as const
}
