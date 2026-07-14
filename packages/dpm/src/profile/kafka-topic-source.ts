import { createHash } from 'node:crypto'

import type { DpmKafkaTopicProfileInput } from './kafka-topic-profile-input-types.js'
import type { DpmProfileSourceDescriptor } from './profile-source-types.js'

export function kafkaTopicSourceId(topicName: string): string {
  return `source:kafka:${topicName}`
}

export function createKafkaTopicSourceDescriptor(input: {
  profile: DpmKafkaTopicProfileInput
  connectorId: string
  connectorVersion: string
  captureMode: DpmKafkaTopicProfileInput['captureMode']
}): DpmProfileSourceDescriptor {
  const { profile, connectorId, connectorVersion, captureMode } = input
  return {
    id: kafkaTopicSourceId(profile.topic.name),
    kind: 'kafka_topic_bundle',
    connectorId,
    connectorVersion,
    refs: [joinKafkaRef(profile.clusterRef, profile.topic.name)],
    captureMode: captureMode ?? 'snapshot',
    sourceVersionHash: computeKafkaProfileVersionHash(profile),
  }
}

function joinKafkaRef(clusterRef: string, topicName: string): string {
  return `${clusterRef.replace(/\/$/, '')}/${topicName}`
}

function computeKafkaProfileVersionHash(input: DpmKafkaTopicProfileInput): string {
  return `sha256:${createHash('sha256').update(stableStringify({
    clusterRef: input.clusterRef,
    topic: input.topic,
  })).digest('hex')}`
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value))
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value

  const record = value as Record<string, unknown>
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(record).sort()) {
    const next = record[key]
    if (next !== undefined) sorted[key] = sortValue(next)
  }
  return sorted
}
