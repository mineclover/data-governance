import {
  DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES,
} from './kafka-topic-profile-input-types.js'
import {
  isKafkaProfileJsonPointer,
  kafkaProfilePathFromPointer,
} from './kafka-profile-hint-source.js'
import type { DpmProfileDiagnostic } from './profile-artifact-types.js'

export type DpmKafkaTopicProfileInputValidationOptions = {
  connectorId?: string
}

export type DpmKafkaTopicProfileInputValidationResult = {
  valid: boolean
  diagnostics: DpmProfileDiagnostic[]
}

type ValidationContext = {
  connectorId?: string
  diagnostics: DpmProfileDiagnostic[]
}

const invalidCaptureModePreviewLength = 64

export function validateDpmKafkaTopicProfileInput(
  input: unknown,
  options: DpmKafkaTopicProfileInputValidationOptions = {},
): DpmKafkaTopicProfileInputValidationResult {
  const context: ValidationContext = {
    diagnostics: [],
    ...(options.connectorId ? { connectorId: options.connectorId } : {}),
  }
  const root = requireRecord(context, input, '')
  if (!root) return validationResult(context)

  requireNonEmptyString(context, root, 'profileId', 'profileId')
  requireNonEmptyString(context, root, 'datasetId', 'datasetId')
  requireNonEmptyString(context, root, 'profileVersion', 'profileVersion')
  requireNonEmptyString(context, root, 'createdAt', 'createdAt')
  requireNonEmptyString(context, root, 'clusterRef', 'clusterRef')
  optionalNonEmptyString(context, root, 'connectorId', 'connectorId')
  optionalNonEmptyString(context, root, 'connectorVersion', 'connectorVersion')
  validateCaptureMode(context, root.captureMode)

  const topic = requireRecordProperty(context, root, 'topic', 'topic')
  if (topic) validateTopic(context, topic, 'topic')

  return validationResult(context)
}

function validateTopic(context: ValidationContext, topic: Record<string, unknown>, path: string): void {
  requireNonEmptyString(context, topic, 'name', `${path}.name`)
  validatePartitions(context, topic, path)
  optionalNonNegativeNumber(context, topic, 'messageRateEstimate', `${path}.messageRateEstimate`)
  validateKey(context, topic, path)
  validateHeaders(context, topic, path)
  validateSchema(context, topic, path)
  validateValue(context, topic, path)
  validateRelationshipHints(context, topic, path)
}

function validatePartitions(context: ValidationContext, topic: Record<string, unknown>, path: string): void {
  const partitions = requireArrayProperty(context, topic, 'partitions', `${path}.partitions`)
  if (!partitions) return

  partitions.forEach((partition, index) => {
    if (typeof partition !== 'number' || !Number.isInteger(partition) || partition < 0) {
      addDiagnostic(context, `${path}.partitions[${index}]`, 'Kafka topic partition ids must be non-negative integers.')
    }
  })
}

function validateKey(context: ValidationContext, topic: Record<string, unknown>, path: string): void {
  const key = optionalRecordProperty(context, topic, 'key', `${path}.key`)
  if (!key) return

  requireNonEmptyString(context, key, 'dataType', `${path}.key.dataType`)
  optionalRatio(context, key, 'coverageRatio', `${path}.key.coverageRatio`)
}

function validateHeaders(context: ValidationContext, topic: Record<string, unknown>, path: string): void {
  const headers = optionalArrayProperty(context, topic, 'headers', `${path}.headers`)
  if (!headers) return

  headers.forEach((header, index) => {
    const headerRecord = requireRecord(context, header, `${path}.headers[${index}]`)
    if (!headerRecord) return

    requireNonEmptyString(context, headerRecord, 'name', `${path}.headers[${index}].name`)
    requireNonEmptyString(context, headerRecord, 'dataType', `${path}.headers[${index}].dataType`)
    optionalRatio(context, headerRecord, 'presenceRatio', `${path}.headers[${index}].presenceRatio`)
  })
}

function validateSchema(context: ValidationContext, topic: Record<string, unknown>, path: string): void {
  const schema = optionalRecordProperty(context, topic, 'schema', `${path}.schema`)
  if (!schema) return

  requireNonEmptyString(context, schema, 'subject', `${path}.schema.subject`)
  requireNonEmptyString(context, schema, 'format', `${path}.schema.format`)
  const versions = requireArrayProperty(context, schema, 'versions', `${path}.schema.versions`)
  if (!versions) return

  versions.forEach((version, index) => {
    if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
      addDiagnostic(context, `${path}.schema.versions[${index}]`, 'Kafka schema versions must be positive integers.')
    }
  })
}

