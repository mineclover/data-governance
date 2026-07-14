import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const fixturesRoot = new URL('../fixtures/', import.meta.url)

export function dpmFixturePath(path: string): string {
  return join(fixturesRoot.pathname, path)
}

export function readDpmJsonFixture<T>(path: string): T {
  return JSON.parse(readDpmTextFixture(path)) as T
}

export function readDpmTextFixture(path: string): string {
  return readFileSync(dpmFixturePath(path), 'utf8')
}
