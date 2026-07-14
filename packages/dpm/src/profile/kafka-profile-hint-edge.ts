import {
  kafkaFieldNodeIdFor,
} from './kafka-profile-evidence.js'
import {
  kafkaRelationshipHintEdgeId,
  kafkaRelationshipHintNodeId,
} from './kafka-profile-hint-identity.js'
import {
  kafkaRelationshipHintSourcePath,
} from './kafka-profile-hint-source.js'
import type { KafkaRelationshipHintContext } from './kafka-profile-hint-types.js'
import type { DpmProfileEdge } from './profile-graph-types.js'

export type KafkaRelationshipHintEdgeInput = KafkaRelationshipHintContext & {
  evidenceId: string
}

export function createKafkaRelationshipHintEdge(input: KafkaRelationshipHintEdgeInput): DpmProfileEdge {
  return {
    id: kafkaRelationshipHintEdgeId(input),
    kind: 'candidate_relationship',
    fromNodeId: kafkaFieldNodeIdFor(input.topicName, kafkaRelationshipHintSourcePath(input)),
    toNodeId: kafkaRelationshipHintNodeId(input),
    confidence: input.hint.confidence,
    evidenceIds: [input.evidenceId],
  }
}