function validateValue(context: ValidationContext, topic: Record<string, unknown>, path: string): void {
  const value = requireRecordProperty(context, topic, 'value', `${path}.value`)
  if (!value) return

  const fields = requireArrayProperty(context, value, 'fields', `${path}.value.fields`)
  if (!fields) return

  fields.forEach((field, index) => validateField(context, field, `${path}.value.fields[${index}]`))
}

function validateField(context: ValidationContext, field: unknown, path: string): void {
  const fieldRecord = requireRecord(context, field, path)
  if (!fieldRecord) return

  requireNonEmptyString(context, fieldRecord, 'name', `${path}.name`)
  requireNonEmptyString(context, fieldRecord, 'dataType', `${path}.dataType`)
  optionalRatio(context, fieldRecord, 'presenceRatio', `${path}.presenceRatio`)
  optionalRatio(context, fieldRecord, 'nullRatio', `${path}.nullRatio`)

  const childFields = optionalArrayProperty(context, fieldRecord, 'fields', `${path}.fields`)
  if (!childFields) return

  childFields.forEach((childField, index) => validateField(context, childField, `${path}.fields[${index}]`))
}

function validateRelationshipHints(context: ValidationContext, topic: Record<string, unknown>, path: string): void {
  const relationshipHints = optionalArrayProperty(context, topic, 'relationshipHints', `${path}.relationshipHints`)
  if (!relationshipHints) return

  relationshipHints.forEach((hint, index) => {
    const hintRecord = requireRecord(context, hint, `${path}.relationshipHints[${index}]`)
    if (!hintRecord) return

    requireNonEmptyString(context, hintRecord, 'id', `${path}.relationshipHints[${index}].id`)
    requireNonEmptyString(context, hintRecord, 'label', `${path}.relationshipHints[${index}].label`)
    validateRelationshipHintSourceSelector(context, hintRecord, `${path}.relationshipHints[${index}]`)
    requireNonEmptyString(context, hintRecord, 'toRef', `${path}.relationshipHints[${index}].toRef`)
    optionalNonEmptyString(context, hintRecord, 'evidenceRef', `${path}.relationshipHints[${index}].evidenceRef`)
    requireRatio(context, hintRecord, 'confidence', `${path}.relationshipHints[${index}].confidence`)
  })
}

function validateRelationshipHintSourceSelector(
  context: ValidationContext,
  hintRecord: Record<string, unknown>,
  path: string,
): void {
  optionalNonEmptyString(context, hintRecord, 'fromPath', `${path}.fromPath`)
  optionalNonEmptyString(context, hintRecord, 'fromPointer', `${path}.fromPointer`)

  const fromPath = hintRecord.fromPath
  const fromPointer = hintRecord.fromPointer
  const hasFromPath = isNonEmptyString(fromPath)
  const hasFromPointer = isNonEmptyString(fromPointer)
  if (!hasFromPath && !hasFromPointer) {
    addDiagnostic(context, path, 'Kafka relationship hint must include fromPath or fromPointer.')
    return
  }

  if (!hasFromPointer) return
  if (!isKafkaProfileJsonPointer(fromPointer)) {
    addDiagnostic(context, `${path}.fromPointer`, 'Kafka relationship hint fromPointer must be a JSON Pointer starting with "/".')
    return
  }

  if (hasFromPath && kafkaProfilePathFromPointer(fromPointer) !== fromPath) {
    addDiagnostic(context, path, 'Kafka relationship hint fromPath and fromPointer must resolve to the same field path.')
  }
}

function validateCaptureMode(context: ValidationContext, captureMode: unknown): void {
  if (captureMode === undefined) return
  if (
    typeof captureMode === 'string' &&
    (DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES as readonly string[]).includes(captureMode)
  ) {
    return
  }

  addDiagnostic(
    context,
    'captureMode',
    `Kafka topic profile captureMode ${describeInvalidCaptureMode(captureMode)} must be one of: ${DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES.join(', ')}.`,
  )
}

function describeInvalidCaptureMode(captureMode: unknown): string {
  if (typeof captureMode === 'string') return previewInvalidCaptureModeString(captureMode)
  if (captureMode === null) return 'null'
  if (Array.isArray(captureMode)) return 'array'
  return typeof captureMode
}

