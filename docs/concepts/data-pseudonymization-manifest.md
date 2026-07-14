# Data Pseudonymization Manifest

Data Pseudonymization Manifest, 줄여서 DPM은 DB 원본을 AI/분석용 가명 데이터셋으로
변환하기 위한 source of truth다. OpenAPI는 DPM 자체를 표현하는 주 포맷이 아니라,
DPM을 등록, 검증, 컴파일, dry-run, 실행, 리포트 조회하는 gateway API 계약을 설명한다.

## One Sentence

DPM은 **컬럼별 가명처리 설정 파일이 아니라 Relationship Registry 기반 AI 데이터 제품
계약서**다. 토큰화 단위는 물리 컬럼이 아니라 logical entity namespace이며, 이 namespace는
승인된 logical relationship에서 결정된다.

## Core Decision

```text
DPM v1 baseline = relationship-first manifest
```

이 결정 때문에 DPM compiler 순서는 column policy보다 relationship 확정이 먼저다.

```text
Source DB
  -> Schema Profiler
  -> Data Profiler
  -> Relationship Discovery
  -> Relationship Registry
  -> Relationship Approval
  -> PII Classifier
  -> Namespace Resolver
  -> DPM Compiler
  -> Pseudonymization Worker
  -> Relationship Validator
  -> AI Pseudo DB + AI Schema Context
```

같은 컬럼명이 아니어도 같은 logical entity에 속하면 같은 token namespace를 써야 한다.
반대로 같은 값처럼 보여도 tenant, object type, temporal validity 같은 relationship context가
다르면 다른 namespace나 canonical key를 써야 한다.

DPM은 물리 DB schema를 직접 변경하지 않는다. 운영 DB의 table, column, FK constraint는 catalog
snapshot이나 projection evidence로 읽고, DPM은 그 위에 logical entity, approved relationship,
namespace, column transform 정책을 얹는다. 따라서 DPM의 기본 산출물은 DB migration이 아니라
compiled pseudonymization plan, validation report, publishing context, AI schema context다.

```text
Physical DB schema
  -> catalog snapshot / projection evidence
  -> DPM logical entity + relationship registry
  -> compiled pseudonymization plan
  -> gateway OpenAPI / reports / AI schema context
```

## Boundary

| Surface | 역할 |
|---|---|
| Manifest YAML | source/target DB 범위, registry snapshot, entity, relationship, column policy, privacy control, quality gate, validation, publishing 정책을 선언한다. |
| Relationship Registry | 후보 관계, evidence, confidence, 승인/거절/폐기 lifecycle, registry version, drift 기록을 관리한다. |
| JSON Schema | DPM 문법, 필수 필드, enum, 기본 shape를 검증한다. Draft 2020-12를 기준으로 한다. |
| Semantic compiler | catalog 존재성, approved relationship, namespace binding, entity key canonicalization, orphan policy, safety rule을 검증하고 compiled plan을 만든다. |
| OpenAPI gateway | `register`, `validate`, `compile`, `dry-run`, `execute`, `validation-report` 같은 HTTP surface를 정의한다. |
| Compiled plan | DPM을 엔진이 실행 가능한 내부 작업 계획으로 변환한 결과다. `namespace_bindings`와 `relationship_steps`를 포함한다. |

OpenAPI root나 schema에 `x-dpm-version`, `x-dpm-policy-id`, `x-dpm-registry-version`,
`x-dpm-catalog-version-hash` 같은 extension을 둘 수는 있다. 이 extension은 연결 메타데이터일
뿐이며, relationship policy나 column transform 본문을 OpenAPI에 인라인하지 않는다.

## Package Placement

| 카테고리 | 패키지 | DPM과의 관계 |
|---|---|---|
| API 계약/스펙 SSOT | `@oa-sdk/schemas`, `@oa-sdk/parser`, `@oa-sdk/openapi-projection-contract`, `@oa-sdk/codegen` | Gateway OpenAPI와 catalog projection evidence를 제공한다. DPM 본문 policy의 source of truth는 아니다. |
| 논리 데이터 계약 | `@oa-sdk/dpm`, `@oa-sdk/personas` | Relationship Registry, logical entity namespace, 가명 데이터 audience obligation을 소유한다. |
| 실행/소비자 산출물 | `@oa-sdk/router`, `@oa-sdk/client`, `@oa-sdk/mock-server`, `@oa-sdk/typia-mock` | 안정화된 gateway OpenAPI artifact를 소비한다. relationship approval이나 namespace 정책은 결정하지 않는다. |
| 거버넌스/관측 | `@oa-sdk/spec-lens` | Gateway/spec drift 관측에 쓸 수 있다. DPM freshness나 REL/SAF validation을 대체하지 않는다. |

