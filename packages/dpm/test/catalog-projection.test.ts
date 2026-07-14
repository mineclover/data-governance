import { describe, expect, it } from 'vitest'

import { catalogSnapshotFromOpenApiProjection } from '../src/index.js'
import {
  expectedOpenApiProjectionCatalogSource,
  expectedOpenApiProjectionCatalogTableNames,
  OPENAPI_PROJECTION_REF,
  readOpenApiProjectionCatalogFixture,
} from './support/catalog-projection-fixtures.js'

describe('DPM OpenAPI projection catalog adapter', () => {
  it('adapts an OpenAPI projection envelope as structural evidence only', () => {
    const projection = readOpenApiProjectionCatalogFixture()
    const snapshot = catalogSnapshotFromOpenApiProjection(projection, {
      projectionRef: OPENAPI_PROJECTION_REF,
    })

    expect(snapshot.source).toEqual(expectedOpenApiProjectionCatalogSource)
    expect(snapshot.freshness.sourceVersionHash).toBe('sha256:projection-commerce-v1')
    expect(snapshot.tables.map(table => table.table)).toEqual([...expectedOpenApiProjectionCatalogTableNames])
    expect(snapshot.projection?.typeTargets[0]?.name).toBe('Customer')
    expect('relationships' in snapshot).toBe(false)
    expect(snapshot.uniqueCandidates).toEqual([])
  })
})
