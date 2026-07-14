import type { DpmCompiledPlan } from '../compiler/plan.js'
import type { DpmAiSchemaContext } from './ai-schema-types.js'
import type { DPM_PUBLISHING_CONTEXT_KIND } from './context-kind.js'
import type { DpmPhysicalForeignKeyRecommendation } from './physical-fk-types.js'
import type { DpmRelationshipMetadata } from './relationship-types.js'

export type DpmPublishingContextInput = {
  plan: DpmCompiledPlan
  includeExamples?: boolean
  includePhysicalForeignKeyRecommendations?: boolean
}

export type DpmPublishingContext = {
  kind: typeof DPM_PUBLISHING_CONTEXT_KIND
  manifestId: string
  datasetId: string
  relationshipMetadata: DpmRelationshipMetadata[]
  aiSchemaContext: DpmAiSchemaContext
  physicalForeignKeyRecommendations: DpmPhysicalForeignKeyRecommendation[]
}