## Existing Concepts

| 기존 개념 | DPM에서의 의미 |
|---|---|
| [OpenAPI Projection](./openapi-projection.md) | DB catalog나 table schema projection을 DPM의 `catalog` 입력으로 사용할 수 있다. 다만 관계의 source of truth는 projection이 아니라 Relationship Registry다. |
| [Data Persona](./data-persona.md) | `access: [pseudonymized]`와 `skills: [pseudonymized]`는 API audience 의무다. DPM은 그 의무를 데이터 제품으로 실현하는 정책이다. |
| [Schema Annotations](../guides/schema-annotations.md) | 필드 소유자, 내부 note, lifecycle 같은 개발자 메타데이터를 담는다. 가명처리 실행 정책의 SSOT는 아니다. |
| [Contract Governance](./contract-governance.md) | DPM, registry snapshot, compiled plan, validation report, AI schema context가 drift/freshness/review 대상이 된다. |

## Manifest Shape

v1 canonical version field는 `dpm_version`이다. 초기 초안의 `manifest_version`은 import 시
migration warning으로 처리할 수 있지만, 새 authoring surface에는 쓰지 않는다.

```yaml
dpm_version: "1.0"

metadata: {}
source: {}
target: {}
vault: {}
scope: {}
catalog: {}

relationship_discovery: {}
relationship_registry: {}

entities: []
relationships: []
columns: []

text_policies: []
privacy_controls: {}
quality_gates: []
validation: {}
publishing: {}
```

| Section | MVP | 목적 |
|---|---:|---|
| `dpm_version` | required | DPM 규격 버전 |
| `metadata` | required | dataset id, policy version, owner, purpose, approval metadata |
| `source` | required | 원본 DB 연결 참조와 snapshot read policy |
| `target` | required | AI용 가명 DB, file, vector output 위치 |
| `vault` | required | token vault, key reference, reversible transform 정책 |
| `scope` | required | include/exclude table 범위 |
| `catalog` | recommended | DB introspection 또는 OpenAPI projection snapshot |
| `relationship_discovery` | required | 후보 관계 추론 입력, threshold, scoring, approval policy |
| `relationship_registry` | required | approved relationship snapshot의 source, dataset, version, status filter |
| `entities` | required | logical entity root key와 namespace contract |
| `relationships` | required | approved logical relationship snapshot |
| `columns` | required | 컬럼별 role, sensitivity, relationship reference, transform |
| `privacy_controls` | required | k-anonymity, residual PII, reidentification guard |
| `quality_gates` | required | relationship integrity, drift, namespace consistency, residual PII gates |
| `validation` | required | 실행 후 검증과 report policy |
| `publishing` | required | AI consumer output, relationship metadata, AI schema context |
| `text_policies` | recommended | 자유 텍스트 PII 탐지와 치환 정책 |

## Relationship Discovery

운영 DB에는 FK constraint가 없지만 애플리케이션 로직상 FK처럼 동작하는 관계가 많다. 그래서
PII 탐지보다 먼저 relationship 후보를 찾아 registry에서 승인해야 한다.

```yaml
relationship_discovery:
  enabled: true
  candidate_generation:
    use_column_name_similarity: true
    use_type_compatibility: true
    use_unique_candidate_detection: true
    use_inclusion_dependency: true
    use_query_log: true
    use_orm_metadata: true
    use_bi_query_metadata: true
  thresholds:
    parent_uniqueness_min: 0.999
    inclusion_ratio_auto_approve: 0.999
    inclusion_ratio_review: 0.95
    max_orphan_ratio_blocking: 0.001
  approval:
    auto_approve_enabled: false
    require_human_approval: true
    auto_approve_threshold: 0.995
    review_threshold: 0.900
    reject_below: 0.900
  exclusions:
    column_patterns:
      - created_at
      - updated_at
      - amount
      - price
      - quantity
      - status
      - type
      - flag
      - count
```

