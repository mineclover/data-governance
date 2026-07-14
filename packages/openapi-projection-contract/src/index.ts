export const OPENAPI_PROJECTION_PROFILES = [
  'component-bundle',
  'operation-contract',
  'full-api-document',
] as const

export const OPENAPI_PROJECTION_PROFILE_EXTENSION = 'x-schema-engine-profile'
export const OPENAPI_PROJECTION_VERSION_HASH_EXTENSION = 'x-schema-engine-version-hash'
export const OPENAPI_PROJECTION_SOURCES_EXTENSION = 'x-schema-engine-sources'
export const OPENAPI_PROJECTION_REFS_EXTENSION = 'x-schema-engine-refs'
export const OPENAPI_PROJECTION_EXTENSION_NAMES = [
  OPENAPI_PROJECTION_PROFILE_EXTENSION,
  OPENAPI_PROJECTION_VERSION_HASH_EXTENSION,
  OPENAPI_PROJECTION_SOURCES_EXTENSION,
  OPENAPI_PROJECTION_REFS_EXTENSION,
] as const

export type OpenApiProjectionProfile = typeof OPENAPI_PROJECTION_PROFILES[number]
export type OpenApiProjectionExtensionName = typeof OPENAPI_PROJECTION_EXTENSION_NAMES[number]

export type OpenApiProjectionProfileSemantics = {
  profile: OpenApiProjectionProfile
  summary: string
  paths: {
    rule: 'may-be-empty' | 'requires-operation' | 'standard-openapi'
    description: string
  }
  components: {
    schemas: 'required' | 'standard-openapi'
    description: string
  }
  validation: {
    rule: 'profile-specific' | 'standard-openapi-document'
    description: string
  }
}

export const OPENAPI_PROJECTION_PROFILE_SEMANTICS = {
  'component-bundle': {
    profile: 'component-bundle',
    summary: 'Reusable schema components without requiring an API surface.',
    paths: {
      rule: 'may-be-empty',
      description: 'paths may be absent or empty because the projection is a schema component bundle.',
    },
    components: {
      schemas: 'required',
      description: 'components.schemas must be present so validators have schema material to consume.',
    },
    validation: {
      rule: 'profile-specific',
      description: 'OpenAPI document validation is relaxed only for the empty paths shape and tightened for schema components.',
    },
  },
  'operation-contract': {
    profile: 'operation-contract',
    summary: 'One or more request/response contracts represented as OpenAPI operations.',
    paths: {
      rule: 'requires-operation',
      description: 'paths must contain at least one operation object under a path item.',
    },
    components: {
      schemas: 'standard-openapi',
      description: 'components.schemas may be present when operations reference reusable schemas.',
    },
    validation: {
      rule: 'profile-specific',
      description: 'OpenAPI document validation is combined with the requirement that paths contain at least one operation.',
    },
  },
  'full-api-document': {
    profile: 'full-api-document',
    summary: 'A complete OpenAPI document intended for host-level OpenAPI validation.',
    paths: {
      rule: 'standard-openapi',
      description: 'paths follow the normal OpenAPI document rules without projection-specific relaxation.',
    },
    components: {
      schemas: 'standard-openapi',
      description: 'components.schemas follow the normal OpenAPI document rules.',
    },
    validation: {
      rule: 'standard-openapi-document',
      description: 'host validators should apply normal OpenAPI document validation; this package performs dependency-light structural checks only.',
    },
  },
} as const satisfies Record<OpenApiProjectionProfile, OpenApiProjectionProfileSemantics>

export function isOpenApiProjectionProfile(value: unknown): value is OpenApiProjectionProfile {
  return typeof value === 'string' && (OPENAPI_PROJECTION_PROFILES as readonly string[]).includes(value)
}

export function getOpenApiProjectionProfileSemantics(
  profile: OpenApiProjectionProfile,
): OpenApiProjectionProfileSemantics {
  return OPENAPI_PROJECTION_PROFILE_SEMANTICS[profile]
}

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

