import {
  profileKafkaTopicFixture,
  type DpmKafkaTopicProfileFixture,
  type DpmProfileArtifact,
} from '../../src/index.js'
import {
  readKafkaOrdersCreatedFixture,
} from './profile-kafka-fixtures.js'

export const expectedKafkaRelationshipHintEvidenceIds = [
  'evidence:kafka:orders.created.relationship_hint.hint:orders-created-customer',
] as const

export function createKafkaProfileArtifact(): DpmProfileArtifact {
  return createKafkaProfileArtifactFromFixture(readKafkaOrdersCreatedFixture())
}

export function createKafkaProfileArtifactWithCustomerNoPresence(
  presenceRatio: number,
): DpmProfileArtifact {
  const fixture = readKafkaOrdersCreatedFixture()

  return createKafkaProfileArtifactFromFixture({
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
                    ? { ...child, presenceRatio }
                    : child,
                ),
              }
            : field,
        ),
      },
    },
  })
}

function createKafkaProfileArtifactFromFixture(
  fixture: DpmKafkaTopicProfileFixture,
): DpmProfileArtifact {
  const result = profileKafkaTopicFixture(fixture)
  if (!result.profileArtifact) throw new Error('expected Kafka profile artifact')
  return result.profileArtifact
}
