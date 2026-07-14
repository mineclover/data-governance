import {
  postgresCatalogRowsToSnapshot,
  type PostgresCatalogProfileRow,
} from '../../src/index.js'
import {
  storageDemoCapturedAt,
  storageDemoDatabase,
} from './storage-demo-constant-fixtures.js'

export function createStorageDemoFixtureCatalog(catalogRows: PostgresCatalogProfileRow[]) {
  return postgresCatalogRowsToSnapshot({
    database: storageDemoDatabase,
    capturedAt: storageDemoCapturedAt,
    rows: catalogRows,
  })
}