초기 운영에서는 `auto_approve_enabled: false`를 기본값으로 둔다. 잘못 승인된 관계는
토큰 map과 AI join 지식을 동시에 오염시키기 때문이다.

## Relationship Registry

DPM Manifest는 실행 시점의 approved relationship snapshot을 담고, Registry DB는 후보,
evidence, confidence, 승인/거절/폐기 lifecycle을 관리한다.

Registry의 핵심 필드는 다음이다.

| Field | 의미 |
|---|---|
| `dataset_id`, `relationship_name`, `registry_version` | 관계 snapshot identity |
| `relationship_type` | `one_to_many`, `self_reference`, `polymorphic`, `temporal`, `code_lookup` 등 |
| `parent_schema/table/columns` | parent endpoint |
| `child_schema/table/columns` | child endpoint |
| `context_columns` | tenant-scoped 또는 composite relationship context |
| `condition_sql` | polymorphic 또는 conditional lookup predicate |
| `temporal_*` | temporal relationship validity predicate |
| `namespace`, `transform_strategy` | token namespace와 relationship transform |
| `orphan_policy` | orphan 처리 방식 |
| `confidence_score`, `evidence` | 추론 근거와 review 정보 |
| `status` | `candidate`, `approved`, `rejected`, `deprecated` |

실행 plan에는 `status: approved` 관계만 포함된다.

## Entity Model

### Logical data definitions and API bindings

DPM also owns the logical data-field layer that connects an API contract to a physical
database address without conflating their identifiers. The frozen `data_definitions` `1.0`
section remains a structural compatibility shape. The experimental `1.1` shape adds:

- a namespace-safe `entity` reference with `dataset_id`, `namespace`, and entity `name`;
- a caller-owned rename-safe `object_id`, an immutable `revision_id`, and a human-readable
  locator that can change through aliases;
- `origin` (`persisted`, `derived`, `computed`, or `api_only`) and lifecycle/supersession
  metadata;
- a `storage_ref` whose `catalog` carries snapshot identity, freshness hash, and optional
  source coordinate;
- `api_bindings` with an independent `binding_id` and a canonical API identity made from
  artifact id, version hash, and JSON Pointer.

The three object identities remain separate: the logical field is the DPM object, `storage_ref`
is a database catalog address, and `api` is an OpenAPI artifact address. `operation_id` is
navigation metadata only; changing it does not change canonical API identity. A catalog or API
version change changes the referenced evidence identity, while the logical object id and binding
edge id remain explicit independent values.

Entity는 관계 컬럼 목록을 직접 들지 않는다. Entity는 root key와 namespace contract만 정의하고,
child column binding은 `relationships`가 소유한다.

```yaml
entities:
  - name: customer
    namespace: customer
    token_prefix: CUST
    root:
      table: public.customers
      columns: [customer_no]
    key_strategy:
      type: single_column
      canonical_columns: [customer_no]
    transform:
      type: deterministic_token
      namespace: customer
      prefix: CUST
      reversible: true

  - name: account_customer
    namespace: customer
    token_prefix: CUST
    root:
      table: public.customers
      columns: [tenant_id, customer_no]
    key_strategy:
      type: composite
      canonical_columns: [tenant_id, customer_no]
      separator: ":"
    transform:
      type: deterministic_token
      namespace: customer
      prefix: CUST
      reversible: true
```

Composite entity에서는 `customer_no`만 token key로 쓰면 안 된다. `tenant_id + customer_no`
같은 canonical key가 namespace binding의 기준이다.

## Logical Relationship Model

`relationships.from/to` 단일 컬럼 모델은 DPM v1 baseline에서 사용하지 않는다. 관계는 parent/child
endpoint와 상태, type, namespace, orphan policy, evidence를 가진다.

