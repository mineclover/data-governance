import { describe, expect, it } from 'vitest'

import {
  normalizeDpmProfileArtifact,
  normalizeDpmProfileConnectorResult,
  type DpmProfileConnectorResult,
  validateDpmProfileConnectorResult,
} from '../src/index.js'
import { createKafkaProfileArtifactInput } from './support/profile-connector-kafka-artifact-inputs.js'
import { createKafkaProfileConnectorResult } from './support/profile-connector-kafka-result-fixtures.js'
import { createFailedKafkaProfileConnectorResult } from './support/profile-connector-failed-result-fixtures.js'

describe('DPM profile connector validation — payload gates', () => {
  it('keeps connector failures as diagnostic payloads', () => {
    const result = createFailedKafkaProfileConnectorResult()
    const missingDiagnostic = normalizeDpmProfileConnectorResult({
      ...result,
      status: 'failed',
      diagnostics: [],
    })

    expect(result.profileArtifact).toBeUndefined()
    expect(validateDpmProfileConnectorResult(result).valid).toBe(true)
    expect(
      validateDpmProfileConnectorResult(missingDiagnostic).diagnostics.map(
        diagnostic => diagnostic.code,
      ),
    ).toContain('CONN105')
  })

  it('rejects schema-valid profile artifacts with broken graph references', () => {
    const baseInput = createKafkaProfileArtifactInput()
    const profileArtifact = normalizeDpmProfileArtifact({
      ...baseInput,
      sources: [
        ...baseInput.sources,
        baseInput.sources[0]!,
      ],
      evidenceSources: {
        ...baseInput.evidenceSources,
        'evidence:kafka:missing-source': {
          coordinate: {
            kind: 'kafka_topic_bundle',
            sourceId: 'source:kafka:missing',
            path: 'orders.created.missing-source',
          },
          connectorId: 'dpm.kafka.fixture',
        },
      },
      nodes: [
        ...baseInput.nodes,
        baseInput.nodes[0]!,
      ],
      edges: [
        ...baseInput.edges,
        {
          id: 'edge:orders.created.contains.missing-field',
          kind: 'contains',
          fromNodeId: 'node:kafka:missing-topic',
          toNodeId: 'node:kafka:missing-field',
          evidenceIds: ['evidence:kafka:missing-field'],
        },
      ],
      metrics: [
        ...baseInput.metrics,
        {
          id: 'metric:orders.created.missing-field.presence',
          kind: 'presence_ratio',
          subjectId: 'node:kafka:missing-field',
          value: 0.8,
          unit: 'ratio',
          evidenceIds: ['evidence:kafka:missing-metric'],
        },
      ],
      diagnostics: [
        {
          severity: 'warning',
          code: 'PROF301',
          message: 'Fixture diagnostic references missing evidence.',
          evidenceIds: ['evidence:kafka:missing-diagnostic'],
        },
      ],
    })
    const result = createKafkaProfileConnectorResult({ profileArtifact })
    const validation = validateDpmProfileConnectorResult(result)

    expect(validation.valid).toBe(false)
    expect(validation.diagnostics.map(diagnostic => diagnostic.code)).toEqual(expect.arrayContaining([
      'CONN109',
      'CONN110',
      'CONN111',
      'CONN112',
      'CONN113',
    ]))
    expect(validation.diagnostics).toContainEqual(expect.objectContaining({
      code: 'CONN109',
      message: `Profile artifact contains duplicate source id ${baseInput.sources[0]!.id}.`,
    }))
  })

  it('returns diagnostics instead of throwing for schema-invalid profile artifacts', () => {
    const profileArtifact = normalizeDpmProfileArtifact(createKafkaProfileArtifactInput())
    const result = createKafkaProfileConnectorResult({ profileArtifact })
    const invalidResult = {
      ...result,
      profileArtifact: {
        ...profileArtifact,
        nodes: [
          {
            id: 'node:field:missing-provenance',
            kind: 'message_field',
            label: 'missing provenance',
          },
        ],
      },
    } as unknown as DpmProfileConnectorResult
    let validation: ReturnType<typeof validateDpmProfileConnectorResult> | undefined

    expect(() => {
      validation = validateDpmProfileConnectorResult(invalidResult)
    }).not.toThrow()
    expect(validation?.valid).toBe(false)
    expect(validation?.diagnostics.map(diagnostic => diagnostic.code)).toContain('CONN107')
    expect(validation?.diagnostics.map(diagnostic => diagnostic.code)).not.toContain('CONN113')
  })
})
