import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const profileDemoRoot = fileURLToPath(new URL('../../examples/profile-kafka/', import.meta.url))
export const profileDemoFixturePath = join(profileDemoRoot, 'kafka-orders-created.json')
export const profileDemoPackageRoot = fileURLToPath(new URL('../..', import.meta.url))
export const profileDemoCommandTimeoutMs = 90_000
