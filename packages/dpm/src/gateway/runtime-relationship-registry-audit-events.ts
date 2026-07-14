import {
  copyDpmRegistryRelationshipAuditEventRow,
} from '../storage/registry-audit-event.js'
import type {
  DpmGatewayRegistryAuditEventListInput,
  DpmGatewayRegistryAuditEventListResult,
} from './runtime-relationship-types.js'
import {
  createDpmGatewayRuntimeResponse,
} from './runtime-response.js'
import type {
  DpmGatewayRuntimeResponse,
} from './runtime-response-types.js'

export async function listDpmRegistryRelationshipAuditEventsRuntime(
  input: DpmGatewayRegistryAuditEventListInput,
): Promise<DpmGatewayRuntimeResponse<DpmGatewayRegistryAuditEventListResult>> {
  const auditEvents = await input.registryAuditEventRepository.listRelationshipAuditEvents({
    datasetId: input.datasetId,
    registryVersion: input.registryVersion,
    ...(input.relationshipName ? { relationshipName: input.relationshipName } : {}),
  })

  return createDpmGatewayRuntimeResponse({
    operationId: 'listDpmRegistryRelationshipAuditEvents',
    statusCode: 200,
    command: 'list-registry-audit-events',
    result: {
      auditEvents: [...auditEvents].map(copyDpmRegistryRelationshipAuditEventRow),
    },
  })
}
