import { describe, expect, it } from 'vitest'
import { validateOpenApiProjection } from '@oa-sdk/openapi-projection-contract'
import type {
  OpenApiProjectionResult,
  SchemaDiagnostic,
  SchemaSourceCoordinate,
} from '@oa-sdk/openapi-projection-contract'

const fileSource: SchemaSourceCoordinate = {
  kind: 'file',
  filePath: '/workspace/openapi.yaml',
  pointer: '#/components/schemas/Book',
  line: 3,
  column: 5,
}

const dbSource: SchemaSourceCoordinate = {
  kind: 'db',
  entity: 'table',
  id: 'books',
  pointer: '#/columns/title',
}

describe('validateOpenApiProjection', () => {
  it('accepts a valid component-bundle projection with file and DB source coordinates', () => {
    const result = validateOpenApiProjection(validComponentBundle())

    expect(result).toEqual({ valid: true, diagnostics: [] })
  })

  it('returns diagnostics instead of throwing for ordinary invalid projection data', () => {
    expect(() => validateOpenApiProjection(null)).not.toThrow()

    const result = validateOpenApiProjection(null)

    expect(result.valid).toBe(false)
    expect(result.diagnostics).toEqual([
      {
        severity: 'error',
        code: 'openapi-projection/invalid-envelope',
        message: 'Projection result must be an object.',
      },
    ])
  })

  it('checks dependency-light OpenAPI document structure', () => {
    const result = validateOpenApiProjection({
      ...validComponentBundle(),
      profile: 'full-api-document',
      projection: {
        openapi: '2.0',
        info: {
          title: '',
          version: '1.0.0',
        },
        paths: {
          books: {
            get: {},
          },
        },
      },
    })

    expect(result.valid).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'openapi-projection/invalid-document',
        message: 'Projection document openapi version must be an OpenAPI 3.x version string.',
      }),
      expect.objectContaining({
        code: 'openapi-projection/invalid-document',
        message: 'Projection document info.title must be a non-empty string.',
      }),
      expect.objectContaining({
        code: 'openapi-projection/invalid-document',
        message: 'Projection document path key "books" must start with "/".',
      }),
      expect.objectContaining({
        code: 'openapi-projection/invalid-document',
        message: 'Projection document operation "GET books" must declare a responses object.',
      }),
    ]))
  })

  it('checks profile-specific requirements', () => {
    const missingSchemas = validateOpenApiProjection({
      ...validComponentBundle(),
      projection: {
        openapi: '3.2.0',
        info: { title: 'Missing schemas', version: '1.0.0' },
        paths: {},
      },
    })
    const operationWithoutOperation = validateOpenApiProjection({
      ...validComponentBundle(),
      profile: 'operation-contract',
      projection: {
        openapi: '3.2.0',
        info: { title: 'Operation contract', version: '1.0.0' },
        paths: {
          '/books': {
            parameters: [],
          },
        },
      },
    })
    const operationWithOperation = validateOpenApiProjection({
      ...validComponentBundle(),
      profile: 'operation-contract',
      projection: {
        openapi: '3.2.0',
        info: { title: 'Operation contract', version: '1.0.0' },
        paths: {
          '/books': {
            post: {
              responses: {
                201: { description: 'Created' },
              },
            },
          },
        },
      },
    })

    expect(missingSchemas.valid).toBe(false)
    expect(missingSchemas.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'openapi-projection/profile-requirement',
        message: 'component-bundle projections must declare components.schemas.',
      }),
    ]))
    expect(operationWithoutOperation.valid).toBe(false)
    expect(operationWithoutOperation.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'openapi-projection/profile-requirement',
        message: 'operation-contract projections must contain at least one operation object under paths.',
      }),
    ]))
    expect(operationWithOperation).toEqual({ valid: true, diagnostics: [] })
  })

  it('checks refs entries for required fields and source coordinates', () => {
    const result = validateOpenApiProjection({
      ...validComponentBundle(),
      refs: [
        {
          from: '',
          ref: '',
          kind: '',
          source: {
            kind: 'file',
            filePath: '',
            pointer: '#/components/schemas/Book',
            line: 0,
          },
        },
      ],
    })

    expect(result.valid).toBe(false)
    expect(result.diagnostics.map(diagnostic => diagnostic.code)).toEqual(expect.arrayContaining([
      'openapi-projection/invalid-ref',
      'openapi-projection/invalid-source',
    ]))
  })

  it('checks diagnostic entries and treats error diagnostics as projection-invalid', () => {
    const projectionDiagnostic: SchemaDiagnostic = {
      severity: 'error',
      code: 'projection/source-error',
      message: 'Projection adapter reported an error.',
      source: fileSource,
    }
    const result = validateOpenApiProjection({
      ...validComponentBundle(),
      diagnostics: [projectionDiagnostic],
    })
    const malformed = validateOpenApiProjection({
      ...validComponentBundle(),
      diagnostics: [
        { severity: 'fatal', code: 'projection/fatal', message: 'Bad severity.' },
        { severity: 'warning', code: '', message: 'Missing code.' },
      ],
    })

    expect(result.valid).toBe(false)
    expect(result.diagnostics).toEqual([projectionDiagnostic])
    expect(malformed.valid).toBe(false)
    expect(malformed.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'openapi-projection/invalid-diagnostic' }),
    ]))
  })

  it('checks supported file and DB source coordinate variants', () => {
    const result = validateOpenApiProjection({
      ...validComponentBundle(),
      sources: {
        file: fileSource,
        db: dbSource,
        unsupported: {
          kind: 'repository',
          id: 'books',
          pointer: '#',
        },
      },
    })

    expect(result.valid).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'openapi-projection/invalid-source',
        message: 'sources.unsupported.kind must be either file or db.',
      }),
    ]))
  })
})

function validComponentBundle(
  overrides: Partial<OpenApiProjectionResult<Record<string, unknown>>> = {},
): OpenApiProjectionResult<Record<string, unknown>> {
  return {
    profile: 'component-bundle',
    projection: {
      openapi: '3.2.0',
      info: {
        title: 'Book components',
        version: '1.0.0',
      },
      components: {
        schemas: {
          Book: {
            type: 'object',
            properties: {
              title: { type: 'string' },
            },
          },
        },
      },
    },
    refs: [],
    diagnostics: [],
    sources: {
      'schema:public/book/Book': fileSource,
      'db:table/books': dbSource,
    },
    versionHash: 'sha256:component-bundle',
    typeTargets: [
      {
        id: 'schema:public/book/Book',
        name: 'Book',
        kind: 'schema',
        source: fileSource,
      },
    ],
    ...overrides,
  }
}
