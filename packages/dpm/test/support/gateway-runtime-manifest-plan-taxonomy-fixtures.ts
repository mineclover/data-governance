type InvalidCompiledPlanTaxonomyCase =
  readonly [string, string | readonly string[]]

type InvalidRelationshipStepTaxonomyCase =
  readonly [string, string]

export const invalidCompiledPlanTaxonomyCases = [
  ['planVersion', '2.0'],
  ['canonicalKeyEncodingVersion', 'typed-v3'],
  ['staleReasons', ['unknown_stale_reason']],
] as const satisfies readonly InvalidCompiledPlanTaxonomyCase[]

export const invalidRelationshipStepTaxonomyCases = [
  ['relationshipType', 'unknown_relationship_type'],
  ['cardinality', 'unknown_cardinality'],
  ['transformStrategy', 'unknown_transform_strategy'],
  ['orphanPolicy', 'unknown_orphan_policy'],
] as const satisfies readonly InvalidRelationshipStepTaxonomyCase[]
