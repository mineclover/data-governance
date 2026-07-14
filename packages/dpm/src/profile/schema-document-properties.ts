import {
  DPM_PROFILE_ARTIFACT_KIND,
} from './profile-artifact-kind.js'
import {
  nonEmptyStringSchema,
} from './schema-fragments.js'
import {
  profileEdgesSchema,
  profileNodesSchema,
} from './schema-graph-sections.js'
import {
  profileDiagnosticsSchema,
  profileFreshnessSchema,
  profileMetricsSchema,
} from './schema-observation-sections.js'
import {
  profileEvidenceSourcesSchema,
  profileSourcesSchema,
} from './schema-source-sections.js'

export const DPM_PROFILE_ARTIFACT_SCHEMA_PROPERTIES = {
  kind: { const: DPM_PROFILE_ARTIFACT_KIND },
  profileId: nonEmptyStringSchema,
  datasetId: nonEmptyStringSchema,
  profileVersion: nonEmptyStringSchema,
  createdAt: nonEmptyStringSchema,
  sources: profileSourcesSchema,
  evidenceSources: profileEvidenceSourcesSchema,
  nodes: profileNodesSchema,
  edges: profileEdgesSchema,
  metrics: profileMetricsSchema,
  diagnostics: profileDiagnosticsSchema,
  freshness: profileFreshnessSchema,
} as const
