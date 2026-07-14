import type {
  DpmAiRelationshipContext,
  DpmAiSchemaContext,
} from './ai-schema-types.js'
import type { DpmRelationshipMetadata } from './relationship-types.js'

export type DpmAiSchemaContextInput = {
  datasetId: string
  manifestId: string
  relationshipMetadata: readonly DpmRelationshipMetadata[]
  includeExamples: boolean
}

export function createDpmAiSchemaContext(input: DpmAiSchemaContextInput): DpmAiSchemaContext {
  return {
    datasetId: input.datasetId,
    manifestId: input.manifestId,
    readonlyGrantHints: [
      'Use read-only access to the pseudonymized target dataset.',
      'Do not request source database, secret store, or token lookup access.',
    ],
    relationships: input.relationshipMetadata.map(relationship =>
      toAiRelationshipContext(relationship, input.includeExamples),
    ),
  }
}

function toAiRelationshipContext(
  relationship: DpmRelationshipMetadata,
  includeExamples: boolean,
): DpmAiRelationshipContext {
  return {
    name: relationship.name,
    namespace: relationship.namespace,
    cardinality: relationship.cardinality,
    description: `Join ${relationship.childTable} to ${relationship.parentTable} through the ${relationship.namespace} namespace.`,
    joinPredicate: relationship.joinPredicate,
    ...(includeExamples ? {
      examples: relationship.childColumns.map((childColumn, index) => ({
        child: `${relationship.childTable}.${childColumn}`,
        parent: `${relationship.parentTable}.${relationship.parentColumns[index] ?? childColumn}`,
      })),
    } : {}),
  }
}
