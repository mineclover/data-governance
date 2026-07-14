import { createHash } from 'node:crypto'

import type { CatalogColumn, CatalogSnapshot } from '../catalog/types.js'
import {
  createDpmIdentityDataDefinitions,
} from '../model/data-identity-normalize.js'
import type {
  DpmDataSourceCoordinate,
  DpmIdentityDataDefinitionsInput,
} from '../model/data-identity-types.js'
import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmApiCoordinate, DpmCatalogCoordinate, DpmDiagnostic } from './diagnostic-types.js'
import type { DpmApiArtifactInput } from './data-binding-types.js'
import { asArray, asRecord, asString } from './value-utils.js'

export function validateDpmDataBindings(input: {
  manifest: Record<string, unknown>
  catalog: CatalogSnapshot
  apiArtifacts?: readonly DpmApiArtifactInput[]
}): DpmDiagnostic[] {
  const wire = asRecord(input.manifest.data_definitions)
  if (asString(wire.version) !== '1.1') return []

  let definitions: ReturnType<typeof createDpmIdentityDataDefinitions>
  try {
    definitions = createDpmIdentityDataDefinitions(readDpmIdentityDataDefinitions(wire))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return [createDataDiagnostic({
      code: message.includes('multiple logical fields') ? 'DAT012' : 'DAT011',
      message: `Invalid data_definitions v1.1 identity contract: ${message}`,
      sourcePointer: '/data_definitions',
    })]
  }

  const diagnostics: DpmDiagnostic[] = []
  const datasetId = asString(asRecord(input.manifest.metadata).dataset_id)
  const entityIdentities = new Set(
    asArray(input.manifest.entities)
      .map(entity => asRecord(entity))
      .map(entity => `${datasetId}/${asString(entity.namespace)}/${asString(entity.name)}`)
      .filter(identity => !identity.endsWith('//')),
  )
  const manifestCatalog = asRecord(input.manifest.catalog)
  const manifestSnapshotRef = asString(manifestCatalog.snapshot_ref)
  const manifestCatalogVersionHash = asString(manifestCatalog.version_hash)
  let manifestCatalogHashReported = false

  for (const [index, field] of definitions.fields.entries()) {
    const fieldPointer = `/data_definitions/fields/${index}`
    const entityIdentity = `${field.entity.datasetId}/${field.entity.namespace}/${field.entity.name}`
    if (field.entity.datasetId !== datasetId || !entityIdentities.has(entityIdentity)) {
      diagnostics.push(createDataDiagnostic({
        code: 'DAT001',
        message: `Logical data field ${field.objectId} references undeclared DPM entity ${entityIdentity}.`,
        sourcePointer: `${fieldPointer}/entity`,
      }))
    }

    if (field.storageRef) {
      const storagePointer = `${fieldPointer}/storage_ref`
      const catalogCoordinate: DpmCatalogCoordinate = {
        table: field.storageRef.table,
        column: field.storageRef.column,
      }
      if (manifestSnapshotRef && field.storageRef.catalog.snapshotId !== manifestSnapshotRef) {
        diagnostics.push(createDataDiagnostic({
          code: 'DAT002',
          message: `Storage binding snapshot ${field.storageRef.catalog.snapshotId} does not match manifest catalog ${manifestSnapshotRef}.`,
          sourcePointer: `${storagePointer}/catalog/snapshot_id`,
          catalogCoordinate,
        }))
      }
      if (field.storageRef.catalog.versionHash !== input.catalog.freshness.versionHash) {
        diagnostics.push(createDataDiagnostic({
          code: 'DAT004',
          message: `Storage binding freshness ${field.storageRef.catalog.versionHash} does not match selected catalog ${input.catalog.freshness.versionHash}.`,
          sourcePointer: `${storagePointer}/catalog/version_hash`,
          catalogCoordinate,
        }))
      }
      if (manifestCatalogVersionHash && manifestCatalogVersionHash !== input.catalog.freshness.versionHash && !manifestCatalogHashReported) {
        diagnostics.push(createDataDiagnostic({
          code: 'DAT004',
          message: `Manifest catalog freshness ${manifestCatalogVersionHash} does not match selected catalog ${input.catalog.freshness.versionHash}.`,
          sourcePointer: '/catalog/version_hash',
          catalogCoordinate,
        }))
        manifestCatalogHashReported = true
      }

      const column = findCatalogColumn(input.catalog, field.storageRef.table, field.storageRef.column)
      if (!column) {
        diagnostics.push(createDataDiagnostic({
          code: 'DAT003',
          message: `Storage binding ${field.storageRef.table}#${field.storageRef.column} is not present in the selected catalog.`,
          sourcePointer: storagePointer,
          catalogCoordinate,
        }))
      } else if (field.storageRef.catalog.sourceCoordinate) {
        if (!column.source || !sourceCoordinatesEqual(field.storageRef.catalog.sourceCoordinate, column.source)) {
          diagnostics.push(createDataDiagnostic({
            code: 'DAT005',
            message: `Storage binding source coordinate does not match catalog evidence for ${field.storageRef.table}#${field.storageRef.column}.`,
            sourcePointer: `${storagePointer}/catalog/source_coordinate`,
            catalogCoordinate,
          }))
        }
      }
    }
  }

  const artifacts = new Map<string, DpmApiArtifactInput>()
  for (const artifact of input.apiArtifacts ?? []) {
    if (!artifacts.has(artifact.artifactId)) artifacts.set(artifact.artifactId, artifact)
  }
  for (const [index, binding] of definitions.apiBindings.entries()) {
    const apiPointer = `/data_definitions/api_bindings/${index}/api`
    const apiCoordinate: DpmApiCoordinate = {
      artifactId: binding.api.artifactId,
      versionHash: binding.api.versionHash,
      pointer: binding.api.pointer,
      ...(binding.api.operationId ? { operationId: binding.api.operationId } : {}),
    }
    const artifact = artifacts.get(binding.api.artifactId)
    if (!artifact) {
      diagnostics.push(createDataDiagnostic({
        code: 'DAT006',
        message: `API artifact ${binding.api.artifactId} is not available for semantic binding validation.`,
        sourcePointer: apiPointer,
        apiCoordinate,
      }))
      continue
    }

    const computedVersionHash = computeDpmApiArtifactVersionHash(artifact.document)
    if (artifact.versionHash && artifact.versionHash !== computedVersionHash) {
      diagnostics.push(createDataDiagnostic({
        code: 'DAT007',
        message: `API artifact ${artifact.artifactId} declares ${artifact.versionHash}, but its document hashes to ${computedVersionHash}.`,
        sourcePointer: apiPointer,
        apiCoordinate,
      }))
    }
    if (binding.api.versionHash !== computedVersionHash) {
      diagnostics.push(createDataDiagnostic({
        code: 'DAT007',
        message: `API binding version ${binding.api.versionHash} does not match artifact ${artifact.artifactId} hash ${computedVersionHash}.`,
        sourcePointer: `${apiPointer}/version_hash`,
        apiCoordinate,
      }))
    }
    if (artifact.provenance && artifact.provenance.versionHash !== computedVersionHash) {
      diagnostics.push(createDataDiagnostic({
        code: 'DAT010',
        message: `API provenance version ${artifact.provenance.versionHash} does not match artifact ${artifact.artifactId} hash ${computedVersionHash}.`,
        sourcePointer: apiPointer,
        apiCoordinate,
      }))
    }
    if (artifact.provenance?.sourceCoordinate && !isSourceCoordinateValid(artifact.provenance.sourceCoordinate)) {
      diagnostics.push(createDataDiagnostic({
        code: 'DAT010',
        message: `API provenance source coordinate for artifact ${artifact.artifactId} is incomplete.`,
        sourcePointer: apiPointer,
        apiCoordinate,
      }))
    }

    const pointerSegments = parseJsonPointer(binding.api.pointer)
    if (!pointerSegments || resolveJsonPointerSegments(artifact.document, pointerSegments) === undefined) {
      diagnostics.push(createDataDiagnostic({
        code: 'DAT008',
        message: `API pointer ${binding.api.pointer} is not present in artifact ${artifact.artifactId}.`,
        sourcePointer: `${apiPointer}/pointer`,
        apiCoordinate,
      }))
    }
    if (binding.api.operationId) {
      const operation = pointerSegments && pointerSegments[0] === 'paths' && pointerSegments.length >= 3
        ? resolveJsonPointerSegments(artifact.document, pointerSegments.slice(0, 3))
        : undefined
      if (!operation || typeof operation !== 'object' || (operation as Record<string, unknown>).operationId !== binding.api.operationId) {
        diagnostics.push(createDataDiagnostic({
          code: 'DAT009',
          message: `API operationId ${binding.api.operationId} is inconsistent with pointer ${binding.api.pointer}.`,
          sourcePointer: `${apiPointer}/operation_id`,
          apiCoordinate,
        }))
      }
    }
  }

  return diagnostics
}

