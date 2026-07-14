import { readDpmJsonFixture } from './fixture-io.js'

export type ManifestSchemaInvalidFixtureCase = readonly [
  fixtureName: string,
  expectedPath: string,
]

export const manifestSchemaValidFixtureNames = [
  'customer-orders.json',
] as const satisfies readonly string[]

export const manifestSchemaInvalidFixtureCases = [
  ['direct-identifier-keep.json', '/columns/0'],
  ['foreign-identifier-missing-relationship.json', '/columns/0'],
  ['legacy-relationship-from-to.json', '/relationships/0'],
  ['non-approved-relationship.json', '/relationships/0/status'],
] as const satisfies readonly ManifestSchemaInvalidFixtureCase[]

export function readManifestSchemaFixture(kind: 'valid' | 'invalid', name: string): unknown {
  return readDpmJsonFixture(`${kind}/${name}`)
}
