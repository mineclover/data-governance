import type {
  DpmGatewayProfileInspectionInput,
  DpmGatewayProfileInspectionResult,
} from './runtime-profile-types.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'
import { copyDpmProfileArtifact } from '../profile/artifact-envelope-copy.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'

export async function inspectDpmProfileRuntime(
  input: DpmGatewayProfileInspectionInput,
): Promise<DpmGatewayRuntimeResponse<DpmGatewayProfileInspectionResult>> {
  const profileArtifact = copyDpmProfileArtifact(input.profileArtifact)

  return createDpmGatewayRuntimeResponse({
    operationId: 'inspectDpmProfile',
    statusCode: 200,
    command: 'inspect-profile',
    result: {
      profileArtifact,
      nodeCount: profileArtifact.nodes.length,
      edgeCount: profileArtifact.edges.length,
      metricCount: profileArtifact.metrics.length,
      diagnostics: profileArtifact.diagnostics,
    },
  })
}
