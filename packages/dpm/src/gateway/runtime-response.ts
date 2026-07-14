export function createDpmGatewayRuntimeResponse<
  TOperationId extends string,
  TStatusCode extends number,
  TCommand extends string,
  TResult,
>(input: {
  operationId: TOperationId
  statusCode: TStatusCode
  command: TCommand
  result: TResult
}) {
  return {
    operationId: input.operationId,
    statusCode: input.statusCode,
    body: {
      command: input.command,
      result: input.result,
    },
  }
}
