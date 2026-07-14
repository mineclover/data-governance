import { copySourceCoordinate } from './snapshot-source-copy.js'
import type { CatalogProjectionEvidence } from './projection-types.js'

export function copyProjectionEvidence(projection: CatalogProjectionEvidence): CatalogProjectionEvidence {
  return {
    profile: projection.profile,
    versionHash: projection.versionHash,
    refs: projection.refs.map(ref => ({
      from: ref.from,
      ...(ref.to ? { to: ref.to } : {}),
      ref: ref.ref,
      kind: ref.kind,
      source: copySourceCoordinate(ref.source),
    })),
    typeTargets: projection.typeTargets.map(target => ({
      id: target.id,
      name: target.name,
      kind: target.kind,
      ...(target.source ? { source: copySourceCoordinate(target.source) } : {}),
    })),
  }
}