export type SchemaValidateResult = {
  valid: boolean
  diagnostics: SchemaDiagnostic[]
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

export type OpenApiProjectionExtensionFields = {
  [OPENAPI_PROJECTION_PROFILE_EXTENSION]: OpenApiProjectionProfile
  [OPENAPI_PROJECTION_VERSION_HASH_EXTENSION]: string
  [OPENAPI_PROJECTION_SOURCES_EXTENSION]: Record<string, SchemaSourceCoordinate>
  [OPENAPI_PROJECTION_REFS_EXTENSION]: SchemaRefEdge[]
}

export type OpenApiProjectionDocumentWithExtensions<TProjection extends object> =
  TProjection & OpenApiProjectionExtensionFields

export function serializeOpenApiProjectionExtensions(
  result: Pick<OpenApiProjectionResult<object>, 'profile' | 'refs' | 'sources' | 'versionHash'>,
): OpenApiProjectionExtensionFields {
  return {
    [OPENAPI_PROJECTION_PROFILE_EXTENSION]: result.profile,
    [OPENAPI_PROJECTION_VERSION_HASH_EXTENSION]: result.versionHash,
    [OPENAPI_PROJECTION_SOURCES_EXTENSION]: copySourceMap(result.sources),
    [OPENAPI_PROJECTION_REFS_EXTENSION]: result.refs.map(copyRefEdge),
  }
}

export function attachOpenApiProjectionExtensions<TProjection extends object>(
  result: OpenApiProjectionResult<TProjection>,
): OpenApiProjectionDocumentWithExtensions<TProjection> {
  return {
    ...result.projection,
    ...serializeOpenApiProjectionExtensions(result),
  }
}

const OPENAPI_OPERATION_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
  'query',
] as const

type JsonRecord = Record<string, unknown>

export function validateOpenApiProjection(result: unknown): SchemaValidateResult {
  const diagnostics: SchemaDiagnostic[] = []

  if (!isRecord(result)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-envelope',
      'Projection result must be an object.',
    )
    return toValidateResult(diagnostics)
  }

  const profile = validateProjectionProfile(result.profile, diagnostics)
  validateOpenApiDocument(result.projection, profile, diagnostics)
  validateRefEdges(result.refs, diagnostics)
  appendProjectionDiagnostics(result.diagnostics, diagnostics)
  validateSourcesMap(result.sources, diagnostics)
  validateVersionHash(result.versionHash, diagnostics)
  validateTypeTargets(result.typeTargets, diagnostics)

  return toValidateResult(diagnostics)
}

function validateProjectionProfile(
  value: unknown,
  diagnostics: SchemaDiagnostic[],
): OpenApiProjectionProfile | undefined {
  if (isOpenApiProjectionProfile(value)) return value

  addValidationError(
    diagnostics,
    'openapi-projection/invalid-profile',
    'Projection result must declare a supported profile.',
  )
  return undefined
}

function validateOpenApiDocument(
  value: unknown,
  profile: OpenApiProjectionProfile | undefined,
  diagnostics: SchemaDiagnostic[],
): void {
  if (!isRecord(value)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-document',
      'Projection must be an OpenAPI document object.',
    )
    return
  }

  const openapi = value.openapi
  if (!isNonEmptyString(openapi)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-document',
      'Projection document must declare a non-empty openapi version string.',
    )
  } else if (!openapi.startsWith('3.')) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-document',
      'Projection document openapi version must be an OpenAPI 3.x version string.',
    )
  }

  validateInfoObject(value.info, diagnostics)

  const paths = value.paths
  let pathsHasOperation = false
  if (paths === undefined) {
    if (profile !== 'component-bundle') {
      addValidationError(
        diagnostics,
        'openapi-projection/invalid-document',
        'Projection document must declare a paths object.',
      )
    }
  } else if (!isRecord(paths)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-document',
      'Projection document paths must be an object when present.',
    )
  } else {
    pathsHasOperation = validatePathsObject(paths, diagnostics)
  }

  const components = validateComponentsObject(value.components, diagnostics)

  if (profile === 'component-bundle') {
    validateComponentBundleRequirements(components, diagnostics)
  } else if (profile === 'operation-contract' && !pathsHasOperation) {
    addValidationError(
      diagnostics,
      'openapi-projection/profile-requirement',
      'operation-contract projections must contain at least one operation object under paths.',
    )
  }
}

function validateInfoObject(value: unknown, diagnostics: SchemaDiagnostic[]): void {
  if (!isRecord(value)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-document',
      'Projection document must declare an info object.',
    )
    return
  }

  if (!isNonEmptyString(value.title)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-document',
      'Projection document info.title must be a non-empty string.',
    )
  }

  if (!isNonEmptyString(value.version)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-document',
      'Projection document info.version must be a non-empty string.',
    )
  }
}

function validatePathsObject(paths: JsonRecord, diagnostics: SchemaDiagnostic[]): boolean {
  let hasOperation = false

  for (const [path, pathItem] of Object.entries(paths)) {
    if (path.startsWith('x-')) continue

    if (!path.startsWith('/')) {
      addValidationError(
        diagnostics,
        'openapi-projection/invalid-document',
        `Projection document path key "${path}" must start with "/".`,
      )
    }

    if (!isRecord(pathItem)) {
      addValidationError(
        diagnostics,
        'openapi-projection/invalid-document',
        `Projection document path item "${path}" must be an object.`,
      )
      continue
    }

    for (const [field, operation] of Object.entries(pathItem)) {
      if (!isOpenApiOperationMethod(field)) continue

      if (!isRecord(operation)) {
        addValidationError(
          diagnostics,
          'openapi-projection/invalid-document',
          `Projection document operation "${field.toUpperCase()} ${path}" must be an object.`,
        )
        continue
      }

      hasOperation = true
      if (!isRecord(operation.responses)) {
        addValidationError(
          diagnostics,
          'openapi-projection/invalid-document',
          `Projection document operation "${field.toUpperCase()} ${path}" must declare a responses object.`,
        )
      }
    }
  }

  return hasOperation
}

