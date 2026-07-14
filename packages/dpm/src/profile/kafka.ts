import { normalizeDpmProfileArtifact } from './artifact.js'
import { DPM_PROFILE_CONNECTOR_EVIDENCE_KINDS } from './connector-evidence-taxonomy.js'
import { normalizeDpmProfileConnectorResult } from './connector-result.js'
import type { DpmProfileConnectorResult } from './connector-types.js'
import type {
  DpmKafkaTopicProfileFixture,
} from './kafka-fixture-profile-types.js'
import {
  DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES,
  type DpmKafkaTopicProfileCaptureMode,
  type DpmKafkaTopicProfileInput,
} from './kafka-topic-profile-input-types.js'
import {
  validateDpmKafkaTopicProfileInput,
} from './kafka-topic-profile-input-validation.js'
import { createKafkaTopicProfileArtifactInput } from './kafka-topic-profile.js'

export const DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID = 'dpm.kafka.topic-profile' as const
export const DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_VERSION = '0.1.0' as const
export const DPM_KAFKA_TOPIC_FIXTURE_CONNECTOR_ID = 'dpm.kafka.fixture' as const

export function profileKafkaTopic(input: DpmKafkaTopicProfileInput): DpmProfileConnectorResult {
  const connectorId = getOptionalNonEmptyString(input, 'connectorId') ?? DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID
  const connectorVersion = getOptionalNonEmptyString(input, 'connectorVersion') ??
    DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_VERSION
  const captureMode = getKafkaCaptureMode(input) ?? 'snapshot'
  const inputValidation = validateDpmKafkaTopicProfileInput(input, { connectorId })
  if (!inputValidation.valid) {
    return createKafkaTopicProfileFailedResult({
      connectorId,
      connectorVersion,
      captureMode,
      diagnostics: inputValidation.diagnostics,
    })
  }

  const profileArtifactInput = createKafkaTopicProfileArtifactInput({
    input,
    connectorId,
    connectorVersion,
    captureMode,
  })
  const profileArtifact = normalizeDpmProfileArtifact(profileArtifactInput)

  return normalizeDpmProfileConnectorResult({
    connectorId,
    connectorVersion,
    sourceKind: 'kafka_topic_bundle',
    captureMode,
    status: 'completed',
    capabilities: createKafkaTopicProfileCapabilities(connectorId, connectorVersion),
    observedEvidenceKinds: [
      'source',
      'evidence_source',
      'node',
      'edge',
      'metric',
      ...(profileArtifact.diagnostics.length > 0 ? ['diagnostic' as const] : []),
    ],
    diagnostics: [],
    profileArtifact,
  })
}

export function profileKafkaTopicFixture(input: DpmKafkaTopicProfileFixture): DpmProfileConnectorResult {
  const connectorId = getOptionalNonEmptyString(input, 'connectorId') ?? DPM_KAFKA_TOPIC_FIXTURE_CONNECTOR_ID
  const connectorVersion = getOptionalNonEmptyString(input, 'connectorVersion') ??
    DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_VERSION

  return profileKafkaTopic({
    ...(isRecord(input) ? input : {}),
    connectorId,
    connectorVersion,
    captureMode: 'fixture',
  } as DpmKafkaTopicProfileInput)
}

function createKafkaTopicProfileFailedResult(input: {
  connectorId: string
  connectorVersion: string
  captureMode: DpmKafkaTopicProfileCaptureMode
  diagnostics: DpmProfileConnectorResult['diagnostics']
}): DpmProfileConnectorResult {
  return normalizeDpmProfileConnectorResult({
    connectorId: input.connectorId,
    connectorVersion: input.connectorVersion,
    sourceKind: 'kafka_topic_bundle',
    captureMode: input.captureMode,
    status: 'failed',
    capabilities: createKafkaTopicProfileCapabilities(input.connectorId, input.connectorVersion),
    observedEvidenceKinds: [],
    diagnostics: input.diagnostics,
  })
}

function createKafkaTopicProfileCapabilities(
  connectorId: string,
  connectorVersion: string,
): DpmProfileConnectorResult['capabilities'] {
  return {
    connectorId,
    connectorVersion,
    sourceKinds: ['kafka_topic_bundle'],
    captureModes: [...DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES],
    supportedEvidenceKinds: [...DPM_PROFILE_CONNECTOR_EVIDENCE_KINDS],
    skippedEvidenceKinds: [],
  }
}

function getKafkaCaptureMode(input: unknown): DpmKafkaTopicProfileCaptureMode | undefined {
  const captureMode = getOptionalNonEmptyString(input, 'captureMode')
  if (
    captureMode &&
    (DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES as readonly string[]).includes(captureMode)
  ) {
    return captureMode as DpmKafkaTopicProfileCaptureMode
  }

  return undefined
}

function getOptionalNonEmptyString(input: unknown, key: string): string | undefined {
  if (!isRecord(input)) return undefined
  const value = input[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
