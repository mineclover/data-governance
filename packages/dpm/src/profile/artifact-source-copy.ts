import type {
  DpmProfileCoordinate,
  DpmProfileEvidenceSource,
  DpmProfileSourceDescriptor,
} from './profile-source-types.js'

export function copySourceDescriptor(source: DpmProfileSourceDescriptor): DpmProfileSourceDescriptor {
  return {
    id: source.id,
    kind: source.kind,
    connectorId: source.connectorId,
    connectorVersion: source.connectorVersion,
    refs: [...source.refs].sort(),
    captureMode: source.captureMode,
    ...(source.capturedAt ? { capturedAt: source.capturedAt } : {}),
    ...(source.sourceVersionHash ? { sourceVersionHash: source.sourceVersionHash } : {}),
  }
}

export function copyCoordinate(coordinate: DpmProfileCoordinate): DpmProfileCoordinate {
  return {
    kind: coordinate.kind,
    path: coordinate.path,
    ...(coordinate.sourceId ? { sourceId: coordinate.sourceId } : {}),
    ...(coordinate.pointer ? { pointer: coordinate.pointer } : {}),
    ...(coordinate.externalId ? { externalId: coordinate.externalId } : {}),
  }
}

export function copyEvidenceSource(source: DpmProfileEvidenceSource): DpmProfileEvidenceSource {
  return {
    coordinate: copyCoordinate(source.coordinate),
    ...(source.connectorId ? { connectorId: source.connectorId } : {}),
    ...(source.capturedAt ? { capturedAt: source.capturedAt } : {}),
    ...(source.description ? { description: source.description } : {}),
  }
}

export function sortEvidenceSources(
  sources: Readonly<Record<string, DpmProfileEvidenceSource>>,
): Record<string, DpmProfileEvidenceSource> {
  const sorted: Record<string, DpmProfileEvidenceSource> = {}
  for (const key of Object.keys(sources).sort()) {
    const source = sources[key]
    if (source) sorted[key] = copyEvidenceSource(source)
  }
  return sorted
}
