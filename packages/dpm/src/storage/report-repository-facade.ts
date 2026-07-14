import { validationReportToGatewayJobReport } from './report-gateway-projection.js'
import type {
  DpmReportRepository,
  DpmValidationReportStorage,
} from './report-repository-contract-types.js'
import { createDpmValidationReport } from './report-row-builder.js'

export function createDpmReportRepository(storage: DpmValidationReportStorage): DpmReportRepository {
  return {
    async saveReport(input) {
      const row = createDpmValidationReport(input)
      await storage.upsertReport(row)
      return row
    },
    async getJobReport(request) {
      const row = await storage.getValidationReport(request)
      return row ? validationReportToGatewayJobReport(request, row) : undefined
    },
  }
}
