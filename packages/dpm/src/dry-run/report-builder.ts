import {
  createDpmDryRunCategories,
  createDpmDryRunImpact,
} from './report-impact.js'
import {
  DPM_DRY_RUN_REPORT_KIND,
  type DpmDryRunInput,
  type DpmDryRunReport,
} from './report-types.js'

export function createDpmDryRunReport(input: DpmDryRunInput): DpmDryRunReport {
  const impact = createDpmDryRunImpact(input)

  return {
    kind: DPM_DRY_RUN_REPORT_KIND,
    planIdentity: input.plan.identity,
    manifestId: input.plan.manifestId,
    stale: input.plan.stale,
    impact,
    categories: createDpmDryRunCategories(impact),
    rawValuesIncluded: false,
  }
}
