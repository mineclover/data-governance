import type {
  DpmJobRepository,
  DpmJobStorage,
} from './job-repository-contract-types.js'
import { createDpmJobRow } from './job-row-builder.js'

export function createDpmJobRepository(storage: DpmJobStorage): DpmJobRepository {
  return {
    async saveJob(input) {
      const row = createDpmJobRow(input)
      await storage.upsertJob(row)
      return row
    },
    async getJob(request) {
      const row = await storage.getJob(request)
      return row ? createDpmJobRow(row) : undefined
    },
  }
}
