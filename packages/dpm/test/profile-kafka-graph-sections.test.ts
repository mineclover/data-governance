import { describe, expect, it } from 'vitest'

import {
  profileKafkaTopicFixture,
  validateDpmProfileArtifactSchema,
  type DpmKafkaTopicProfileFixture,
} from '../src/index.js'
import {
  readKafkaOrdersCreatedProfileArtifact,
} from './support/profile-kafka-fixtures.js'

describe('DPM Kafka topic profile graph sections', () => {
  it('emits partition, key, header, schema, and field metrics from fixture evidence', () => {
    const profile = readKafkaOrdersCreatedProfileArtifact()

    expect(profile.nodes.map(node => node.id)).toEqual(expect.arrayContaining([
      'node:partition:orders.created.0',
      'node:key:orders.created',
      'node:header:orders.created.correlation_id',
      'node:schema-subject:orders%2Ecreated-value',
    ]))
    expect(profile.metrics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'metric:orders.created.key_coverage',
        kind: 'key_coverage_ratio',
        value: 0.998,
      }),
      expect.objectContaining({
        id: 'metric:orders.created.schema_version_count',
        kind: 'schema_version_count',
        value: 2,
      }),
      expect.objectContaining({
        id: 'metric:orders.created.message_rate_estimate',
        kind: 'message_rate_estimate',
        value: 42.5,
      }),
      expect.objectContaining({
        id: 'metric:orders.created.value.customer.customer_no.presence',
        kind: 'presence_ratio',
        value: 0.997,
      }),
      expect.objectContaining({
        id: 'metric:orders.created.value.order.promo_code.null',
        kind: 'null_ratio',
        value: 0.88,
      }),
    ]))
  })

  it('escapes section coordinates and reports empty schema versions without unsafe shape values', () => {
    const result = profileKafkaTopicFixture(specialSectionFixture)
    const profile = result.profileArtifact
    if (!profile) throw new Error('expected Kafka profile artifact')

    const nodesById = new Map(profile.nodes.map(node => [node.id, node]))

    expect(validateDpmProfileArtifactSchema(profile).valid).toBe(true)
    expect(result.observedEvidenceKinds).toContain('diagnostic')
    expect(nodesById.get('node:header:orders.created.trace%2Eid%2Fraw')?.coordinate).toMatchObject({
      path: 'orders.created.header.trace%2Eid%2Fraw',
      pointer: '/headers/trace.id~1raw',
    })
    const schemaNode = nodesById.get('node:schema-subject:orders%2Ecreated%2Fvalue%7Eraw')
    expect(schemaNode).toMatchObject({
      coordinate: {
        path: 'orders.created.schema.orders%2Ecreated%2Fvalue%7Eraw',
        pointer: '/schema',
      },
    })
    expect(schemaNode?.shape).toBeUndefined()
    expect(profile.metrics).toContainEqual(expect.objectContaining({
      id: 'metric:orders.created.schema_version_count',
      kind: 'schema_version_count',
      value: 0,
    }))
    expect(profile.diagnostics).toContainEqual(expect.objectContaining({
      severity: 'warning',
      code: 'PROF302',
      coordinate: expect.objectContaining({
        path: 'orders.created.schema.orders%2Ecreated%2Fvalue%7Eraw',
        pointer: '/schema/versions',
      }),
    }))
    expect(JSON.stringify(profile)).not.toContain('Infinity')
  })
})

const specialSectionFixture = {
  profileId: 'profile:kafka:orders-created-special-sections',
  datasetId: 'orders',
  profileVersion: '2026-07-08',
  createdAt: '2026-07-08T00:00:00.000Z',
  clusterRef: 'kafka://local',
  topic: {
    name: 'orders.created',
    partitions: [0],
    headers: [{
      name: 'trace.id/raw',
      dataType: 'string',
      presenceRatio: 1,
    }],
    schema: {
      subject: 'orders.created/value~raw',
      format: 'avro',
      versions: [],
    },
    value: {
      fields: [{
        name: 'id',
        dataType: 'string',
      }],
    },
  },
} satisfies DpmKafkaTopicProfileFixture
