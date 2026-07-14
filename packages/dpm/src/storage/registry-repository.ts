import type {
  DpmRegistryRelationshipSaveInput,
  DpmRegistryRelationshipSaveResult,
  DpmRegistryRelationshipRow,
  DpmRegistryRepository,
  DpmRegistryStorage,
  DpmRegistryStorageReader,
  DpmRegistryWritableRepository,
} from './registry-repository-types.js'
import {
  DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION,
} from '../model/canonical-key-encoding.js'
import {
  copyDpmRegistryRelationshipAuditEventRow,
  createDpmRegistryRelationshipAuditEventRow,
} from './registry-audit-event.js'
import { registryRowsToSnapshot } from './registry-row-mapper.js'
import {
  copyDpmRegistryRelationshipRow,
  createDpmRegistryRelationshipRow,
} from './registry-row-relationship.js'
import {
  DpmRegistryApprovedRelationshipConflictError,
} from './registry-storage-errors.js'
import {
  resolveDpmRegistryRowsCanonicalKeyEncodingVersion,
} from './registry-row-canonical-key-encoding.js'

const DPM_REGISTRY_REPOSITORY_APPROVED_RELATIONSHIP_CONFLICT_CONSTRAINT =
  'dpm_registry_repository_single_approved_relationship_name'

export type {
  DpmPostgresRegistryClient,
  DpmPostgresRegistryQueryClient,
} from './registry-postgres-storage.js'
export type {
  DpmRegistryCanonicalKeyEncodingClaimInput,
  DpmRegistryCanonicalKeyEncodingContract,
  DpmRegistryCanonicalKeyEncodingContractRequest,
  DpmRegistryRelationshipApprovalCommitInput,
  DpmRegistryRelationshipApprovalCommitResult,
  DpmRegistryRelationshipSaveResult,
  DpmRegistryRelationshipAuditEventRequest,
  DpmRegistryRelationshipAuditEventRow,
  DpmRegistryRelationshipAuditEventType,
  DpmRegistryRelationshipRow,
  DpmRegistryRelationshipSaveInput,
  DpmRegistryRelationshipRowRequest,
  DpmRegistryAuditEventReader,
  DpmRegistryRepository,
  DpmRegistryRowsToSnapshotInput,
  DpmRegistrySnapshotExportRequest,
  DpmRegistryStorage,
  DpmRegistryStorageReader,
  DpmRegistryWritableRepository,
} from './registry-repository-types.js'
export type {
  DpmRegistryApprovedRelationshipConflictDetails,
  DpmRegistryApprovedRelationshipConflictErrorCode,
} from './registry-storage-errors.js'
export {
  DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES,
} from './registry-audit-row-types.js'
export {
  copyDpmRegistryRelationshipAuditEventRow,
  createDpmRegistryRelationshipAuditEventRow,
  type DpmRegistryRelationshipAuditEventInput,
} from './registry-audit-event.js'
export { registryRowsToSnapshot } from './registry-row-mapper.js'
export {
  copyDpmRegistryRelationshipRow,
  createDpmRegistryRelationshipRow,
} from './registry-row-relationship.js'
export {
  appendDpmPostgresRegistryRelationshipAuditEvent,
  commitDpmPostgresRegistryRelationshipApproval,
  createDpmPostgresRegistryStorage,
  listDpmPostgresRegistryRelationshipAuditEvents,
  listDpmPostgresRegistryRelationshipRows,
  upsertDpmPostgresRegistryRelationshipRow,
} from './registry-postgres-storage.js'
export {
  DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE,
  DpmRegistryApprovedRelationshipConflictError,
  isDpmRegistryApprovedRelationshipConflictError,
} from './registry-storage-errors.js'

