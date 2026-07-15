export type OpenApiProjectionProfile =
  | 'component-bundle'
  | 'operation-contract'
  | 'full-api-document'

export type SchemaSourceCoordinate =
  | {
      kind: 'file'
      filePath: string
      pointer: string
      line?: number
      column?: number
    }
  | {
      kind: 'db'
      entity: string
      id: string
      pointer: string
    }

export type SchemaRefEdge = {
  from: string
  to?: string
  ref: string
  kind: string
  source: SchemaSourceCoordinate
}

export type SchemaDiagnostic = {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  source?: SchemaSourceCoordinate
}

export type SchemaTypeTarget = {
  id: string
  name: string
  kind: string
  source?: SchemaSourceCoordinate
}

export type OpenApiProjectionResult<TProjection extends object = { openapi: string }> = {
  profile: OpenApiProjectionProfile
  projection: TProjection
  refs: SchemaRefEdge[]
  diagnostics: SchemaDiagnostic[]
  sources: Record<string, SchemaSourceCoordinate>
  versionHash: string
  typeTargets?: SchemaTypeTarget[]
}
