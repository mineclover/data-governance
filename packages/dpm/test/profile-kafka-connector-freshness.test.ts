import { describe, expect, it } from 'vitest'

import {
  profileKafkaTopic,
  profileKafkaTopicFixture,
} from '../src/index.js'
import {
  readKafkaOrdersCreatedFixture,
} from './support/profile-kafka-fixtures.js'

describe('DPM Kafka topic profile connector freshness', () => {
  it('keeps source freshness stable when only profile run metadata changes', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const original = profileKafkaTopic(fixture)
    const rerun = profileKafkaTopic({
      ...fixture,
      profileId: 'profile:kafka:orders-created-rerun',
      profileVersion: '2026-07-08',
      createdAt: '2026-07-08T00:00:00.000Z',
    })

    expect(rerun.profileArtifact?.freshness.sourceVersionHashes).toEqual(
      original.profileArtifact?.freshness.sourceVersionHashes,
    )
    expect(rerun.profileArtifact?.freshness.versionHash).not.toBe(
      original.profileArtifact?.freshness.versionHash,
    )
  })

  it('changes connector freshness when fixture field evidence changes', () => {
    const fixture = readKafkaOrdersCreatedFixture()
    const original = profileKafkaTopicFixture(fixture)
    const changed = profileKafkaTopicFixture({
      ...fixture,
      topic: {
        ...fixture.topic,
        value: {
          fields: fixture.topic.value.fields.map(field =>
            field.name === 'customer'
              ? {
                  ...field,
                  fields: field.fields?.map(child =>
                    child.name === 'customer_no'
                      ? { ...child, presenceRatio: 0.91 }
                      : child,
                  ),
                }
              : field,
          ),
        },
      },
    })

    expect(changed.profileArtifact?.freshness.versionHash).not.toBe(original.profileArtifact?.freshness.versionHash)
    expect(changed.freshness.runHash).not.toBe(original.freshness.runHash)
  })
})
