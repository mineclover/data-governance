import { describe, expect, it } from 'vitest'
import {
  attachOpenApiProjectionExtensions,
  OPENAPI_PROJECTION_EXTENSION_NAMES,
  OPENAPI_PROJECTION_PROFILE_EXTENSION,
  OPENAPI_PROJECTION_REFS_EXTENSION,
  OPENAPI_PROJECTION_SOURCES_EXTENSION,
  OPENAPI_PROJECTION_VERSION_HASH_EXTENSION,
  serializeOpenApiProjectionExtensions,
  validateOpenApiProjection,
} from '@oa-sdk/openapi-projection-contract'
import type {
  OpenApiProjectionExtensionFields,
  OpenApiProjectionExtensionName,
  OpenApiProjectionResult,
  SchemaRefEdge,
  SchemaSourceCoordinate,
} from '@oa-sdk/openapi-projection-contract'

const fileSource: SchemaSourceCoordinate = {
  kind: 'file',
  filePath: '/workspace/fragments/schema/public/book/Book.yaml',
  pointer: '#/content/properties/title',
  line: 12,
  column: 9,
}

const dbSource: SchemaSourceCoordinate = {
  kind: 'db',
  entity: 'table',
  id: 'public.books',
  pointer: '#/columns/title',
}

const refEdge: SchemaRefEdge = {
  from: 'path:public/book/BooksPath',
  to: 'schema:public/book/Book',
  ref: 'oa://schema/public/book/Book',
  kind: 'definition-ref',
  source: fileSource,
}

describe('OpenAPI projection extensions', () => {
  it('defines the standard schema engine extension names', () => {
    const names: readonly OpenApiProjectionExtensionName[] = [
      'x-schema-engine-profile',
      'x-schema-engine-version-hash',
      'x-schema-engine-sources',
      'x-schema-engine-refs',
    ]

    expect(OPENAPI_PROJECTION_PROFILE_EXTENSION).toBe('x-schema-engine-profile')
    expect(OPENAPI_PROJECTION_VERSION_HASH_EXTENSION).toBe('x-schema-engine-version-hash')
    expect(OPENAPI_PROJECTION_SOURCES_EXTENSION).toBe('x-schema-engine-sources')
    expect(OPENAPI_PROJECTION_REFS_EXTENSION).toBe('x-schema-engine-refs')
    expect(OPENAPI_PROJECTION_EXTENSION_NAMES).toEqual(names)
  })

  it('serializes projection metadata into x-* extension fields', () => {
    const projection = validFullDocumentProjection()
    const extensions: OpenApiProjectionExtensionFields = serializeOpenApiProjectionExtensions(projection)

    expect(extensions).toEqual({
      [OPENAPI_PROJECTION_PROFILE_EXTENSION]: 'full-api-document',
      [OPENAPI_PROJECTION_VERSION_HASH_EXTENSION]: 'sha256:projection-metadata',
      [OPENAPI_PROJECTION_SOURCES_EXTENSION]: {
        'schema:public/book/Book': fileSource,
        'db:table/public.books': dbSource,
      },
      [OPENAPI_PROJECTION_REFS_EXTENSION]: [refEdge],
    })
  })

  it('preserves file and DB source coordinates without sharing mutable references', () => {
    const projection = validFullDocumentProjection()
    const extensions = serializeOpenApiProjectionExtensions(projection)
    const sources = extensions[OPENAPI_PROJECTION_SOURCES_EXTENSION]

    expect(sources['schema:public/book/Book']).toEqual(fileSource)
    expect(sources['db:table/public.books']).toEqual(dbSource)
    expect(sources['schema:public/book/Book']).not.toBe(fileSource)
    expect(sources['db:table/public.books']).not.toBe(dbSource)
  })

  it('preserves ref graph metadata and nested source coordinates', () => {
    const projection = validFullDocumentProjection()
    const extensions = serializeOpenApiProjectionExtensions(projection)
    const refs = extensions[OPENAPI_PROJECTION_REFS_EXTENSION]

    expect(refs).toEqual([refEdge])
    expect(refs[0]).not.toBe(refEdge)
    expect(refs[0]?.source).toEqual(fileSource)
    expect(refs[0]?.source).not.toBe(fileSource)
  })

  it('attaches extension fields without invalidating OpenAPI projection validation', () => {
    const projection = validFullDocumentProjection()
    const document = attachOpenApiProjectionExtensions(projection)

    expect(document[OPENAPI_PROJECTION_PROFILE_EXTENSION]).toBe('full-api-document')
    expect(document[OPENAPI_PROJECTION_VERSION_HASH_EXTENSION]).toBe('sha256:projection-metadata')
    expect(document[OPENAPI_PROJECTION_SOURCES_EXTENSION]).toEqual(projection.sources)
    expect(document[OPENAPI_PROJECTION_REFS_EXTENSION]).toEqual(projection.refs)
    expect(validateOpenApiProjection({ ...projection, projection: document })).toEqual({
      valid: true,
      diagnostics: [],
    })
  })
})

function validFullDocumentProjection(): OpenApiProjectionResult<Record<string, unknown>> {
  return {
    profile: 'full-api-document',
    projection: {
      openapi: '3.2.0',
      info: {
        title: 'Book API',
        version: '1.0.0',
      },
      paths: {},
      components: {
        schemas: {
          Book: {
            type: 'object',
          },
        },
      },
    },
    refs: [refEdge],
    diagnostics: [],
    sources: {
      'schema:public/book/Book': fileSource,
      'db:table/public.books': dbSource,
    },
    versionHash: 'sha256:projection-metadata',
  }
}
