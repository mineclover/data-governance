import { describe, expect, it } from 'vitest'
import {
  attachOpenApiProjectionExtensions,
  getOpenApiProjectionProfileSemantics,
  isOpenApiProjectionProfile,
  OPENAPI_PROJECTION_EXTENSION_NAMES,
  OPENAPI_PROJECTION_PROFILE_EXTENSION,
  OPENAPI_PROJECTION_PROFILE_SEMANTICS,
  OPENAPI_PROJECTION_PROFILES,
  OPENAPI_PROJECTION_REFS_EXTENSION,
  OPENAPI_PROJECTION_SOURCES_EXTENSION,
  OPENAPI_PROJECTION_VERSION_HASH_EXTENSION,
  serializeOpenApiProjectionExtensions,
  validateOpenApiProjection,
} from '@oa-sdk/openapi-projection-contract'
import type {
  OpenApiProjectionDocumentWithExtensions,
  OpenApiProjectionExtensionFields,
  OpenApiProjectionExtensionName,
  OpenApiProjectionProfile,
  OpenApiProjectionResult,
  SchemaDiagnostic,
  SchemaRefEdge,
  SchemaSourceCoordinate,
  SchemaTypeTarget,
  SchemaValidateResult,
} from '@oa-sdk/openapi-projection-contract'

describe('@oa-sdk/openapi-projection-contract import smoke', () => {
  it('imports the built ESM package through its workspace package name', async () => {
    const imported = await import('@oa-sdk/openapi-projection-contract')

    expect(Object.keys(imported).sort()).toEqual([
      'OPENAPI_PROJECTION_EXTENSION_NAMES',
      'OPENAPI_PROJECTION_PROFILE_EXTENSION',
      'OPENAPI_PROJECTION_PROFILES',
      'OPENAPI_PROJECTION_PROFILE_SEMANTICS',
      'OPENAPI_PROJECTION_REFS_EXTENSION',
      'OPENAPI_PROJECTION_SOURCES_EXTENSION',
      'OPENAPI_PROJECTION_VERSION_HASH_EXTENSION',
      'attachOpenApiProjectionExtensions',
      'getOpenApiProjectionProfileSemantics',
      'isOpenApiProjectionProfile',
      'serializeOpenApiProjectionExtensions',
      'validateOpenApiProjection',
    ].sort())
    expect(Object.prototype.toString.call(imported)).toBe('[object Module]')
  })

  it('accepts the exported projection contract types from the package entrypoint', () => {
    const profile: OpenApiProjectionProfile = 'component-bundle'
    const source: SchemaSourceCoordinate = {
      kind: 'file',
      filePath: '/workspace/openapi.yaml',
      pointer: '#/components/schemas/Book',
    }
    const ref: SchemaRefEdge = {
      from: 'schema:public/book/BookList',
      to: 'schema:public/book/Book',
      ref: '#/components/schemas/Book',
      kind: 'schema-ref',
      source,
    }
    const diagnostic: SchemaDiagnostic = {
      severity: 'info',
      code: 'contract/import-smoke',
      message: 'Contract package types are importable.',
      source,
    }
    const typeTarget: SchemaTypeTarget = {
      id: 'schema:public/book/Book',
      name: 'Book',
      kind: 'schema',
      source,
    }
    const validation: SchemaValidateResult = {
      valid: true,
      diagnostics: [],
    }
    const result: OpenApiProjectionResult<Record<string, unknown>> = {
      profile,
      projection: {
        openapi: '3.2.0',
        info: {
          title: 'Import smoke',
          version: '1.0.0',
        },
        components: {
          schemas: {
            Book: {
              type: 'object',
            },
          },
        },
      },
      refs: [ref],
      diagnostics: [diagnostic],
      sources: {
        [typeTarget.id]: source,
      },
      versionHash: 'sha256:import-smoke',
      typeTargets: [typeTarget],
    }
    const extensionName: OpenApiProjectionExtensionName = OPENAPI_PROJECTION_PROFILE_EXTENSION
    const extensions: OpenApiProjectionExtensionFields = serializeOpenApiProjectionExtensions(result)
    const documentWithExtensions: OpenApiProjectionDocumentWithExtensions<Record<string, unknown>> =
      attachOpenApiProjectionExtensions(result)

    expect(validation.valid).toBe(true)
    expect(validateOpenApiProjection(result).valid).toBe(true)
    expect(result.profile).toBe('component-bundle')
    expect(OPENAPI_PROJECTION_PROFILES).toContain(result.profile)
    expect(isOpenApiProjectionProfile(result.profile)).toBe(true)
    expect(getOpenApiProjectionProfileSemantics(result.profile)).toBe(
      OPENAPI_PROJECTION_PROFILE_SEMANTICS['component-bundle'],
    )
    expect(OPENAPI_PROJECTION_EXTENSION_NAMES).toContain(extensionName)
    expect(extensions[OPENAPI_PROJECTION_PROFILE_EXTENSION]).toBe(result.profile)
    expect(extensions[OPENAPI_PROJECTION_VERSION_HASH_EXTENSION]).toBe(result.versionHash)
    expect(extensions[OPENAPI_PROJECTION_SOURCES_EXTENSION]).toEqual(result.sources)
    expect(extensions[OPENAPI_PROJECTION_REFS_EXTENSION]).toEqual(result.refs)
    expect(documentWithExtensions[OPENAPI_PROJECTION_PROFILE_EXTENSION]).toBe(result.profile)
    expect(result.refs).toHaveLength(1)
    expect(result.typeTargets?.[0]?.name).toBe('Book')
  })
})
