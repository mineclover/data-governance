import type { DpmProfileArtifactInput } from '../../src/index.js'
import { createDbProfileInput } from './profile-artifact-db-inputs.js'
import { createKafkaProfileInput } from './profile-artifact-kafka-inputs.js'

export type ProfileArtifactSourceCase = {
  readonly label: string
  readonly createInput: () => DpmProfileArtifactInput
}

export const profileArtifactVersionHashPattern = /^sha256:[a-f0-9]{64}$/

export const profileArtifactSourceCases = [
  {
    label: 'PostgreSQL catalog',
    createInput: createDbProfileInput,
  },
  {
    label: 'Kafka topic bundle',
    createInput: createKafkaProfileInput,
  },
] as const satisfies readonly ProfileArtifactSourceCase[]
