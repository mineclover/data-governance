import type {
  SchemaSourceCoordinate,
} from '../contract/openapi-projection.js'

export type CatalogDiagnostic = {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  source?: SchemaSourceCoordinate
}
