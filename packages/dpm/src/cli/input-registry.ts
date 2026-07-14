import { parseRegistrySnapshotYaml } from '../registry/registry-snapshot-parser.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import { readDpmCliTextFile } from './input-file.js'

export function readDpmCliRegistrySnapshot(path: string): RegistrySnapshot {
  return parseRegistrySnapshotYaml(readDpmCliTextFile(path))
}
