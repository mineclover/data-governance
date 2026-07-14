import {
  parseRegistrySnapshotYaml,
  type RegistrySnapshot,
} from '../../src/index.js'
import { readDpmTextFixture } from './fixture-io.js'

export const COMMERCE_REGISTRY_FIXTURE_NAME = 'commerce-registry.yaml' as const

export function readRegistryFixture(name: string): string {
  return readDpmTextFixture(`registry/${name}`)
}

export function readCommerceRegistrySnapshot(): RegistrySnapshot {
  return parseRegistrySnapshotYaml(readRegistryFixture(COMMERCE_REGISTRY_FIXTURE_NAME))
}
