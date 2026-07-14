export const APPROVED_REGISTRY_RELATIONSHIP_REQUIRED_APPROVAL_FIELDS = [
  'approval.approvedBy',
  'approval.reason',
] as const

export type ApprovedRegistryRelationshipRequiredApprovalField =
  typeof APPROVED_REGISTRY_RELATIONSHIP_REQUIRED_APPROVAL_FIELDS[number]

export function assertApprovedRegistryRelationshipApprovalMetadata(input: {
  context: string
  relationshipName: string
  approval?: ApprovedRegistryRelationshipApprovalFieldInput | undefined
}): void {
  const missingFields = getMissingApprovedRegistryRelationshipApprovalFields(input.approval)

  if (missingFields.length === 0) return

  throw new Error(
    `DPM registry ${input.context} approved relationship ${input.relationshipName} `
    + `is missing ${missingFields.join(', ')}.`,
  )
}

export function getMissingApprovedRegistryRelationshipApprovalFields(
  approval?: ApprovedRegistryRelationshipApprovalFieldInput,
): ApprovedRegistryRelationshipRequiredApprovalField[] {
  return APPROVED_REGISTRY_RELATIONSHIP_REQUIRED_APPROVAL_FIELDS.filter(field => {
    switch (field) {
      case 'approval.approvedBy':
        return !isNonEmptyString(approval?.approvedBy)
      case 'approval.reason':
        return !isNonEmptyString(approval?.reason)
    }
  })
}

type ApprovedRegistryRelationshipApprovalFieldInput = {
  approvedBy?: unknown
  reason?: unknown
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
