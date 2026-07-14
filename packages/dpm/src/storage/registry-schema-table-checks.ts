export const DPM_REGISTRY_STORAGE_TABLE_CHECKS_SQL = `  constraint dpm_relationship_registry_status_check check (
    status in ('candidate', 'proposed', 'approved', 'rejected', 'deprecated', 'superseded')
  ),
  constraint dpm_relationship_registry_canonical_key_encoding_check check (
    canonical_key_encoding_version in ('string-v1', 'typed-v2')
  ),
  constraint dpm_relationship_registry_type_check check (
    relationship_type in (
      'one_to_one',
      'one_to_many',
      'many_to_one',
      'many_to_many_edge',
      'self_reference',
      'polymorphic',
      'temporal',
      'code_lookup'
    )
  ),
  constraint dpm_relationship_registry_transform_strategy_check check (
    transform_strategy in ('entity_token', 'relationship_token', 'keep_code')
  ),
  constraint dpm_relationship_registry_orphan_policy_check check (
    orphan_policy in ('block', 'warn', 'tolerate', 'tolerate_null', 'create_placeholder_parent', 'lookup_archive')
  ),
  constraint dpm_relationship_registry_parent_columns_check check (cardinality(parent_columns) > 0),
  constraint dpm_relationship_registry_child_columns_check check (cardinality(child_columns) > 0),
  constraint dpm_relationship_registry_confidence_score_check check (
    confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)
  )`
