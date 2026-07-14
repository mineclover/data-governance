import { describe, expect, it } from 'vitest'

import { createDpmGatewayRuntime } from '../src/index.js'
import { createKafkaProfileArtifact } from './support/gateway-runtime-profile-artifact-fixtures.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

describe('DPM gateway profile inspection runtime adapter', () => {
  it('keeps profile inspection output aligned with the gateway response schema', async () => {
    const runtime = createDpmGatewayRuntime()
    const profileArtifact = createKafkaProfileArtifact()
    const response = await runtime.inspectDpmProfile({ profileArtifact })
    const inspectionSchema = compileGatewayComponentSchema('DpmProfileInspectionResponse')

    expect(response.statusCode).toBe(200)
    expect(response.body.command).toBe('inspect-profile')
    expect(response.body.result.nodeCount).toBe(profileArtifact.nodes.length)
    expect(response.body.result.edgeCount).toBe(profileArtifact.edges.length)
    expect(response.body.result.metricCount).toBe(profileArtifact.metrics.length)
    expect(
      inspectionSchema(response.body.result),
      JSON.stringify(inspectionSchema.errors, null, 2),
    ).toBe(true)
  })

  it('returns a defensive profile artifact copy for editor inspection', async () => {
    const runtime = createDpmGatewayRuntime()
    const profileArtifact = createKafkaProfileArtifact()
    const response = await runtime.inspectDpmProfile({ profileArtifact })
    const firstNodeLabel = response.body.result.profileArtifact.nodes[0]?.label
    const evidenceId = Object.keys(profileArtifact.evidenceSources)[0]!
    const responseEvidencePath =
      response.body.result.profileArtifact.evidenceSources[evidenceId]?.coordinate.path

    profileArtifact.nodes[0]!.label = 'mutated after inspection'
    profileArtifact.evidenceSources[evidenceId]!.coordinate.path = 'mutated.after.inspection'
    profileArtifact.diagnostics.push({
      severity: 'warning',
      code: 'PROF999',
      message: 'mutated after inspection',
    })

    expect(response.body.result.profileArtifact.nodes[0]?.label).toBe(firstNodeLabel)
    expect(
      response.body.result.profileArtifact.evidenceSources[evidenceId]?.coordinate.path,
    ).toBe(responseEvidencePath)
    expect(response.body.result.diagnostics.map(diagnostic => diagnostic.code)).not.toContain('PROF999')
  })
})
