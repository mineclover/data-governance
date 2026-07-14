import {
  escapeKafkaProfilePathSegment,
} from './kafka-profile-path.js'
import type { KafkaRelationshipHintContext } from './kafka-profile-hint-types.js'

export function kafkaRelationshipHintSourcePath(input: KafkaRelationshipHintContext): string {
  if (isNonEmptyString(input.hint.fromPath)) return input.hint.fromPath
  if (isNonEmptyString(input.hint.fromPointer)) return kafkaProfilePathFromPointer(input.hint.fromPointer)

  return ''
}

export function kafkaRelationshipHintSourceRef(input: KafkaRelationshipHintContext): string {
  return input.hint.fromPath ?? input.hint.fromPointer ?? ''
}

export function kafkaProfilePathFromPointer(pointer: string): string {
  if (!isKafkaProfileJsonPointer(pointer)) return ''

  return pointer
    .split('/')
    .slice(1)
    .map(decodeKafkaProfilePointerSegment)
    .map(escapeKafkaProfilePathSegment)
    .join('.')
}

export function isKafkaProfileJsonPointer(value: string): boolean {
  return value.startsWith('/') && value.length > 1
}

function decodeKafkaProfilePointerSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}
