export type { DpmBaseline, DpmPackageMetadata, DpmVersion } from '../types.js'
export type {
  DpmManifestSchemaIssue,
  DpmManifestSchemaValidationResult,
} from '../schema/index.js'
export {
  DPM_MANIFEST_SCHEMA_ID,
  validateDpmManifestSchema,
} from '../schema/index.js'

export const DPM_PACKAGE_NAME = '@mineclover/dpm' as const
export const DPM_BASELINE = 'relationship-first' as const
export const DPM_VERSION = '1.0' as const
