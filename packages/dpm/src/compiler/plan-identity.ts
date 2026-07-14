import {
  DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION,
  type DpmCanonicalKeyEncodingVersion,
} from '../model/canonical-key-encoding.js'
import { frameWellFormedUtf8 } from '../model/utf8-frame.js'

export function createDpmCompiledPlanIdentity(input: {
  manifestId: string
  registryVersion: string
  canonicalKeyEncodingVersion: DpmCanonicalKeyEncodingVersion
  dataBindingFreshnessHash?: string
}): string {
  const legacyIdentity = `compiled-plan:${input.manifestId}:${input.registryVersion}`
  if (
    input.canonicalKeyEncodingVersion === DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION
    && !input.dataBindingFreshnessHash
  ) {
    return legacyIdentity
  }
  const typedIdentity = 'dpm.compiled-plan.typed-v2'
    + `|m|${frameWellFormedUtf8(input.manifestId, 'compiled plan manifestId')}`
    + `|r|${frameWellFormedUtf8(input.registryVersion, 'compiled plan registryVersion')}`
  return input.dataBindingFreshnessHash
    ? typedIdentity + `|d|${frameWellFormedUtf8(input.dataBindingFreshnessHash, 'compiled plan data binding freshness hash')}`
    : typedIdentity
}
