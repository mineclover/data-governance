import { createPostgresCatalogSnapshot } from '../catalog/postgres.js'
import type {
  CatalogSnapshot,
  PostgresCatalogSnapshotInput,
} from '../catalog/types.js'
import { readDpmCliStructuredFile } from './input-file.js'

export function readDpmCliCatalogSnapshot(path: string): CatalogSnapshot {
  const raw = readDpmCliStructuredFile(path) as Record<string, unknown>
  if (raw.kind === 'dpm.catalog.snapshot.v1') {
    return raw as CatalogSnapshot
  }
  return createPostgresCatalogSnapshot(raw as PostgresCatalogSnapshotInput)
}
