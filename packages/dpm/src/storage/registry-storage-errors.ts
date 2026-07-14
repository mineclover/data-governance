export const DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE =
  'DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT' as const

export type DpmRegistryApprovedRelationshipConflictErrorCode =
  typeof DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE

export type DpmRegistryApprovedRelationshipConflictDetails = {
  datasetId: string
  registryVersion: string
  relationshipName: string
  relationshipVersion: string
  constraint: string
}

export class DpmRegistryApprovedRelationshipConflictError extends Error {
  readonly code = DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE
  readonly datasetId: string
  readonly registryVersion: string
  readonly relationshipName: string
  readonly relationshipVersion: string
  readonly constraint: string

  constructor(details: DpmRegistryApprovedRelationshipConflictDetails, cause?: unknown) {
    super(createApprovedRelationshipConflictMessage(details))
    this.name = 'DpmRegistryApprovedRelationshipConflictError'
    this.datasetId = details.datasetId
    this.registryVersion = details.registryVersion
    this.relationshipName = details.relationshipName
    this.relationshipVersion = details.relationshipVersion
    this.constraint = details.constraint
    if (cause !== undefined) {
      Object.defineProperty(this, 'cause', {
        value: cause,
        configurable: true,
      })
    }
  }
}

export function isDpmRegistryApprovedRelationshipConflictError(
  error: unknown,
): error is DpmRegistryApprovedRelationshipConflictError {
  if (error instanceof DpmRegistryApprovedRelationshipConflictError) return true
  if (!error || typeof error !== 'object') return false

  const record = error as {
    code?: unknown
    name?: unknown
  }

  return record.name === 'DpmRegistryApprovedRelationshipConflictError'
    && record.code === DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE
}

function createApprovedRelationshipConflictMessage(
  details: DpmRegistryApprovedRelationshipConflictDetails,
): string {
  return `DPM registry already has an approved relationship named ${details.relationshipName} `
    + `for dataset ${details.datasetId} registry ${details.registryVersion}; `
    + `attempted version ${details.relationshipVersion} conflicts with ${details.constraint}.`
}