export function computeDpmApiArtifactVersionHash(document: unknown): string {
  const stable = JSON.stringify(sortValue(document)) ?? 'null'
  return `sha256:${createHash('sha256').update(stable).digest('hex')}`
}

export function readDpmIdentityDataDefinitions(wire: Record<string, unknown>): DpmIdentityDataDefinitionsInput {
  return {
    version: '1.1',
    fields: asArray(wire.fields).map(field => {
      const record = asRecord(field)
      const entity = asRecord(record.entity)
      const storage = record.storage_ref === undefined ? undefined : asRecord(record.storage_ref)
      const catalog = storage ? asRecord(storage.catalog) : undefined
      const source = catalog?.source_coordinate === undefined
        ? undefined
        : readSourceCoordinate(asRecord(catalog.source_coordinate))
      return {
        objectId: asString(record.object_id),
        revisionId: asString(record.revision_id),
        entity: {
          datasetId: asString(entity.dataset_id),
          namespace: asString(entity.namespace),
          name: asString(entity.name),
        },
        name: asString(record.name),
        type: asString(record.type) as DpmIdentityDataDefinitionsInput['fields'][number]['type'],
        origin: asString(record.origin) as DpmIdentityDataDefinitionsInput['fields'][number]['origin'],
        ...(record.nullable === undefined ? {} : { nullable: record.nullable as boolean }),
        ...(record.description === undefined ? {} : { description: asString(record.description) }),
        ...(storage && catalog ? {
          storageRef: {
            table: asString(storage.table),
            column: asString(storage.column),
            catalog: {
              snapshotId: asString(catalog.snapshot_id),
              versionHash: asString(catalog.version_hash),
              ...(source ? { sourceCoordinate: source } : {}),
            },
          },
        } : {}),
        ...(record.lifecycle === undefined ? {} : { lifecycle: asString(record.lifecycle) as NonNullable<DpmIdentityDataDefinitionsInput['fields'][number]['lifecycle']> }),
        ...(record.aliases === undefined ? {} : { aliases: asArray(record.aliases).map(asString) }),
        ...(record.superseded_by_object_id === undefined ? {} : { supersededByObjectId: asString(record.superseded_by_object_id) }),
      }
    }),
    apiBindings: asArray(wire.api_bindings).map(binding => {
      const record = asRecord(binding)
      const dataField = asRecord(record.data_field)
      const api = asRecord(record.api)
      return {
        bindingId: asString(record.binding_id),
        dataField: {
          objectId: asString(dataField.object_id),
          revisionId: asString(dataField.revision_id),
        },
        api: {
          artifactId: asString(api.artifact_id),
          pointer: asString(api.pointer),
          versionHash: asString(api.version_hash),
          ...(api.operation_id === undefined ? {} : { operationId: asString(api.operation_id) }),
        },
        direction: asString(record.direction) as NonNullable<DpmIdentityDataDefinitionsInput['apiBindings']>[number]['direction'],
      }
    }),
  }
}

