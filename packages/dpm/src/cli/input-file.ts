import { readFileSync } from 'node:fs'

import { parse } from 'yaml'

export function readDpmCliTextFile(path: string): string {
  return readFileSync(path, 'utf8')
}

export function readDpmCliStructuredFile(path: string): unknown {
  return parse(readDpmCliTextFile(path)) as unknown
}
