import {
  escapeKafkaProfilePointerSegment,
} from './kafka-profile-path.js'
import type { KafkaRelationshipHintContext } from './kafka-profile-hint-types.js'

export function kafkaRelationshipHintEvidenceId(input: KafkaRelationshipHintContext): string {
  return `evidence:kafka:${input.topicName}.relationship_hint.${kafkaRelationshipHintIdentitySegment(input)}`
}

export function kafkaRelationshipHintNodeId(input: KafkaRelationshipHintContext): string {
  return `node:relationship-hint:${kafkaRelationshipHintIdentitySegment(input)}`
}

export function kafkaRelationshipHintEdgeId(input: KafkaRelationshipHintContext): string {
  return `edge:relationship-hint:${kafkaRelationshipHintIdentitySegment(input)}`
}

export function kafkaRelationshipHintPath(input: KafkaRelationshipHintContext): string {
  return `${input.topicName}.relationshipHints.${kafkaRelationshipHintIdentitySegment(input)}`
}

export function kafkaRelationshipHintPointer(input: KafkaRelationshipHintContext): string {
  return `/relationshipHints/${escapeKafkaProfilePointerSegment(input.hint.id)}`
}

export function kafkaRelationshipHintIdentitySegment(input: KafkaRelationshipHintContext): string {
  return [...input.hint.id].map(escapeKafkaRelationshipHintIdentityChar).join('')
}

function escapeKafkaRelationshipHintIdentityChar(char: string): string {
  if (/^[A-Za-z0-9_:-]$/.test(char)) return char

  const encoded = encodeURIComponent(char)
  if (encoded !== char) return encoded.toUpperCase()

  return `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
}
