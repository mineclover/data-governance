import {
  createRelationshipDiscoveryReport,
  type RelationshipDiscoveryReport,
  type RelationshipDiscoveryReportInput,
} from '../../src/index.js'
import { readDpmJsonFixture } from './fixture-io.js'

export const expectedCommerceDiscoveryEvidenceKinds = [
  'column_name_similarity',
  'orm_metadata',
  'query_log',
  'unique_candidate',
] as const

export const expectedCommerceLowConfidenceWarningReasons = [
  'ambiguous-status-column',
  'low-confidence',
] as const

export function readDiscoveryFixture<T>(name: string): T {
  return readDpmJsonFixture<T>(`discovery/${name}`)
}

export function readCommerceDiscoveryReport(): RelationshipDiscoveryReport {
  return createRelationshipDiscoveryReport(
    readCommerceDiscoveryReportInput(),
  )
}

export function readCommerceDiscoveryReportInput(): RelationshipDiscoveryReportInput {
  return readDiscoveryFixture<RelationshipDiscoveryReportInput>('commerce-candidates.json')
}
