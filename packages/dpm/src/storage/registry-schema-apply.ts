import {
  DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS,
  DPM_REGISTRY_STORAGE_SCHEMA_VERSION,
} from './registry-schema-sql.js'

export type DpmRegistryStorageSchemaQueryClient = {
  query(sql: string, parameters: readonly unknown[]): Promise<unknown> | unknown
}

export type DpmRegistryStorageSchemaApplyResult = {
  schemaVersion: typeof DPM_REGISTRY_STORAGE_SCHEMA_VERSION
  appliedBlockCount: number
}

export async function applyDpmRegistryStorageSchema(
  client: DpmRegistryStorageSchemaQueryClient,
): Promise<DpmRegistryStorageSchemaApplyResult> {
  for (const sql of DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS) {
    await client.query(sql, [])
  }

  return {
    schemaVersion: DPM_REGISTRY_STORAGE_SCHEMA_VERSION,
    appliedBlockCount: DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS.length,
  }
}
