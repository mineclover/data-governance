import type { DpmProfileArtifactInput } from '../../src/index.js'
import { createDbProfileInput } from './profile-artifact-db-inputs.js'
import { createKafkaProfileInput } from './profile-artifact-kafka-inputs.js'

export type ProfileArtifactFreshnessChangeCase = {
  readonly label: string
  readonly createOriginalInput: () => DpmProfileArtifactInput
  readonly createChangedInput: () => DpmProfileArtifactInput
}

export const profileArtifactFreshnessChangeCases = [
  {
    label: 'PostgreSQL catalog metric value',
    createOriginalInput: createDbProfileInput,
    createChangedInput: () => ({
      ...createDbProfileInput(),
      metrics: [
        {
          id: 'metric:orders.customer_no.presence',
          kind: 'presence_ratio',
          subjectId: 'node:column:orders.customer_no',
          value: 0.99,
          unit: 'ratio',
          evidenceIds: ['evidence:postgres:orders.customer_no'],
        },
      ],
    }),
  },
  {
    label: 'Kafka topic metric value',
    createOriginalInput: createKafkaProfileInput,
    createChangedInput: () => ({
      ...createKafkaProfileInput(),
      metrics: [
        {
          id: 'metric:orders.created.key_coverage',
          kind: 'key_coverage_ratio',
          subjectId: 'node:key:orders.created',
          value: 0.95,
          unit: 'ratio',
          evidenceIds: ['evidence:kafka:orders.created.customer_no'],
        },
      ],
    }),
  },
] as const satisfies readonly ProfileArtifactFreshnessChangeCase[]