function readSourceCoordinate(record: Record<string, unknown>): DpmDataSourceCoordinate {
  if (asString(record.kind) === 'file') {
    return {
      kind: 'file',
      filePath: asString(record.file_path),
      pointer: asString(record.pointer),
      ...(record.line === undefined ? {} : { line: record.line as number }),
      ...(record.column === undefined ? {} : { column: record.column as number }),
    }
  }
  return {
    kind: 'db',
    entity: asString(record.entity),
    id: asString(record.id),
    pointer: asString(record.pointer),
  }
}

function findCatalogColumn(catalog: CatalogSnapshot, tableName: string, columnName: string): CatalogColumn | undefined {
  if (!catalog.tables.some(table => table.table === tableName)) return undefined
  return catalog.columns.find(column => column.table === tableName && column.name === columnName)
}

function sourceCoordinatesEqual(left: DpmDataSourceCoordinate, right: unknown): boolean {
  return stableStringify(left) === stableStringify(right)
}

function isSourceCoordinateValid(source: DpmDataSourceCoordinate): boolean {
  if (source.kind === 'file') {
    return Boolean(source.filePath && source.pointer)
  }
  if (source.kind === 'db') {
    return Boolean(source.entity && source.id && source.pointer)
  }
  return false
}

function parseJsonPointer(pointer: string): string[] | undefined {
  if (pointer === '#') return []
  if (!pointer.startsWith('#/')) return undefined
  try {
    return pointer.slice(2).split('/').map(segment => decodeJsonPointerSegment(decodeURIComponent(segment)))
  } catch {
    return undefined
  }
}

function decodeJsonPointerSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

function resolveJsonPointerSegments(document: unknown, segments: readonly string[]): unknown {
  let current: unknown = document
  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = Number(segment)
      if (!Number.isInteger(index) || index < 0 || index >= current.length) return undefined
      current = current[index]
    } else if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, segment)) {
      current = (current as Record<string, unknown>)[segment]
    } else {
      return undefined
    }
  }
  return current
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value)) ?? 'null'
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    const next = (value as Record<string, unknown>)[key]
    if (next !== undefined) sorted[key] = sortValue(next)
  }
  return sorted
}

function createDataDiagnostic(input: {
  code: Extract<import('./diagnostic-taxonomy.js').DpmDiagnosticCode, `DAT${string}`>
  message: string
  sourcePointer: string
  apiCoordinate?: DpmApiCoordinate
  catalogCoordinate?: DpmCatalogCoordinate
}): DpmDiagnostic {
  return createDpmDiagnostic({
    severity: 'error',
    code: input.code,
    message: input.message,
    sourcePointer: input.sourcePointer,
    ...(input.apiCoordinate ? { apiCoordinate: input.apiCoordinate } : {}),
    ...(input.catalogCoordinate ? { catalogCoordinate: input.catalogCoordinate } : {}),
  })
}
