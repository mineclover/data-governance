import type { DpmProfileConnectorEvidenceKind } from '../../src/index.js'

export const completeConnectorEvidenceKinds = [
  'source',
  'evidence_source',
  'node',
  'edge',
  'metric',
] as const satisfies readonly DpmProfileConnectorEvidenceKind[]
