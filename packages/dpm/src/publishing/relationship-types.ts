export type DpmRelationshipMetadata = {
  name: string
  namespace: string
  cardinality: string
  parentTable: string
  parentColumns: string[]
  childTable: string
  childColumns: string[]
  joinPredicate: string
  transformStrategy: string
  orphanPolicy: string
  readonly: true
}
