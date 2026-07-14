import { readDpmJsonFixture } from './fixture-io.js'

export function readCatalogFixture<T>(name: string): T {
  return readDpmJsonFixture<T>(`catalog/${name}`)
}
