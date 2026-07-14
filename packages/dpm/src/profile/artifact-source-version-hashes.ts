import type { DpmProfileSourceDescriptor } from './profile-source-types.js'

export function collectDpmProfileSourceVersionHashes(
  sources: readonly DpmProfileSourceDescriptor[],
  input?: Readonly<Record<string, string>>,
): Record<string, string> {
  const hashes: Record<string, string> = {}
  for (const key of Object.keys(input ?? {}).sort()) {
    const value = input?.[key]
    if (value) hashes[key] = value
  }
  for (const source of sources) {
    if (source.sourceVersionHash) hashes[source.id] = source.sourceVersionHash
  }
  return hashes
}
