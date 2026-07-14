import { createKafkaRelationshipHintEdge } from './kafka-profile-hint-edge.js'
import { addKafkaRelationshipHintEvidence } from './kafka-profile-hint-evidence.js'
import {
  createUnresolvedKafkaRelationshipHintSourceDiagnostic,
  kafkaRelationshipHintSourceNodeId,
} from './kafka-profile-hint-diagnostic.js'
import { createKafkaRelationshipHintNode } from './kafka-profile-hint-node.js'
import type { KafkaRelationshipHintAppendInput } from './kafka-profile-hint-types.js'

export type {
  KafkaRelationshipHintAppendInput,
  KafkaRelationshipHintContext,
} from './kafka-profile-hint-types.js'

export function appendKafkaRelationshipHint(input: KafkaRelationshipHintAppendInput): void {
  const evidenceId = addKafkaRelationshipHintEvidence(input)
  const sourceNodeId = kafkaRelationshipHintSourceNodeId(input)

  input.nodes.push(createKafkaRelationshipHintNode(input))
  if (!input.nodes.some(node => node.id === sourceNodeId)) {
    input.diagnostics.push(createUnresolvedKafkaRelationshipHintSourceDiagnostic({
      ...input,
      evidenceId,
    }))
    return
  }

  input.edges.push(createKafkaRelationshipHintEdge({
    ...input,
    evidenceId,
  }))
}