```yaml
relationships:
  - name: rel_orders_customer
    status: approved
    type: one_to_many
    parent:
      table: public.customers
      columns: [customer_no]
    child:
      table: public.orders
      columns: [customer_no]
    namespace: customer
    transform_strategy: entity_token
    orphan_policy: block
    confidence:
      score: 0.988
      required: 0.950
    evidence:
      name_score: 0.95
      type_score: 1.0
      parent_uniqueness: 1.0
      inclusion_ratio: 0.9998
      orphan_count: 12
      workload_evidence:
        - "orders.customer_no = customers.customer_no"
```

Composite relationship은 `context_columns`와 `canonical_key`를 명시한다.

```yaml
relationships:
  - name: rel_orders_customer_tenant_scoped
    status: approved
    type: one_to_many
    parent:
      table: public.customers
      columns: [tenant_id, customer_no]
    child:
      table: public.orders
      columns: [tenant_id, customer_no]
    context_columns: [tenant_id]
    namespace: customer
    transform_strategy: composite_entity_token
    orphan_policy: block
    canonical_key:
      components: [tenant_id, customer_no]
      separator: ":"
```

Polymorphic relationship은 `condition_sql`이 namespace 결정의 일부다.

```yaml
relationships:
  - name: rel_activities_customer
    status: approved
    type: polymorphic
    condition_sql: "object_type = 'CUSTOMER'"
    parent:
      table: public.customers
      columns: [customer_no]
    child:
      table: public.activities
      columns: [object_id]
    namespace: customer
    transform_strategy: entity_token
    orphan_policy: warn
```

`condition_sql`은 v1에서 read-only predicate expression으로 제한한다. 자유 SQL 실행문이 아니며,
compiler는 overlapping polymorphic predicates를 safety error로 다뤄야 한다.

## Column Policy

Column policy는 관계가 결정한 namespace를 참조한다. Foreign identifier 컬럼은 직접 namespace를
고르지 않고 approved relationship을 가리킨다.

```yaml
columns:
  - column: public.orders.customer_no
    semantic_type: customer_id
    role: foreign_identifier
    pii: true
    entity: customer
    relationship: rel_orders_customer
    transform:
      type: relationship_token
      relationship: rel_orders_customer

  - column: public.activities.object_id
    semantic_type: polymorphic_object_id
    role: foreign_identifier
    pii: true
    transform:
      type: polymorphic_relationship_token
      relationships:
        - rel_activities_customer
        - rel_activities_order
```

Transform enum에는 relationship-aware transform을 포함한다.

| Transform | 용도 |
|---|---|
| `keep` | 비민감 컬럼 유지. `pii: true`와 함께 쓰면 semantic validation에서 실패한다. |
| `suppress` | 컬럼 제거 또는 output 제외 |
| `nullify` | 값 전체를 `null`로 대체 |
| `deterministic_token` | entity root key를 deterministic token으로 변환 |
| `relationship_token` | approved relationship의 namespace binding을 사용해 child/parent 값을 변환 |
| `polymorphic_relationship_token` | condition별 relationship namespace를 사용해 polymorphic id를 변환 |
| `reversible_token` | vault를 통해 제한적으로 원본 복원 가능한 토큰 |
| `format_preserving_token` | 형식 보존이 필요한 값 |
| `generalize` | 주소, 생년월일 등을 coarse-grained 값으로 일반화 |
| `bucketize` | numeric/date 값을 bucket으로 묶음 |
| `perturb_numeric` | 통계 특성을 제한된 범위에서 유지하며 수치 노이즈 추가 |
| `shift_datetime` | 순서와 간격을 보존하며 시간 이동 |
| `category_remap` | 카테고리 비율을 유지하며 label 치환 |
| `text_pii_redact` | 자유 텍스트 내부 PII 탐지와 placeholder/token 치환 |
| `hash` | 복원 불가능한 hash. salt/key 정책은 manifest/vault에서 추적 |

## Orphan Policy

| Policy | 동작 | 추천 상황 |
|---|---|---|
| `block` | publish 중단 | 고객, 주문, 결제 등 핵심 관계 |
| `warn` | 경고 후 진행 | 일부 dirty data 허용 |
| `tolerate` | 관계 검증 실패만 기록 | 로그성 데이터 |
| `tolerate_null` | null parent 허용 | manager_id 같은 self-reference |
| `create_placeholder_parent` | AI DB에 placeholder parent 생성 | historical child 보존 필요 |
| `lookup_archive` | archive/deleted table까지 parent로 인정 | 탈퇴/삭제 데이터가 많음 |

