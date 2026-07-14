export type RegistryApprovalMetadata = {
  owner: string
  approvedBy?: string
  approvedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  reason?: string
}

export type ApprovedRegistryApprovalMetadata = RegistryApprovalMetadata & {
  approvedBy: string
  reason: string
}
