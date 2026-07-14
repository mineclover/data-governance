export type DpmAiRelationshipContext = {
  name: string
  namespace: string
  cardinality: string
  description: string
  joinPredicate: string
  examples?: Array<{
    child: string
    parent: string
  }>
}

export type DpmAiSchemaContext = {
  datasetId: string
  manifestId: string
  readonlyGrantHints: string[]
  relationships: DpmAiRelationshipContext[]
}
