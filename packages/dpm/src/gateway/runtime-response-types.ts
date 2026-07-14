import type { DpmGatewayRuntimeOperationId } from './runtime-operation-ids.js'

export type DpmGatewayRuntimeStatusCode = 200 | 400
export type DpmGatewayRuntimeCommand =
  | 'inspect-profile'
  | 'analyze-profile'
  | 'list-profile-baseline-summaries'
  | 'review-profile-proposal'
  | 'discover-relationships'
  | 'import-relationship-candidates'
  | 'approve-relationship-candidate'
  | 'approve-profile-relationship-hint'
  | 'export-registry-snapshot'
  | 'list-registry-audit-events'
  | 'validate'
  | 'compile'
  | 'dry-run'

export type DpmGatewayRuntimeBody<TResult> = {
  command: DpmGatewayRuntimeCommand
  result: TResult
}

export type DpmGatewayRuntimeResponse<TResult> = {
  operationId: DpmGatewayRuntimeOperationId
  statusCode: DpmGatewayRuntimeStatusCode
  body: DpmGatewayRuntimeBody<TResult>
}