function previewInvalidCaptureModeString(value: string): string {
  const chars = [...value]
  const truncated = chars.length > invalidCaptureModePreviewLength
  const preview = chars.slice(0, invalidCaptureModePreviewLength).join('')
  return `"${escapeDiagnosticString(preview)}${truncated ? '...' : ''}"${truncated ? ' (truncated)' : ''}`
}

function escapeDiagnosticString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/[\u0000-\u001F\u007F]/g, char =>
      `\\u${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
}

function requireRecordProperty(
  context: ValidationContext,
  record: Record<string, unknown>,
  key: string,
  path: string,
): Record<string, unknown> | undefined {
  if (!(key in record)) {
    addDiagnostic(context, path, 'Kafka topic profile input field is required.')
    return undefined
  }

  return requireRecord(context, record[key], path)
}

function optionalRecordProperty(
  context: ValidationContext,
  record: Record<string, unknown>,
  key: string,
  path: string,
): Record<string, unknown> | undefined {
  if (record[key] === undefined) return undefined
  return requireRecord(context, record[key], path)
}

function requireArrayProperty(
  context: ValidationContext,
  record: Record<string, unknown>,
  key: string,
  path: string,
): unknown[] | undefined {
  if (!(key in record)) {
    addDiagnostic(context, path, 'Kafka topic profile input field is required.')
    return undefined
  }

  return requireArray(context, record[key], path)
}

function optionalArrayProperty(
  context: ValidationContext,
  record: Record<string, unknown>,
  key: string,
  path: string,
): unknown[] | undefined {
  if (record[key] === undefined) return undefined
  return requireArray(context, record[key], path)
}

function requireRecord(
  context: ValidationContext,
  value: unknown,
  path: string,
): Record<string, unknown> | undefined {
  if (isRecord(value)) return value

  addDiagnostic(context, path, 'Kafka topic profile input must be an object.')
  return undefined
}

function requireArray(
  context: ValidationContext,
  value: unknown,
  path: string,
): unknown[] | undefined {
  if (Array.isArray(value)) return value

  addDiagnostic(context, path, 'Kafka topic profile input field must be an array.')
  return undefined
}

function requireNonEmptyString(
  context: ValidationContext,
  record: Record<string, unknown>,
  key: string,
  path: string,
): void {
  if (isNonEmptyString(record[key])) return
  addDiagnostic(context, path, 'Kafka topic profile input field must be a non-empty string.')
}

function optionalNonEmptyString(
  context: ValidationContext,
  record: Record<string, unknown>,
  key: string,
  path: string,
): void {
  if (record[key] === undefined || isNonEmptyString(record[key])) return
  addDiagnostic(context, path, 'Kafka topic profile input field must be a non-empty string when provided.')
}

function requireRatio(
  context: ValidationContext,
  record: Record<string, unknown>,
  key: string,
  path: string,
): void {
  if (isRatio(record[key])) return
  addDiagnostic(context, path, 'Kafka topic profile input field must be a ratio between 0 and 1.')
}

function optionalRatio(
  context: ValidationContext,
  record: Record<string, unknown>,
  key: string,
  path: string,
): void {
  if (record[key] === undefined || isRatio(record[key])) return
  addDiagnostic(context, path, 'Kafka topic profile input field must be a ratio between 0 and 1 when provided.')
}

function optionalNonNegativeNumber(
  context: ValidationContext,
  record: Record<string, unknown>,
  key: string,
  path: string,
): void {
  if (record[key] === undefined) return
  if (typeof record[key] === 'number' && Number.isFinite(record[key]) && record[key] >= 0) return

  addDiagnostic(context, path, 'Kafka topic profile input field must be a non-negative finite number when provided.')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isRatio(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
}

function addDiagnostic(context: ValidationContext, path: string, message: string): void {
  context.diagnostics.push({
    severity: 'error',
    code: 'CONN201',
    message,
    ...(context.connectorId ? { connectorId: context.connectorId } : {}),
    coordinate: {
      kind: 'manual_import',
      path: kafkaProfileInputDiagnosticPath(path),
    },
  })
}

function kafkaProfileInputDiagnosticPath(path: string): string {
  return path.length > 0
    ? `dpm.kafka.topic-profile.input.${path}`
    : 'dpm.kafka.topic-profile.input'
}

function validationResult(context: ValidationContext): DpmKafkaTopicProfileInputValidationResult {
  return {
    valid: context.diagnostics.length === 0,
    diagnostics: context.diagnostics,
  }
}
