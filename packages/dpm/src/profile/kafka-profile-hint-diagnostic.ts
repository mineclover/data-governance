import {
  kafkaCoordinate,
  kafkaFieldNodeIdFor,
} from './kafka-profile-evidence.js'
import {
  kafkaRelationshipHintPath,
  kafkaRelationshipHintPointer,
} from './kafka-profile-hint-identity.js'
import {
  kafkaRelationshipHintSourcePath,
  kafkaRelationshipHintSourceRef,
} from './kafka-profile-hint-source.js'
import type { KafkaRelationshipHintContext } from './kafka-profile-hint-types.js'
import type { DpmProfileDiagnostic } from './profile-artifact-types.js'

export type UnresolvedKafkaRelationshipHintSourceDiagnosticInput = KafkaRelationshipHintContext & {
  evidenceId: string
}

export function kafkaRelationshipHintSourceNodeId(input: KafkaRelationshipHintContext): string {
  return kafkaFieldNodeIdFor(input.topicName, kafkaRelationshipHintSourcePath(input))
}

export function createUnresolvedKafkaRelationshipHintSourceDiagnostic(
  input: UnresolvedKafkaRelationshipHintSourceDiagnosticInput,
): DpmProfileDiagnostic {
  return {
    severity: 'warning',
    code: 'PROF301',
    message: `Kafka relationship hint ${input.hint.id} references unresolved source field ${kafkaRelationshipHintSourceRef(input)}.`,
    connectorId: input.connectorId,
    coordinate: kafkaCoordinate(
      input.sourceId,
      kafkaRelationshipHintPath(input),
      kafkaRelationshipHintPointer(input),
    ),
    evidenceIds: [input.evidenceId],
  }
}
