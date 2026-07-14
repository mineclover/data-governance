import type { RegistrySnapshot } from './registry-snapshot-types.js'
import { createRegistrySnapshot } from './registry-snapshot-factory.js'
import { registrySnapshotInputFromYaml } from './registry-yaml.js'

export function parseRegistrySnapshotYaml(yamlText: string): RegistrySnapshot {
  return createRegistrySnapshot(registrySnapshotInputFromYaml(yamlText))
}
