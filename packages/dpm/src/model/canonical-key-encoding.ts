export const DPM_CANONICAL_KEY_ENCODING_VERSIONS = [
  'string-v1',
  'typed-v2',
] as const

export type DpmCanonicalKeyEncodingVersion =
  typeof DPM_CANONICAL_KEY_ENCODING_VERSIONS[number]

export const DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION = 'string-v1' as const

export function isDpmCanonicalKeyEncodingVersion(
  value: unknown,
): value is DpmCanonicalKeyEncodingVersion {
  return typeof value === 'string'
    && (DPM_CANONICAL_KEY_ENCODING_VERSIONS as readonly string[]).includes(value)
}

export function resolveDpmCanonicalKeyEncodingVersion(
  value: unknown,
  label = 'canonical key encoding version',
): DpmCanonicalKeyEncodingVersion {
  if (value === undefined) return DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION
  if (isDpmCanonicalKeyEncodingVersion(value)) return value

  throw new Error(
    `${label} must be one of ${DPM_CANONICAL_KEY_ENCODING_VERSIONS.join(', ')}`,
  )
}
