import { describe, expect, it } from 'vitest'

import {
  DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES,
  DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID,
  DPM_PROFILE_ARTIFACT_KIND,
  DPM_PROFILE_CONNECTOR_RESULT_KIND,
  profileKafkaTopic,
  profileKafkaTopicFixture,
  validateDpmKafkaTopicProfileInput,
  validateDpmProfileArtifactSchema,
  validateDpmProfileConnectorResult,
} from '../src/index.js'
import {
  readKafkaOrdersCreatedFixture,
} from './support/profile-kafka-fixtures.js'

describe('DPM Kafka topic profile connector', () => {
  it('profiles captured Kafka topic bundles through the product connector contract', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const result = profileKafkaTopic({
      ...fixture,
      connectorId: undefined,
      connectorVersion: undefined,
    })

    expect(result.kind).toBe(DPM_PROFILE_CONNECTOR_RESULT_KIND)
    expect(result.connectorId).toBe(DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID)
    expect(result.sourceKind).toBe('kafka_topic_bundle')
    expect(result.captureMode).toBe('snapshot')
    expect(result.capabilities.captureModes).toEqual([...DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES].sort())
    expect(result.profileArtifact?.kind).toBe(DPM_PROFILE_ARTIFACT_KIND)
    expect(result.profileArtifact?.sources[0]).toMatchObject({
      id: 'source:kafka:orders.created',
      connectorId: DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID,
      kind: 'kafka_topic_bundle',
      captureMode: 'snapshot',
      refs: ['kafka://commerce/orders.created'],
    })
    expect(validateDpmConnector(result)).toBe(true)
    expect(validateDpmProfileArtifactSchema(result.profileArtifact).valid).toBe(true)
    expect(JSON.stringify(result)).not.toContain('rawSample')
  })

  it('profiles Kafka fixture evidence without connecting to Kafka', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const result = profileKafkaTopicFixture(fixture)

    expect(result.kind).toBe(DPM_PROFILE_CONNECTOR_RESULT_KIND)
    expect(result.connectorId).toBe('dpm.kafka.fixture')
    expect(result.sourceKind).toBe('kafka_topic_bundle')
    expect(result.captureMode).toBe('fixture')
    expect(result.status).toBe('completed')
    expect(result.profileArtifact?.kind).toBe(DPM_PROFILE_ARTIFACT_KIND)
    expect(result.profileArtifact?.sources[0]).toMatchObject({
      id: 'source:kafka:orders.created',
      kind: 'kafka_topic_bundle',
      captureMode: 'fixture',
      refs: ['kafka://commerce/orders.created'],
    })
    expect(validateDpmConnector(result)).toBe(true)
    expect(validateDpmProfileArtifactSchema(result.profileArtifact).valid).toBe(true)
    expect(JSON.stringify(result)).not.toContain('rawSample')
  })

  it('returns failed connector diagnostics for malformed captured Kafka topic input', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const malformedInput = {
      ...fixture,
      captureMode: 'live_consumer',
      topic: {
        ...fixture.topic,
        partitions: [0, -1],
        headers: [{
          name: 'correlation_id',
          dataType: 'string',
          presenceRatio: 1.2,
        }],
        value: {
          fields: [{
            name: 'customer_no',
            dataType: 'string',
            presenceRatio: Number.NaN,
          }],
        },
        relationshipHints: [{
          id: 'hint:bad-confidence',
          label: 'bad confidence',
          fromPath: 'value.customer_no',
          toRef: 'catalog://commerce/public.customers.customer_no',
          confidence: 2,
        }],
      },
    }

    const validation = validateDpmKafkaTopicProfileInput(malformedInput)
    const result = profileKafkaTopic(malformedInput as Parameters<typeof profileKafkaTopic>[0])

    expect(validation.valid).toBe(false)
    expect(validation.diagnostics.map(diagnostic => diagnostic.code)).toEqual([
      'CONN201',
      'CONN201',
      'CONN201',
      'CONN201',
      'CONN201',
    ])
    expect(result.kind).toBe(DPM_PROFILE_CONNECTOR_RESULT_KIND)
    expect(result.status).toBe('failed')
    expect(result.captureMode).toBe('snapshot')
    expect(result.profileArtifact).toBeUndefined()
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: 'CONN201',
      message: 'Kafka topic profile captureMode "live_consumer" must be one of: fixture, snapshot, read_only, manual.',
      coordinate: expect.objectContaining({
        path: 'dpm.kafka.topic-profile.input.captureMode',
      }),
    }))
    expect(result.diagnostics.map(diagnostic => diagnostic.coordinate?.path)).toEqual(expect.arrayContaining([
      'dpm.kafka.topic-profile.input.captureMode',
      'dpm.kafka.topic-profile.input.topic.partitions[1]',
      'dpm.kafka.topic-profile.input.topic.headers[0].presenceRatio',
      'dpm.kafka.topic-profile.input.topic.value.fields[0].presenceRatio',
      'dpm.kafka.topic-profile.input.topic.relationshipHints[0].confidence',
    ]))
    expect(validateDpmConnector(result)).toBe(true)
  })

  it('escapes and bounds invalid captureMode diagnostic previews', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const invalidCaptureMode = `live\nconsumer\t${'x'.repeat(80)}`
    const validation = validateDpmKafkaTopicProfileInput({
      ...fixture,
      captureMode: invalidCaptureMode,
    })
    const diagnostic = validation.diagnostics.find(item =>
      item.coordinate?.path === 'dpm.kafka.topic-profile.input.captureMode'
    )

    expect(diagnostic).toMatchObject({
      code: 'CONN201',
      message: expect.stringContaining('"live\\nconsumer\\t'),
    })
    expect(diagnostic?.message).toContain('(truncated)')
    expect(diagnostic?.message).not.toContain('live\nconsumer')
    expect(diagnostic?.message.length).toBeLessThan(180)
  })

  it('accepts relationship hint source selectors as JSON pointers', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const input = {
      ...fixture,
      topic: {
        ...fixture.topic,
        relationshipHints: [{
          id: 'hint:pointer-source',
          label: 'orders.created customer pointer source',
          fromPointer: '/value/customer/customer_no',
          toRef: 'catalog://commerce/public.customers.customer_no',
          confidence: 0.84,
        }],
      },
    }

    const validation = validateDpmKafkaTopicProfileInput(input)
    const result = profileKafkaTopic(input)

    expect(validation.valid).toBe(true)
    expect(result.status).toBe('completed')
    expect(result.profileArtifact?.edges).toContainEqual(expect.objectContaining({
      id: 'edge:relationship-hint:hint:pointer-source',
      kind: 'candidate_relationship',
      fromNodeId: 'node:field:orders.created.value.customer.customer_no',
    }))
    expect(result.profileArtifact?.nodes).toContainEqual(expect.objectContaining({
      id: 'node:relationship-hint:hint:pointer-source',
      shape: expect.objectContaining({
        fromPath: 'value.customer.customer_no',
        fromPointer: '/value/customer/customer_no',
      }),
    }))
    expect(validateDpmConnector(result)).toBe(true)
  })

  it('rejects ambiguous relationship hint source selectors before graph generation', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const withoutSourceSelector = {
      ...fixture,
      topic: {
        ...fixture.topic,
        relationshipHints: [{
          id: 'hint:missing-selector',
          label: 'missing selector',
          toRef: 'catalog://commerce/public.customers.customer_no',
          confidence: 0.84,
        }],
      },
    }
    const mismatchedSelectors = {
      ...fixture,
      topic: {
        ...fixture.topic,
        relationshipHints: [{
          id: 'hint:mismatched-selector',
          label: 'mismatched selector',
          fromPath: 'value.customer.customer_no',
          fromPointer: '/value/customer/tenant_id',
          toRef: 'catalog://commerce/public.customers.customer_no',
          confidence: 0.84,
        }],
      },
    }

    expect(validateDpmKafkaTopicProfileInput(withoutSourceSelector).diagnostics)
      .toContainEqual(expect.objectContaining({
        code: 'CONN201',
        coordinate: expect.objectContaining({
          path: 'dpm.kafka.topic-profile.input.topic.relationshipHints[0]',
        }),
      }))
    expect(profileKafkaTopic(withoutSourceSelector as Parameters<typeof profileKafkaTopic>[0]).status).toBe('failed')
    expect(validateDpmKafkaTopicProfileInput(mismatchedSelectors).diagnostics)
      .toContainEqual(expect.objectContaining({
        code: 'CONN201',
        coordinate: expect.objectContaining({
          path: 'dpm.kafka.topic-profile.input.topic.relationshipHints[0]',
        }),
      }))
    expect(profileKafkaTopic(mismatchedSelectors).status).toBe('failed')
  })

  it('does not throw when fixture callers pass a malformed runtime value', () => {
    const result = profileKafkaTopicFixture(undefined as Parameters<typeof profileKafkaTopicFixture>[0])

    expect(result.connectorId).toBe('dpm.kafka.fixture')
    expect(result.captureMode).toBe('fixture')
    expect(result.status).toBe('failed')
    expect(result.profileArtifact).toBeUndefined()
    expect(result.diagnostics.map(diagnostic => diagnostic.coordinate?.path)).toEqual(expect.arrayContaining([
      'dpm.kafka.topic-profile.input.topic',
      'dpm.kafka.topic-profile.input.profileId',
    ]))
    expect(validateDpmConnector(result)).toBe(true)
  })
})

function validateDpmConnector(result: ReturnType<typeof profileKafkaTopicFixture>): boolean {
  const validation = validateDpmProfileConnectorResult(result)
  expect(validation.diagnostics, JSON.stringify(validation.diagnostics, null, 2)).toEqual([])
  return validation.valid
}
