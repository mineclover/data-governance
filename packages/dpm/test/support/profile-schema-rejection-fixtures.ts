import type {
  DpmProfileArtifact,
} from '../../src/index.js'

export type ProfileArtifactSchemaRejectionCase = {
  readonly label: string
  readonly createPayload: (profile: DpmProfileArtifact) => unknown
}

export const profileArtifactSchemaRejectionCases = [
  {
    label: 'unknown source kind',
    createPayload: (profile) => ({
      ...profile,
      sources: [{ ...profile.sources[0]!, kind: 'unknown_source' }],
    }),
  },
  {
    label: 'node without coordinate provenance',
    createPayload: (profile) => ({
      ...profile,
      nodes: [{ id: 'node:field:missing-provenance', kind: 'message_field', label: 'missing' }],
    }),
  },
  {
    label: 'raw sample payload field',
    createPayload: (profile) => ({
      ...profile,
      rawSample: { customer_no: 'C-001' },
    }),
  },
  {
    label: 'raw sample shape key',
    createPayload: (profile) => ({
      ...profile,
      nodes: [
        {
          ...profile.nodes[0]!,
          shape: {
            rawSample: 'C-001',
          },
        },
      ],
    }),
  },
] as const satisfies readonly ProfileArtifactSchemaRejectionCase[]