## Quality Gates

Relationship gate는 privacy gate와 같은 급으로 다룬다.

```yaml
quality_gates:
  - type: source_relationship_integrity
    relationships:
      - rel_orders_customer
      - rel_tickets_customer
    max_orphan_ratio: 0.001
    action_if_failed: block_export

  - type: target_relationship_integrity
    relationships:
      - rel_orders_customer
      - rel_tickets_customer
    orphan_count_must_be: 0
    action_if_failed: block_export

  - type: relationship_drift
    relationships:
      - rel_orders_customer
      - rel_tickets_customer
    fail_on_drift: true
    max_inclusion_ratio_drop: 0.01
    action_if_failed: block_export

  - type: namespace_consistency
    entity: customer
    relationships:
      - rel_orders_customer
      - rel_tickets_customer
    action_if_failed: block_export
```

## Validation Layers

| Layer | 담당 |
|---|---|
| Syntax validation | JSON Schema가 top-level section, required field, enum, 기본 shape를 검증한다. |
| Relationship validation | Approved relationship status, registry snapshot consistency, endpoint existence, type compatibility, parent uniqueness, condition/temporal requirement를 검증한다. |
| Namespace validation | relationship namespace와 entity transform contract, composite key canonicalization을 검증한다. |
| Safety validation | AI account source/vault/reverse-token 접근 차단, direct identifier keep 금지, column relationship reference 무결성, residual PII scan requirement를 검증한다. |
| Runtime validation | source/target relationship integrity, orphan count, drift, residual PII, distribution/cardinality checks를 수행한다. |

핵심 semantic rules는 다음 코드 계열로 시작한다.

```text
REL001 approved relationship parent.table must be in scope.
REL002 approved relationship child.table must be in scope.
REL003 parent.columns and child.columns must have the same length.
REL004 parent.columns and child.columns must be type-compatible.
REL005 parent key must be a PK, unique index, or unique candidate.
REL006 non-approved relationships must not enter execution plans.
REL007 polymorphic relationships require condition_sql.
REL008 temporal relationships require temporal_condition.
REL009 composite relationships require explicit canonical key strategy.
REL010 relationships in the same namespace must follow the same entity transform contract.
REL013 approved registry snapshot must match the manifest relationship.
REL014 lookup_archive requires archive parent source.
SAF001 direct_identifier + keep is forbidden.
SAF002 pii=true foreign_identifier without relationship is forbidden.
SAF003 overlapping polymorphic condition_sql predicates are forbidden.
SAF004 AI service account must not access source DB.
SAF005 AI service account must not access vault.
SAF006 AI service account must not access token resolve APIs.
SAF007 missing relationship drift gate is a warning.
SAF008 unstructured_text publishing requires residual PII scan.
SAF012 column relationship references must resolve to manifest relationships.
```

## Compiled Plan

Compiled plan은 relationship-first 실행 단위를 보존한다.

```json
{
  "plan_version": "1.0",
  "manifest_id": "commerce_ai_export",
  "namespace_bindings": [
    {
      "namespace": "customer",
      "entity": "customer",
      "relationships": ["rel_orders_customer", "rel_tickets_customer"],
      "columns": [
        "public.customers.customer_no",
        "public.orders.customer_no",
        "public.tickets.customer_no"
      ],
      "token_strategy": "entity_token"
    }
  ],
  "relationship_steps": [
    {
      "step_id": "validate_source_rel_orders_customer",
      "type": "source_relationship_integrity",
      "relationship": "rel_orders_customer",
      "orphan_policy": "block"
    },
    {
      "step_id": "transform_rel_orders_customer",
      "type": "relationship_tokenize",
      "relationship": "rel_orders_customer",
      "namespace": "customer"
    },
    {
      "step_id": "validate_target_rel_orders_customer",
      "type": "target_relationship_integrity",
      "relationship": "rel_orders_customer",
      "orphan_count_must_be": 0
    }
  ]
}
```

Compiled plan은 manifest, catalog, registry snapshot 중 하나라도 바뀌면 stale이다.

