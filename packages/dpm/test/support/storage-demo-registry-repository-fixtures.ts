import {
  createDpmRegistryRepository,
  type DpmRegistryRelationshipRow,
  type DpmRegistryRepository,
} from '../../src/index.js'

export function createStorageDemoRegistryRepository(
  registryRows: DpmRegistryRelationshipRow[],
): DpmRegistryRepository {
  return createDpmRegistryRepository({
    listRelationshipRows: async request =>
      registryRows.filter(row =>
        row.datasetId === request.datasetId && row.registryVersion === request.registryVersion,
      ),
  })
}

