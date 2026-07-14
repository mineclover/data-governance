export type DpmPhysicalForeignKeyRecommendation = {
  kind: 'physical_fk_recommendation'
  relationship: string
  childTable: string
  childColumns: string[]
  parentTable: string
  parentColumns: string[]
  applyMode: 'recommendation_only'
  mutation: 'none'
}
