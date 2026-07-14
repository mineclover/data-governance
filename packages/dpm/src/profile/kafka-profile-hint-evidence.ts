import {
  addKafkaEvidence,
} from './kafka-profile-evidence.js'
import {
  kafkaRelationshipHintEvidenceId,
  kafkaRelationshipHintPath,
  kafkaRelationshipHintPointer,
} from './kafka-profile-hint-identity.js'
import type { KafkaRelationshipHintContext } from './kafka-profile-hint-types.js'
import type { DpmProfileEvidenceSource } from './profile-source-types.js'

export type KafkaRelationshipHintEvidenceInput = KafkaRelationshipHintContext & {
  evidenceSources: Record<string, DpmProfileEvidenceSource>
}

export function addKafkaRelationshipHintEvidence(input: KafkaRelationshipHintEvidenceInput): string {
  return addKafkaEvidence(input.evidenceSources, {
    id: kafkaRelationshipHintEvidenceId(input),
    sourceId: input.sourceId,
    connectorId: input.connectorId,
    path: kafkaRelationshipHintPath(input),
    pointer: kafkaRelationshipHintPointer(input),
    description: input.hint.evidenceRef,
  })
}
