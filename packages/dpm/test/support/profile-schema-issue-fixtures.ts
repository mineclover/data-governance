import type {
  DpmProfileArtifact,
} from '../../src/index.js'

export type ProfileArtifactSchemaIssueCase = {
  readonly label: string
  readonly createPayload: (profile: DpmProfileArtifact) => unknown
  readonly expectedInstancePathFragment: string
}

export const profileArtifactSchemaIssueCases = [
  {
    label: 'empty metric id',
    createPayload: (profile) => ({
      ...profile,
      metrics: [{ id: '', kind: 'presence_ratio', subjectId: 'node:key:orders.created', value: 1 }],
    }),
    expectedInstancePathFragment: '/metrics/0/id',
  },
] as const satisfies readonly ProfileArtifactSchemaIssueCase[]
