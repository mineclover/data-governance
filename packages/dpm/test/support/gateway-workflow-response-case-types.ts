import type {
  GatewayWorkflowResponseSchemaName,
} from './gateway-workflow-response-schema-fixtures.js'

export type GatewayMinimalResponseCase =
  readonly [GatewayWorkflowResponseSchemaName, Record<string, unknown>]

