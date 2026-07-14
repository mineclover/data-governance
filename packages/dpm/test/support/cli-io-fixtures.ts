import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { readDpmJsonFixture } from './fixture-io.js'

export function parseCliStdout(stdout: string): Record<string, any> {
  return JSON.parse(stdout) as Record<string, any>
}

export function readCliManifestFixture(): Record<string, any> {
  return readDpmJsonFixture<Record<string, any>>('valid/customer-orders.json')
}

export function writeTempCliJsonFixture(prefix: string, filename: string, value: unknown): string {
  const tempDir = mkdtempSync(join(tmpdir(), prefix))
  const path = join(tempDir, filename)
  writeFileSync(path, JSON.stringify(value, null, 2))
  return path
}
