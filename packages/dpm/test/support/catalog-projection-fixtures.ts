import type { OpenApiProjectionResult } from '@oa-sdk/openapi-projection-contract'

import { readCatalogFixture } from './catalog-fixture-io.js'

export const OPENAPI_PROJECTION_CATALOG_FIXTURE_NAME = 'projection-commerce.json' as const
export const OPENAPI_PROJECTION_REF = 'projections/commerce-openapi.json' as const

export const expectedOpenApiProjectionCatalogSource = {
  kind: 'openapi_projection',
  profile: 'component-bundle',
  projectionVersionHash: 'sha256:projection-commerce-v1',
  projectionRef: OPENAPI_PROJECTION_REF,
} as const

export const expectedOpenApiProjectionCatalogTableNames = [
  'public.customers',
] as const

export function readOpenApiProjectionCatalogFixture(): OpenApiProjectionResult<Record<string, unknown>> {
  return readCatalogFixture<OpenApiProjectionResult<Record<string, unknown>>>(
    OPENAPI_PROJECTION_CATALOG_FIXTURE_NAME,
  )
}
