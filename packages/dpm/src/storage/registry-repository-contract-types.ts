import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type {
  DpmRegistryRelationshipAuditEventRequest,
  DpmRegistryRelationshipRowRequest,
  DpmRegistryRelationshipSaveInput,
  DpmRegistrySnapshotExportRequest,
} from './registry-repository-request-types.js'
import type {
  DpmRegistryRelationshipAuditEventRow,
} from './registry-audit-row-types.js'
import type { DpmRegistryRelationshipRow } from './registry-storage-row-types.js'
import type {
  DpmRegistryCanonicalKeyEncodingClaimInput,
  DpmRegistryCanonicalKeyEncodingContract,
  DpmRegistryCanonicalKeyEncodingContractRequest,
} from './registry-encoding-contract-types.js'

export type DpmRegistryRelationshipApprovalCommitInput = {
  relationshipRow: DpmRegistryRelationshipRow
  auditEvent: DpmRegistryRelationshipAuditEventRow
}

export type DpmRegistryRelationshipApprovalCommitResult = {
  relationshipRow: DpmRegistryRelationshipRow
  auditEvent: DpmRegistryRelationshipAuditEventRow
}

export type DpmRegistryRelationshipSaveResult = {
  relationshipRow: DpmRegistryRelationshipRow
  approvalAuditEvent?: DpmRegistryRelationshipAuditEventRow
}

export type DpmRegistryStorageReader = {
  listRelationshipRows(
    request: DpmRegistryRelationshipRowRequest,
  ): Promise<readonly DpmRegistryRelationshipRow[]> | readonly DpmRegistryRelationshipRow[]
  /** Reads the durable registry-wide encoding authority when the adapter supports v2 contracts. */
  readCanonicalKeyEncodingContract?(
    request: DpmRegistryCanonicalKeyEncodingContractRequest,
  ): Promise<DpmRegistryCanonicalKeyEncodingContract | undefined>
    | DpmRegistryCanonicalKeyEncodingContract
    | undefined
}

export type DpmRegistryAuditEventReader = {
  listRelationshipAuditEvents(
    request: DpmRegistryRelationshipAuditEventRequest,
  ): Promise<readonly DpmRegistryRelationshipAuditEventRow[]> | readonly DpmRegistryRelationshipAuditEventRow[]
}

type DpmRegistryStorageAuditEventCapabilities = {
  appendRelationshipAuditEvent?(
    row: DpmRegistryRelationshipAuditEventRow,
  ): Promise<DpmRegistryRelationshipAuditEventRow | void> | DpmRegistryRelationshipAuditEventRow | void
  listRelationshipAuditEvents?(
    request: DpmRegistryRelationshipAuditEventRequest,
  ): Promise<readonly DpmRegistryRelationshipAuditEventRow[]> | readonly DpmRegistryRelationshipAuditEventRow[]
}

type DpmRegistryStorageCanonicalKeyEncodingCapabilities = {
  /** Must atomically create the coordinate contract or reject a conflicting version. */
  claimCanonicalKeyEncodingVersion?(
    input: DpmRegistryCanonicalKeyEncodingClaimInput,
  ): Promise<DpmRegistryCanonicalKeyEncodingContract> | DpmRegistryCanonicalKeyEncodingContract
}

type DpmRegistrySplitWriteStorage = DpmRegistryStorageReader
  & DpmRegistryStorageAuditEventCapabilities
  & DpmRegistryStorageCanonicalKeyEncodingCapabilities
  & {
    upsertRelationshipRow(row: DpmRegistryRelationshipRow): Promise<void> | void
    commitRelationshipApproval?: never
  }

type DpmRegistryApprovalCommitStorage = DpmRegistryStorageReader
  & DpmRegistryStorageAuditEventCapabilities
  & DpmRegistryStorageCanonicalKeyEncodingCapabilities
  & {
    commitRelationshipApproval(
      input: DpmRegistryRelationshipApprovalCommitInput,
    ): Promise<DpmRegistryRelationshipApprovalCommitResult> | DpmRegistryRelationshipApprovalCommitResult
    upsertRelationshipRow?(row: DpmRegistryRelationshipRow): Promise<void> | void
  }

export type DpmRegistryStorage = DpmRegistrySplitWriteStorage | DpmRegistryApprovalCommitStorage

export type DpmRegistryRepository = {
  exportSnapshot(request: DpmRegistrySnapshotExportRequest): Promise<RegistrySnapshot>
}

export type DpmRegistryWritableRepository = DpmRegistryRepository & {
  saveRelationship(input: DpmRegistryRelationshipSaveInput): Promise<DpmRegistryRelationshipRow>
  saveRelationshipWithAuditEvent?(
    input: DpmRegistryRelationshipSaveInput,
  ): Promise<DpmRegistryRelationshipSaveResult>
  listRelationshipAuditEvents?(
    request: DpmRegistryRelationshipAuditEventRequest,
  ): Promise<readonly DpmRegistryRelationshipAuditEventRow[]>
}
