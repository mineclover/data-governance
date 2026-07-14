import { fileURLToPath } from 'node:url'

export const storageDemoRoot = fileURLToPath(new URL('../../examples/customer-orders-storage/', import.meta.url))
export const storageDemoPackageRoot = fileURLToPath(new URL('../..', import.meta.url))
export const storageDemoCommandTimeoutMs = 90_000
