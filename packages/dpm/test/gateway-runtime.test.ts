import { describe, expect, it } from 'vitest'

import {
  DPM_GATEWAY_RUNTIME_OPERATION_IDS,
  DPM_PROFILE_PROPOSAL_REVIEW_STATUSES,
} from '../src/index.js'
import {
  excludedGatewayRuntimeOperationIds,
  expectedGatewayRuntimeOperationIds,
  expectedProfileProposalReviewStatuses,
} from './support/gateway-runtime-fixtures.js'

describe('DPM gateway runtime adapter', () => {
  it('exposes only local profile, relationship review, and manifest runtime operations', () => {
    expect(DPM_GATEWAY_RUNTIME_OPERATION_IDS).toEqual([...expectedGatewayRuntimeOperationIds])
    expect(DPM_PROFILE_PROPOSAL_REVIEW_STATUSES).toEqual([
      ...expectedProfileProposalReviewStatuses,
    ])
    for (const operationId of excludedGatewayRuntimeOperationIds) {
      expect(DPM_GATEWAY_RUNTIME_OPERATION_IDS).not.toContain(operationId)
    }
  })
})
