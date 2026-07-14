# Plan — 구현 로드맵

> 목표와 단계별 방향을 기술합니다.
> 핵심 철학과 주 목표는 [Vision](../vision.md)을 참조하세요.
> 실제 구현 현황은 [spec.md](./spec.md), 즉시 태스크는 [todo.md](./todo.md)를 참조하세요.

---

## 시스템 목표

OpenAPI contract를 중심으로 OpenAPI/JSON Schema 호환 입력 수집, modular
schema/definition composition, metadata/path surface management, validation, code
generation, mock/runtime testing, diff/drift/freshness review를 연결한다. 시스템 루프는
[Vision](../vision.md#system-loop)을 따른다.

---

## Implemented Core — Data Pseudonymization Manifest

API 설계 범위를 DB 설계 연결까지 확장하는 privacy track이다. 핵심 결정은
[Data Pseudonymization Manifest](../concepts/data-pseudonymization-manifest.md)를 독립 YAML
DSL로 두고, OpenAPI는 manifest 등록/검증/컴파일/dry-run/실행/리포트 gateway API만
설명하는 것이다.

실행 계획은 [Data Pseudonymization Manifest PRD](../../tasks/prd-data-pseudonymization-manifest.md)를 따른다.
이 track은 DB catalog snapshot 또는 OpenAPI projection envelope을 `catalog` 입력으로 소비하고,
Relationship Registry의 approved snapshot으로 namespace binding을 확정한다. DPM은 entity,
relationship-aware column transform, vault, quality gate, publishing 정책을 소유한다. Registry
snapshot, compiled plan, runtime validation report, AI schema context는 generated/review artifact로
취급한다.

Goal 4의 relationship-first core loop는 `@oa-sdk/dpm`으로 구현되었다. Runtime/storage 후속은
[Goal 5 — DPM Runtime/Storage Integration](./goals/goal-5-dpm-runtime-storage-integration.md)에 둔다.

현재 `data_definitions` 구조와 `@oa-sdk/dpm/data` public seam은 논리 field/API/DB object
식별을 분리하는 compatibility slice로 추가되었다. namespace-safe identity contract는 Goal 68.1로
완료했고 artifact/catalog semantic binding은 Goal 68.2로 완료했다. Goal 68.3의 neutral
artifact와 compiled provenance 통합도 완료했으며, 외부 DPM extraction은 scope-gated
[Goal 68](./goals/goal-68-dpm-logical-data-definition-boundary.md)을 따른다.

Goal 간 선행 관계와 잔여 gap은 [DPM Master Roadmap](./goals/dpm-master-roadmap.md)을
통합 기준으로 사용한다. Goal 4~67은 완료된 capability history이며, Goal 68은 2026-07-14
temporary monorepo reactivation decision 후 68.1 identity contract, 68.2 semantic binding,
68.3 neutral artifact/provenance integration을 완료했고 68.4 local packed-consumer rehearsal도 runtime, declaration, rollback consumer까지 통과했다. private canonical repository `mineclover/data-governance`를 생성했고, `data_definitions` 1.0은 구조적 호환성 계약으로 동결하고, 1.1 identity contract는
외부 extraction owner acceptance 전까지 experimental로 취급한다. migration/rollback 규칙은
[Goal 68 extraction contract](./goals/goal-68-dpm-extraction-migration.md)에 기록했고 owner handoff gate는 [Goal 68.4 acceptance checklist](./goals/goal-68-extraction-acceptance-checklist.md)에 정리했다. 검색, draft/edit/publish, diff/rollback, 작성 편의성은 stable
neutral artifact 위에 두는 별도의 owner-authorized control-plane capability이며 아직 active
goal은 아니다.

---

## 아키텍처 — SWC 스타일 Parse → Transform → Generate

```
OAS 3.2 spec (YAML/JSON)
     │
     ▼ Parse
  ParsedDocument (IR)              ← @oa-sdk/parser
  ├─ operations: OperationEntry[]
  ├─ routes: RouteIndex
  ├─ schemas: Record<string, OasSchema>
  ├─ securitySchemes, tags, webhooks, components
  └─ raw: 원본 OasDocument
     │
     ▼ Transform (SpecPass[])      ← @oa-sdk/parser
  derefPass ($ref 인라인)
  [사용자 정의 Pass]
     │
     ▼ Generate (Backend별)
  MockServerBackend                ← @oa-sdk/mock-server  ✅
  TypeScriptTypesBackend           ← @oa-sdk/codegen      ✅
  ServerRouterBackend              ← @oa-sdk/router       ✅
  ClientSdkBackend                 ← @oa-sdk/client       ✅
```

SWC에서 참조하는 패턴:
- **AST 노드 설계**: 자기 완결적 타입 (`types/` 13파일, 스펙 섹션 1:1 매핑)
- **Visitor/Fold**: `SchemaAlgebra<T>` + `foldSchema()` — 타입별 의미 해석
- **Pass 체인**: `SpecPass[]` + `runPipeline()` — 독립 변환 합성
- **Backend 교체**: 동일 IR에서 여러 출력 생성

---

## Phase별 현황

### Completed — TypeSpec roundtrip readiness (`@oa-sdk/codegen` v0.3.0)
OpenAPI artifact를 `.tsp`와 OA SDK compatibility sidecar 및 `oa-sdk.typespec-bundle.v1` manifest로 변환한 뒤 TypeSpec OpenAPI emitter와 sidecar restore/re-extract를 거쳐 다시 OA SDK 검증/diff 루프에 넣고, authored `.tsp + sidecar` bundle 및 sidecar-less `.tsp` extension bundle도 같은 manifest로 검증 루프에 넣는 전환 가능성 평가 트랙입니다. 현재 `oa-gen tsp-export --bundle-manifest`, `oa-gen tsp-restore --stability-report`, `oa-gen tsp-bundle-check --fail-on-breaking`, `pnpm typespec:roundtrip -- --fail-on-breaking`, `pnpm typespec:bundle-check -- --fail-on-breaking`, `pnpm schema:validate`, `pnpm schema:rollback-check`, `pnpm schema:downstream-check`이 동작합니다.

이 트랙은 roundtrip gap을 줄이고, `.tsp`가 맡을 구조 계약과 OA SDK extension/sidecar가 맡을 runtime/mock/example metadata를 양방향 호환 가능하게 분리한 뒤 ADR-009와 production TypeSpec source switch까지 연결했습니다. 상세 로드맵은 [typespec-roundtrip/v0.3.0/implementation-roadmap.plan.md](./typespec-roundtrip/v0.3.0/implementation-roadmap.plan.md)에 둡니다.

### Phase 1 — 스키마 관리 ✅
도메인 분리 + Spectral/Redocly 이중 검증 + 환경 프로필

### Phase 2 — 수집 방향 코드젠 + Mock 서버 ✅
Zod 4 → OAS + Drizzle → Zod + CLI + AJV Mock 서버 (MSW + Node HTTP)

### Phase 3 — OAS 파서 / IR ✅
- `@oa-sdk/parser`: OAS 3.2 전체 30개 타입 자체 정의 (스펙 §별 13파일 분할)
- `parseDocument()` → `ParsedDocument` IR (풀 파서)
- mock-server 전체가 parser 타입 직접 사용 (`openapi3-ts` 완전 제거, 타입 캐스트 0)
- global security/servers 상속, trace/query 메서드
- codegen `OasSchema`가 parser 정식 타입 참조
- 타입 중복 제거 (`SchemaEntry`→`NamedSchema`, re-export chain 단순화)

### Phase 4 — TypeScript 타입 생성 ✅
- `@oa-sdk/codegen/typegen`: `schemaToTs()` (SchemaAlgebra 기반) + `generateTypes()`
- $ref → 이름 참조, JSDoc, nullable, enum, tsc strict 통과
- `oa-gen typegen --spec` CLI

### Phase 5 — 서버 라우터 스텁 ✅
- `@oa-sdk/router`: Hono + Express 라우터 스텁 생성
- typegen 타입 import, path params, query, body, 204, JSDoc

### Phase 6 — 클라이언트 SDK ✅
- `@oa-sdk/client`: fetch 기반 타입 안전 클라이언트
- createClient(), template literal path, query, body, JSDoc

---

## 패키지 현황

```
packages/
  core/         ← 공유 유틸 (의존 없음)        ✅
  schemas/      ← OAS 소스                    ✅
  parser/       ← OAS → IR (Parse/Transform)  ✅
  mock-server/  ← IR → mock handlers          ✅
  codegen/      ← Drizzle/Zod → OAS + typegen ✅
  router/       ← IR → 서버 라우터 스텁        ✅
  client/       ← IR → 클라이언트 SDK          ✅
  dpm/          ← Relationship-first DPM       ✅
```

---

## 설계 원칙

1. **OAS 3.2 전용** — 3.1 하위 호환 없음
2. **단일 소스** — spec이 타입, 라우터, mock의 원천
3. **파이프라인 분리** — Parse / Transform / Generate 단계 분리
4. **Faker 미사용** — examples/default/generateMinimal() 순서
5. **점진적 채택** — 각 Phase 독립 사용 가능
