import {
  DPM_PROFILE_CAPTURE_MODES,
  DPM_PROFILE_EDGE_KINDS,
  DPM_PROFILE_METRIC_KINDS,
  DPM_PROFILE_NODE_KINDS,
  DPM_PROFILE_SOURCE_KINDS,
} from '../../src/index.js'
import type { SchemaPath } from './schema-path.js'

export type ProfileArtifactSchemaTaxonomyProjectionCase = {
  readonly label: string
  readonly path: SchemaPath
  readonly expected: readonly string[]
}

export const profileArtifactSchemaTaxonomyProjectionCases = [
  {
    label: 'source kinds',
    path: ['properties', 'sources', 'items', 'properties', 'kind', 'enum'],
    expected: DPM_PROFILE_SOURCE_KINDS,
  },
  {
    label: 'source capture modes',
    path: ['properties', 'sources', 'items', 'properties', 'captureMode', 'enum'],
    expected: DPM_PROFILE_CAPTURE_MODES,
  },
  {
    label: 'node kinds',
    path: ['properties', 'nodes', 'items', 'properties', 'kind', 'enum'],
    expected: DPM_PROFILE_NODE_KINDS,
  },
  {
    label: 'edge kinds',
    path: ['properties', 'edges', 'items', 'properties', 'kind', 'enum'],
    expected: DPM_PROFILE_EDGE_KINDS,
  },
  {
    label: 'metric kinds',
    path: ['properties', 'metrics', 'items', 'properties', 'kind', 'enum'],
    expected: DPM_PROFILE_METRIC_KINDS,
  },
] as const satisfies readonly ProfileArtifactSchemaTaxonomyProjectionCase[]
