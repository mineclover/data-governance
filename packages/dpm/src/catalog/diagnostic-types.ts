import type {
  SchemaSourceCoordinate,
} from '@oa-sdk/openapi-projection-contract'

export type CatalogDiagnostic = {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  source?: SchemaSourceCoordinate
}
