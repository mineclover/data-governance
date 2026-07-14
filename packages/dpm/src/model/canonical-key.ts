import {
  DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION,
  resolveDpmCanonicalKeyEncodingVersion,
  type DpmCanonicalKeyEncodingVersion,
} from './canonical-key-encoding.js'
import { frameWellFormedUtf8 } from './utf8-frame.js'

export type CanonicalKeyValue = string | number | boolean | bigint | Date | null
export type CanonicalKeyValueMap = Record<string, CanonicalKeyValue | undefined>

export type TenantNamespaceInput = {
  columns: string[]
}

export function renderCanonicalKeySegments(input: {
  namespace: string
  separator: string
  tenantColumns?: string[]
  predicate?: string
  columns: string[]
  values: CanonicalKeyValueMap
  encodingVersion?: DpmCanonicalKeyEncodingVersion
}): string {
  const encodingVersion = resolveDpmCanonicalKeyEncodingVersion(input.encodingVersion)
  return encodingVersion === DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION
    ? renderStringV1CanonicalKey(input)
    : renderTypedV2CanonicalKey(input)
}

function renderStringV1CanonicalKey(input: {
  namespace: string
  separator: string
  tenantColumns?: string[]
  predicate?: string
  columns: string[]
  values: CanonicalKeyValueMap
}): string {
  const segments = [input.namespace]
  for (const column of input.tenantColumns ?? []) {
    segments.push(renderStringV1NamedValue(column, requireValue(input.values, column)))
  }
  if (input.predicate) {
    segments.push(`predicate=${encodeStringV1CanonicalValue(input.predicate)}`)
  }
  for (const column of input.columns) {
    segments.push(renderStringV1NamedValue(column, requireValue(input.values, column)))
  }
  return segments.join(input.separator)
}

function renderTypedV2CanonicalKey(input: {
  namespace: string
  tenantColumns?: string[]
  predicate?: string
  columns: string[]
  values: CanonicalKeyValueMap
}): string {
  const segments = [
    'typed-v2',
    `n|${frameWellFormedUtf8(input.namespace, 'typed-v2 canonical key namespace')}`,
  ]
  for (const column of input.tenantColumns ?? []) {
    segments.push(renderTypedV2NamedValue('t', column, requireValue(input.values, column)))
  }
  if (input.predicate) {
    segments.push(`p|s|${frameWellFormedUtf8(input.predicate, 'typed-v2 canonical key predicate')}`)
  }
  for (const column of input.columns) {
    segments.push(renderTypedV2NamedValue('c', column, requireValue(input.values, column)))
  }
  return segments.join('|')
}

function renderStringV1NamedValue(name: string, value: CanonicalKeyValue): string {
  return `${name}=${encodeStringV1CanonicalValue(value)}`
}

function renderTypedV2NamedValue(
  segmentKind: 't' | 'c',
  name: string,
  value: CanonicalKeyValue,
): string {
  const encoded = encodeTypedV2CanonicalValue(value, name)
  return `${segmentKind}|${frameWellFormedUtf8(name, 'typed-v2 canonical key column name')}`
    + `|${encoded.tag}|${frameWellFormedUtf8(encoded.payload, `typed-v2 canonical key value for ${name}`)}`
}

function requireValue(values: CanonicalKeyValueMap, column: string): CanonicalKeyValue {
  const value = values[column]
  if (value === undefined) {
    throw new Error(`canonical key value for ${column} is required`)
  }
  return value
}

function encodeStringV1CanonicalValue(value: CanonicalKeyValue): string {
  if (value instanceof Date) return strictEncodeURIComponent(value.toISOString())
  if (value === null) return 'null'
  return strictEncodeURIComponent(String(value))
}

type TypedV2CanonicalValue = {
  tag: 's' | 'n' | 'b' | 'i' | 'd' | 'z'
  payload: string
}

function encodeTypedV2CanonicalValue(
  value: CanonicalKeyValue,
  column: string,
): TypedV2CanonicalValue {
  if (value === null) return { tag: 'z', payload: '' }
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) {
      throw new Error(`typed-v2 canonical key value for ${column} must be a valid Date`)
    }
    return { tag: 'd', payload: value.toISOString() }
  }
  if (typeof value === 'string') return { tag: 's', payload: value }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`typed-v2 canonical key value for ${column} must be a finite number`)
    }
    return { tag: 'n', payload: Object.is(value, -0) ? '-0' : String(value) }
  }
  if (typeof value === 'boolean') return { tag: 'b', payload: String(value) }
  if (typeof value === 'bigint') return { tag: 'i', payload: value.toString(10) }

  throw new Error(
    `typed-v2 canonical key value for ${column} must be a string, finite number, boolean, bigint, valid Date, or null`,
  )
}

function strictEncodeURIComponent(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, character =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}