export function createDpmRegistryRepository(storage: DpmRegistryStorage): DpmRegistryWritableRepository
export function createDpmRegistryRepository(reader: DpmRegistryStorageReader): DpmRegistryRepository
export function createDpmRegistryRepository(
  reader: DpmRegistryStorageReader,
): DpmRegistryRepository | DpmRegistryWritableRepository {
  const repository: DpmRegistryRepository = {
    async exportSnapshot(request) {
      const coordinate = {
        datasetId: request.datasetId,
        registryVersion: request.registryVersion,
      }
      const [rows, registryContract] = await Promise.all([
        reader.listRelationshipRows(coordinate),
        reader.readCanonicalKeyEncodingContract?.(coordinate),
      ])

      return registryRowsToSnapshot({
        ...request,
        ...(registryContract ? { registryContract } : {}),
        rows,
      })
    },
  }

  if (!isDpmRegistryStorage(reader)) {
    return repository
  }
  const storage = reader

  const writableRepository: DpmRegistryWritableRepository = {
    ...repository,
    async saveRelationship(input: DpmRegistryRelationshipSaveInput) {
      const result = await saveRelationshipWithAuditEvent(input)
      return copyDpmRegistryRelationshipRow(result.relationshipRow)
    },
    saveRelationshipWithAuditEvent,
  }
  if (storage.listRelationshipAuditEvents) {
    writableRepository.listRelationshipAuditEvents = async request => {
      const events = await storage.listRelationshipAuditEvents?.(request)
      return [...(events ?? [])].map(copyDpmRegistryRelationshipAuditEventRow)
    }
  }

  return writableRepository

  async function saveRelationshipWithAuditEvent(
    input: DpmRegistryRelationshipSaveInput,
  ): Promise<DpmRegistryRelationshipSaveResult> {
    const row = createDpmRegistryRelationshipRow(input)
    await claimRegistryCanonicalKeyEncodingVersion(storage, row)
    const existingRows = await reader.listRelationshipRows({
      datasetId: input.datasetId,
      registryVersion: input.registryVersion,
    })
    assertRegistryCanonicalKeyEncodingMatchesExistingRows(row, existingRows)
    assertNoConflictingApprovedRegistryRelationshipRow(row, existingRows)
    const auditEvent = storage.commitRelationshipApproval || storage.appendRelationshipAuditEvent
      ? createDpmRegistryRelationshipAuditEventRow({
          relationshipRow: row,
          ...(input.auditEventId ? { eventId: input.auditEventId } : {}),
          ...(input.auditOccurredAt ? { occurredAt: input.auditOccurredAt } : {}),
          ...(input.auditCreatedAt ? { createdAt: input.auditCreatedAt } : {}),
        })
      : undefined
    if (storage.commitRelationshipApproval && auditEvent) {
      const committed = await storage.commitRelationshipApproval({
        relationshipRow: copyDpmRegistryRelationshipRow(row),
        auditEvent: copyDpmRegistryRelationshipAuditEventRow(auditEvent),
      })
      return {
        relationshipRow: copyDpmRegistryRelationshipRow(committed.relationshipRow),
        approvalAuditEvent: copyDpmRegistryRelationshipAuditEventRow(committed.auditEvent),
      }
    }
    if (!storage.upsertRelationshipRow) {
      throw new Error('DPM registry writable storage must provide upsertRelationshipRow or commitRelationshipApproval.')
    }
    await storage.upsertRelationshipRow(copyDpmRegistryRelationshipRow(row))
    if (storage.appendRelationshipAuditEvent && auditEvent) {
      const appendedAuditEvent = await storage.appendRelationshipAuditEvent(
        copyDpmRegistryRelationshipAuditEventRow(auditEvent),
      )
      return {
        relationshipRow: copyDpmRegistryRelationshipRow(row),
        approvalAuditEvent: copyDpmRegistryRelationshipAuditEventRow(appendedAuditEvent ?? auditEvent),
      }
    }
    return {
      relationshipRow: copyDpmRegistryRelationshipRow(row),
    }
  }
}

async function claimRegistryCanonicalKeyEncodingVersion(
  storage: DpmRegistryStorage,
  row: ReturnType<typeof createDpmRegistryRelationshipRow>,
): Promise<void> {
  const claim = storage.claimCanonicalKeyEncodingVersion
  const read = storage.readCanonicalKeyEncodingContract
  if (!claim || !read) {
    if (row.canonicalKeyEncodingVersion === DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION) return
    throw new Error(
      'DPM typed-v2 registry saves require storage with atomic '
      + 'claimCanonicalKeyEncodingVersion and readCanonicalKeyEncodingContract capabilities.',
    )
  }

  const contract = await claim({
    datasetId: row.datasetId,
    registryVersion: row.registryVersion,
    canonicalKeyEncodingVersion: row.canonicalKeyEncodingVersion,
  })
  if (
    contract.datasetId !== row.datasetId
    || contract.registryVersion !== row.registryVersion
    || contract.canonicalKeyEncodingVersion !== row.canonicalKeyEncodingVersion
  ) {
    throw new Error(
      `DPM registry encoding claim returned ${contract.datasetId}@${contract.registryVersion} `
      + `${contract.canonicalKeyEncodingVersion}; expected ${row.datasetId}@${row.registryVersion} `
      + `${row.canonicalKeyEncodingVersion}.`,
    )
  }
}

function assertRegistryCanonicalKeyEncodingMatchesExistingRows(
  row: ReturnType<typeof createDpmRegistryRelationshipRow>,
  existingRows: readonly DpmRegistryRelationshipRow[],
): void {
  const existingEncodingVersion = resolveDpmRegistryRowsCanonicalKeyEncodingVersion(existingRows)
  if (!existingEncodingVersion || existingEncodingVersion === row.canonicalKeyEncodingVersion) return

  throw new Error(
    `DPM registry ${row.datasetId}@${row.registryVersion} stores canonical key encoding `
    + `${existingEncodingVersion}; cannot save ${row.canonicalKeyEncodingVersion}.`,
  )
}

function isDpmRegistryStorage(reader: DpmRegistryStorageReader): reader is DpmRegistryStorage {
  return (
    'upsertRelationshipRow' in reader && typeof reader.upsertRelationshipRow === 'function'
  ) || (
    'commitRelationshipApproval' in reader && typeof reader.commitRelationshipApproval === 'function'
  )
}

function assertNoConflictingApprovedRegistryRelationshipRow(
  row: ReturnType<typeof createDpmRegistryRelationshipRow>,
  existingRows: readonly DpmRegistryRelationshipRow[],
): void {
  const conflictingApproved = existingRows.find(existing =>
    existing.status === 'approved'
    && existing.relationshipName === row.relationshipName
    && existing.relationshipVersion !== row.relationshipVersion
  )
  if (!conflictingApproved) return

  throw new DpmRegistryApprovedRelationshipConflictError({
    datasetId: row.datasetId,
    registryVersion: row.registryVersion,
    relationshipName: row.relationshipName,
    relationshipVersion: row.relationshipVersion,
    constraint: DPM_REGISTRY_REPOSITORY_APPROVED_RELATIONSHIP_CONFLICT_CONSTRAINT,
  })
}