function validateComponentsObject(
  value: unknown,
  diagnostics: SchemaDiagnostic[],
): JsonRecord | undefined {
  if (value === undefined) return undefined

  if (!isRecord(value)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-document',
      'Projection document components must be an object when present.',
    )
    return undefined
  }

  if (value.schemas !== undefined && !isRecord(value.schemas)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-document',
      'Projection document components.schemas must be an object when present.',
    )
  }

  return value
}

function validateComponentBundleRequirements(
  components: JsonRecord | undefined,
  diagnostics: SchemaDiagnostic[],
): void {
  const schemas = components?.schemas
  if (!isRecord(schemas)) {
    addValidationError(
      diagnostics,
      'openapi-projection/profile-requirement',
      'component-bundle projections must declare components.schemas.',
    )
    return
  }

  if (Object.keys(schemas).length === 0) {
    addValidationError(
      diagnostics,
      'openapi-projection/profile-requirement',
      'component-bundle projections must include at least one schema in components.schemas.',
    )
  }
}

function validateRefEdges(value: unknown, diagnostics: SchemaDiagnostic[]): void {
  if (!Array.isArray(value)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-ref',
      'Projection result refs must be an array.',
    )
    return
  }

  for (const [index, ref] of value.entries()) {
    const path = `refs[${index}]`
    if (!isRecord(ref)) {
      addValidationError(diagnostics, 'openapi-projection/invalid-ref', `${path} must be an object.`)
      continue
    }

    validateRequiredString(ref.from, `${path}.from`, 'openapi-projection/invalid-ref', diagnostics)
    validateRequiredString(ref.ref, `${path}.ref`, 'openapi-projection/invalid-ref', diagnostics)
    validateRequiredString(ref.kind, `${path}.kind`, 'openapi-projection/invalid-ref', diagnostics)

    if (ref.to !== undefined) {
      validateRequiredString(ref.to, `${path}.to`, 'openapi-projection/invalid-ref', diagnostics)
    }

    validateSourceCoordinate(ref.source, `${path}.source`, diagnostics)
  }
}

function appendProjectionDiagnostics(value: unknown, diagnostics: SchemaDiagnostic[]): void {
  if (!Array.isArray(value)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-diagnostic',
      'Projection result diagnostics must be an array.',
    )
    return
  }

  for (const [index, item] of value.entries()) {
    const path = `diagnostics[${index}]`
    if (!isRecord(item)) {
      addValidationError(
        diagnostics,
        'openapi-projection/invalid-diagnostic',
        `${path} must be an object.`,
      )
      continue
    }

    if (!isDiagnosticSeverity(item.severity)) {
      addValidationError(
        diagnostics,
        'openapi-projection/invalid-diagnostic',
        `${path}.severity must be one of error, warning, or info.`,
      )
      continue
    }

    if (!isNonEmptyString(item.code)) {
      addValidationError(
        diagnostics,
        'openapi-projection/invalid-diagnostic',
        `${path}.code must be a non-empty string.`,
      )
      continue
    }

    if (!isNonEmptyString(item.message)) {
      addValidationError(
        diagnostics,
        'openapi-projection/invalid-diagnostic',
        `${path}.message must be a non-empty string.`,
      )
      continue
    }

    const diagnostic: SchemaDiagnostic = {
      severity: item.severity,
      code: item.code,
      message: item.message,
    }

    if (item.source !== undefined) {
      if (!validateSourceCoordinate(item.source, `${path}.source`, diagnostics)) continue
      diagnostic.source = item.source
    }

    diagnostics.push(diagnostic)
  }
}

function validateSourcesMap(value: unknown, diagnostics: SchemaDiagnostic[]): void {
  if (!isRecord(value)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-source',
      'Projection result sources must be an object map.',
    )
    return
  }

  for (const [id, source] of Object.entries(value)) {
    if (!isNonEmptyString(id)) {
      addValidationError(
        diagnostics,
        'openapi-projection/invalid-source',
        'Projection result sources keys must be non-empty strings.',
      )
    }
    validateSourceCoordinate(source, `sources.${id}`, diagnostics)
  }
}

function validateVersionHash(value: unknown, diagnostics: SchemaDiagnostic[]): void {
  validateRequiredString(
    value,
    'versionHash',
    'openapi-projection/invalid-envelope',
    diagnostics,
  )
}

