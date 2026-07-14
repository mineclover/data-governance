import { describe, expect, it } from 'vitest'

import {
  profileKafkaTopicFixture,
  type DpmKafkaTopicProfileFixture,
  type DpmProfileArtifact,
} from '../src/index.js'
import {
  readKafkaOrdersCreatedProfileArtifact,
} from './support/profile-kafka-fixtures.js'

describe('DPM Kafka topic profile graph fields', () => {
  it('flattens nested message fields into stable profile nodes and edges', () => {
    const profile = readKafkaOrdersCreatedProfileArtifact()
    const nodesById = new Map(profile.nodes.map(node => [node.id, node]))
    const edgePairs = profile.edges.map(edge => `${edge.fromNodeId}->${edge.toNodeId}`)

    expect(nodesById.get('node:field:orders.created.value.customer')?.kind).toBe('message_field')
    expect(nodesById.get('node:field:orders.created.value.customer.customer_no')).toMatchObject({
      kind: 'message_field',
      label: 'value.customer.customer_no',
      dataType: 'string',
      coordinate: {
        kind: 'kafka_topic_bundle',
        path: 'orders.created.value.customer.customer_no',
        pointer: '/value/customer/customer_no',
      },
    })
    expect(edgePairs).toContain('node:topic:orders.created->node:field:orders.created.value.customer')
    expect(edgePairs).toContain('node:field:orders.created.value.customer->node:field:orders.created.value.customer.customer_no')
  })

  it('escapes unsafe field path segments without collapsing distinct field identities', () => {
    const profile = createSpecialFieldProfileArtifact()
    const nodesById = new Map(profile.nodes.map(node => [node.id, node]))

    expect(new Set(profile.nodes.map(node => node.id)).size).toBe(profile.nodes.length)
    expect(nodesById.get('node:field:orders.created.value.customer%2Eno')?.coordinate).toMatchObject({
      path: 'orders.created.value.customer%2Eno',
      pointer: '/value/customer.no',
    })
    expect(nodesById.get('node:field:orders.created.value.customer.no')?.coordinate).toMatchObject({
      path: 'orders.created.value.customer.no',
      pointer: '/value/customer/no',
    })
    expect(nodesById.get('node:field:orders.created.value.customer%2Eno.id%2Fvalue%7Eraw')).toMatchObject({
      kind: 'message_field',
      label: 'value.customer%2Eno.id%2Fvalue%7Eraw',
      coordinate: {
        kind: 'kafka_topic_bundle',
        path: 'orders.created.value.customer%2Eno.id%2Fvalue%7Eraw',
        pointer: '/value/customer.no/id~1value~0raw',
      },
    })
    expect(profile.edges).toContainEqual(expect.objectContaining({
      id: 'edge:relationship-hint:hint:special-field',
      kind: 'candidate_relationship',
      fromNodeId: 'node:field:orders.created.value.customer%2Eno.id%2Fvalue%7Eraw',
      confidence: 0.88,
    }))
  })
})

function createSpecialFieldProfileArtifact(): DpmProfileArtifact {
  const result = profileKafkaTopicFixture(specialFieldFixture)
  if (!result.profileArtifact) throw new Error('expected Kafka profile artifact')
  return result.profileArtifact
}

const specialFieldFixture = {
  profileId: 'profile:kafka:orders-created-special-fields',
  datasetId: 'orders',
  profileVersion: '2026-07-07',
  createdAt: '2026-07-07T00:00:00.000Z',
  connectorId: 'connector:kafka-fixture',
  connectorVersion: '0.0.0-test',
  clusterRef: 'kafka://local',
  topic: {
    name: 'orders.created',
    partitions: [0],
    value: {
      fields: [
        {
          name: 'customer.no',
          dataType: 'object',
          fields: [
            {
              name: 'id/value~raw',
              dataType: 'string',
            },
          ],
        },
        {
          name: 'customer',
          dataType: 'object',
          fields: [
            {
              name: 'no',
              dataType: 'string',
            },
          ],
        },
      ],
    },
    relationshipHints: [
      {
        id: 'hint:special-field',
        label: 'special field candidate',
        fromPointer: '/value/customer.no/id~1value~0raw',
        toRef: 'catalog://customers/customer_id',
        confidence: 0.88,
      },
    ],
  },
} satisfies DpmKafkaTopicProfileFixture