## Publishing

AI consumer는 source DB와 vault가 아니라 published target과 relationship context만 읽는다.

```yaml
publishing:
  outputs:
    - type: relational_schema
      target_ref: ai_pseudo_db
      schema: ai_pseudo
      grant_to:
        - ai_service_readonly

    - type: relationship_metadata
      target_ref: ai_pseudo_db
      schema: ai_metadata
      include_only_status:
        - approved

    - type: ai_schema_context
      format: json
      path: /data/exports/commerce_ai_export/v1/ai_schema_context.json
      include_relationship_descriptions: true
      include_join_examples: true

    - type: export_file
      format: parquet
      path: /data/exports/commerce_ai_export/v1
      include_manifest_copy: true
      include_validation_report: true
```

`ai_schema_context.json`은 FK가 없는 DB에서도 AI SQL agent가 join 관계를 알 수 있게 하는
semantic artifact다.

```json
{
  "relationships": [
    {
      "name": "rel_orders_customer",
      "join": "orders.customer_no = customers.customer_no",
      "cardinality": "many_to_one",
      "namespace": "customer",
      "description": "주문은 customer_no 기준으로 고객과 연결된다."
    }
  ]
}
```

검증을 통과한 관계만 optional physical FK로 만들 수 있다. 그렇지 않은 관계는 logical metadata와
AI schema context로만 제공한다.

## Gateway API Shape

OpenAPI full document는 DPM gateway의 안정적인 HTTP surface만 설명한다. OA SDK 안에서
관리하는 gateway artifact는 기존 정책과 같이 OpenAPI 3.2 validation gate를 따른다.

| Operation | 역할 |
|---|---|
| `POST /catalogs/profile` | DB catalog snapshot 생성 |
| `POST /relationships/discover` | 후보 관계 discovery report 생성 |
| `POST /relationship-registry/candidates` | 후보 관계를 registry에 import |
| `POST /relationship-registry/{relationshipId}/approve` | 관계 승인 |
| `GET /relationship-registry/snapshots/{datasetId}` | approved relationship snapshot export |
| `POST /manifests` | DPM 등록 |
| `POST /manifests/{manifestId}/validate` | syntax + relationship + semantic validation |
| `POST /manifests/{manifestId}/compile` | compiled plan 생성 |
| `POST /plans/{planId}/dry-run` | 예상 영향, sample transform, validation risk report 생성 |
| `POST /plans/{planId}/execute` | target output 생성 job 시작 |
| `GET /jobs/{jobId}` | 실행 상태 조회 |
| `GET /jobs/{jobId}/validation-report` | runtime validation report 조회 |

Gateway API는 source DB credential, vault key, token reverse lookup endpoint를 AI consumer에게 노출하지
않는다. AI 서비스 계정은 `publishing`에 선언된 target output만 읽는다.

## MVP Implementation Order

1. DPM relationship-first vocabulary와 JSON Schema를 확정한다.
2. Catalog snapshot model과 OpenAPI projection envelope adapter를 정의한다.
3. Relationship Discovery 후보 report shape를 정의한다.
4. Relationship Registry snapshot schema와 approval lifecycle을 정의한다.
5. Entity root/key strategy와 LogicalRelationship model을 구현한다.
6. Relationship-aware column transforms를 구현한다.
7. REL/SAF semantic validator와 quality gates를 추가한다.
8. Compiled plan의 `namespace_bindings`와 `relationship_steps`를 생성한다.
9. Gateway OpenAPI 3.2 artifact를 추가하고 OA SDK validation/typegen/mock-server로 검증한다.
10. Runtime execution engine은 별도 phase에서 붙인다.

## Non Goals

- DPM 본문을 OpenAPI `x-*` extension에 모두 넣지 않는다.
- DPM v1에서 DB migration이나 production data rewrite를 직접 수행하지 않는다.
- Relationship Discovery 후보를 human approval 없이 기본 승인하지 않는다.
- 가명처리를 법적 익명화 보증으로 표현하지 않는다.
- AI consumer에게 source DB, vault, reverse token API 접근권한을 주지 않는다.
- Schema annotation이나 persona row를 DPM 실행 정책의 대체물로 사용하지 않는다.