function validateTypeTargets(value: unknown, diagnostics: SchemaDiagnostic[]): void {
  if (value === undefined) return

  if (!Array.isArray(value)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-type-target',
      'Projection result typeTargets must be an array when present.',
    )
    return
  }

  for (const [index, target] of value.entries()) {
    const path = `typeTargets[${index}]`
    if (!isRecord(target)) {
      addValidationError(
        diagnostics,
        'openapi-projection/invalid-type-target',
        `${path} must be an object.`,
      )
      continue
    }

    validateRequiredString(target.id, `${path}.id`, 'openapi-projection/invalid-type-target', diagnostics)
    validateRequiredString(target.name, `${path}.name`, 'openapi-projection/invalid-type-target', diagnostics)
    validateRequiredString(target.kind, `${path}.kind`, 'openapi-projection/invalid-type-target', diagnostics)

    if (target.source !== undefined) {
      validateSourceCoordinate(target.source, `${path}.source`, diagnostics)
    }
  }
}

function copySourceMap(
  sources: Record<string, SchemaSourceCoordinate>,
): Record<string, SchemaSourceCoordinate> {
  const copied: Record<string, SchemaSourceCoordinate> = {}
  for (const [id, source] of Object.entries(sources)) {
    copied[id] = copySourceCoordinate(source)
  }
  return copied
}

function copyRefEdge(edge: SchemaRefEdge): SchemaRefEdge {
  return {
    from: edge.from,
    ...(edge.to !== undefined ? { to: edge.to } : {}),
    ref: edge.ref,
    kind: edge.kind,
    source: copySourceCoordinate(edge.source),
  }
}

function copySourceCoordinate(source: SchemaSourceCoordinate): SchemaSourceCoordinate {
  if (source.kind === 'file') {
    return {
      kind: 'file',
      filePath: source.filePath,
      pointer: source.pointer,
      ...(source.line !== undefined ? { line: source.line } : {}),
      ...(source.column !== undefined ? { column: source.column } : {}),
    }
  }

  return {
    kind: 'db',
    entity: source.entity,
    id: source.id,
    pointer: source.pointer,
  }
}

function validateSourceCoordinate(
  value: unknown,
  path: string,
  diagnostics: SchemaDiagnostic[],
): value is SchemaSourceCoordinate {
  if (!isRecord(value)) {
    addValidationError(
      diagnostics,
      'openapi-projection/invalid-source',
      `${path} must be a source coordinate object.`,
    )
    return false
  }

  if (value.kind === 'file') {
    let valid = true
    valid = validateRequiredString(value.filePath, `${path}.filePath`, 'openapi-projection/invalid-source', diagnostics) && valid
    valid = validateRequiredString(value.pointer, `${path}.pointer`, 'openapi-projection/invalid-source', diagnostics) && valid
    valid = validateOptionalPositiveInteger(value.line, `${path}.line`, diagnostics) && valid
    valid = validateOptionalPositiveInteger(value.column, `${path}.column`, diagnostics) && valid
    return valid
  }

  if (value.kind === 'db') {
    let valid = true
    valid = validateRequiredString(value.entity, `${path}.entity`, 'openapi-projection/invalid-source', diagnostics) && valid
    valid = validateRequiredString(value.id, `${path}.id`, 'openapi-projection/invalid-source', diagnostics) && valid
    valid = validateRequiredString(value.pointer, `${path}.pointer`, 'openapi-projection/invalid-source', diagnostics) && valid
    return valid
  }

  addValidationError(
    diagnostics,
    'openapi-projection/invalid-source',
    `${path}.kind must be either file or db.`,
  )
  return false
}

function validateRequiredString(
  value: unknown,
  path: string,
  code: string,
  diagnostics: SchemaDiagnostic[],
): value is string {
  if (isNonEmptyString(value)) return true

  addValidationError(diagnostics, code, `${path} must be a non-empty string.`)
  return false
}

function validateOptionalPositiveInteger(
  value: unknown,
  path: string,
  diagnostics: SchemaDiagnostic[],
): boolean {
  if (value === undefined) return true
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) return true

  addValidationError(
    diagnostics,
    'openapi-projection/invalid-source',
    `${path} must be a positive integer when present.`,
  )
  return false
}

function toValidateResult(diagnostics: SchemaDiagnostic[]): SchemaValidateResult {
  return {
    valid: diagnostics.every(diagnostic => diagnostic.severity !== 'error'),
    diagnostics,
  }
}

function addValidationError(
  diagnostics: SchemaDiagnostic[],
  code: string,
  message: string,
): void {
  diagnostics.push({ severity: 'error', code, message })
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isDiagnosticSeverity(value: unknown): value is SchemaDiagnostic['severity'] {
  return value === 'error' || value === 'warning' || value === 'info'
}

function isOpenApiOperationMethod(value: string): boolean {
  return (OPENAPI_OPERATION_METHODS as readonly string[]).includes(value)
}
