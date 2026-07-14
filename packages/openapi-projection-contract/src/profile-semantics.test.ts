import { describe, expect, it } from 'vitest'
import {
  getOpenApiProjectionProfileSemantics,
  isOpenApiProjectionProfile,
  OPENAPI_PROJECTION_PROFILE_SEMANTICS,
  OPENAPI_PROJECTION_PROFILES,
} from '@oa-sdk/openapi-projection-contract'
import type { OpenApiProjectionProfile, OpenApiProjectionProfileSemantics } from '@oa-sdk/openapi-projection-contract'

const VALID_PROFILES = [
  'component-bundle',
  'operation-contract',
  'full-api-document',
] as const satisfies readonly OpenApiProjectionProfile[]

describe('OpenAPI projection profile semantics', () => {
  it('lists every supported profile value', () => {
    expect(OPENAPI_PROJECTION_PROFILES).toEqual(VALID_PROFILES)
  })

  it.each(VALID_PROFILES)('accepts valid profile value %s', profile => {
    expect(isOpenApiProjectionProfile(profile)).toBe(true)
    expect(getOpenApiProjectionProfileSemantics(profile).profile).toBe(profile)
  })

  it.each([
    'schema-bundle',
    'operation',
    'full-document',
    '',
    null,
    undefined,
    0,
    {},
  ])('rejects invalid profile value %j', value => {
    expect(isOpenApiProjectionProfile(value)).toBe(false)
  })

  it('defines component-bundle as an empty-paths schema component bundle', () => {
    const semantics = OPENAPI_PROJECTION_PROFILE_SEMANTICS['component-bundle']

    expect(semantics.paths.rule).toBe('may-be-empty')
    expect(semantics.components.schemas).toBe('required')
    expect(semantics.validation.rule).toBe('profile-specific')
  })

  it('defines operation-contract as requiring at least one path operation', () => {
    const semantics = OPENAPI_PROJECTION_PROFILE_SEMANTICS['operation-contract']

    expect(semantics.paths.rule).toBe('requires-operation')
    expect(semantics.components.schemas).toBe('standard-openapi')
    expect(semantics.validation.rule).toBe('profile-specific')
  })

  it('defines full-api-document as normal OpenAPI document validation', () => {
    const semantics = OPENAPI_PROJECTION_PROFILE_SEMANTICS['full-api-document']

    expect(semantics.paths.rule).toBe('standard-openapi')
    expect(semantics.components.schemas).toBe('standard-openapi')
    expect(semantics.validation.rule).toBe('standard-openapi-document')
  })

  it('keeps semantics source-agnostic', () => {
    for (const profile of OPENAPI_PROJECTION_PROFILES) {
      const semantics: OpenApiProjectionProfileSemantics = getOpenApiProjectionProfileSemantics(profile)

      expect(Object.keys(semantics)).toEqual(['profile', 'summary', 'paths', 'components', 'validation'])
    }
  })
})
