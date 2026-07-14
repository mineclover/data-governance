# 패키지 구조

제품 범위와 신규 작업 승인 기준은 [`../platform-scope.md`](../platform-scope.md)가 소유한다.
이 문서는 현재 물리 package 구조와 dependency boundary를 설명한다.

```
oa-sdk/
  packages/
    openapi-projection-contract/ @oa-sdk/openapi-projection-contract OAS projection contract + validation [core]
    core/          @oa-sdk/core         공유 유틸 (pascalCase, toColonPath, collectTypeNames) [core]
    parser/        @oa-sdk/parser       OAS 3.2 파서 + IR + fold + lint + query [core]
    schemas/       @oa-sdk/schemas      TypeSpec production source + Definition Builder rollback + OAS artifact 검증 [core]
    codegen/       @oa-sdk/codegen      Zod/Drizzle → OAS + typegen + CLI [core]
    spec-lens/     @oa-sdk/spec-lens    OpenAPI spec change history + observation [core]
    mock-server/   @oa-sdk/mock-server  AJV Mock 서버 (MSW + Node HTTP) + 테스트 헬퍼 [downstream]
    router/        @oa-sdk/router       OAS → Hono/Express 라우터 스텁 [downstream]
    client/        @oa-sdk/client       OAS → fetch 클라이언트 SDK + 인증 + 재시도 [downstream]
    dpm/           @oa-sdk/dpm          Relationship-first Data Pseudonymization Manifest toolkit [maintenance]
    personas/      @oa-sdk/personas     Data Persona trait registry + persona matrix + validator [maintenance]
    typia-mock/    @oa-sdk/typia-mock   typia ILlmApplication 검증 서버 [maintenance]
  apps/
    nestjs-ref/    @oa-sdk/nestjs-ref NestJS reference implementation
    playground/    @oa-sdk/playground 통합 테스트 + 데모
    preview/       @oa-sdk/preview Vite 프리뷰 웹앱 (SW mock + 코드 생성)
    spec-lens/     @oa-sdk/spec-lens-ui spec observation UI
    fastapi-ref/   pnpm workspace가 아닌 FastAPI reference implementation
  docs/
    guides/        유저 가이드 (use-cases 포함)
    internal/      프로젝트 관리 SSOT
    references/    OAS 3.2 스펙 분할본
```

## 패키지 카테고리

| Scope tier | 패키지 | 소유 범위 |
|---|---|---|
| Core Platform | `@oa-sdk/core`, `@oa-sdk/openapi-projection-contract`, `@oa-sdk/schemas`, `@oa-sdk/parser`, `@oa-sdk/codegen`, `@oa-sdk/spec-lens` | schema/spec SSOT, 외부 projection 경계, 파싱/검증/생성, 변경 이력 관측 |
| Downstream Integration | `@oa-sdk/router`, `@oa-sdk/client`, `@oa-sdk/mock-server` | Core 계약을 server stub, fetch client, mock runtime으로 투영하고 소비 가능성을 증명 |
| Maintenance-only | `@oa-sdk/dpm`, `@oa-sdk/personas`, `@oa-sdk/typia-mock` | 기존 계약의 security, compatibility, migration 유지. 신규 기능은 scope reactivation 전까지 금지 |
| Apps/reference | `@oa-sdk/nestjs-ref`, `@oa-sdk/playground`, `@oa-sdk/preview`, `@oa-sdk/spec-lens-ui` | reference, E2E, preview, UI consumer surface. library ownership 없음 |

`@oa-sdk/dpm`은 API 스펙 패키지의 확장이 아니라 논리 데이터 계약 패키지다. DB catalog나
OpenAPI projection은 구조적 evidence로만 소비하고, approved relationship과 namespace 정책은
DPM manifest와 Relationship Registry가 소유한다. 물리 FK 생성, DB migration, production data
rewrite는 기본 책임이 아니며, 필요하면 recommendation 또는 별도 runtime phase로 분리한다.

`@oa-sdk/personas`도 data-governance domain에 속하고, `@oa-sdk/typia-mock`은 독립 experiment다.
이 package들이 OpenAPI를 입력으로 사용하거나 Core utility에 의존하더라도 Core Platform
ownership을 갖지는 않는다.

## 의존 그래프

```
openapi-projection-contract (0 의존)
core (0 의존)
schemas      ← parser (build-time TypeSpec validation; source/artifact ownership remains independent)
parser       ← core + openapi-projection-contract
codegen      ← core + parser + openapi-projection-contract (+ router, client: optional peer — CLI 전용)
spec-lens    ← parser + codegen

-- downstream integration boundary --
mock-server  ← core + parser
router       ← core + parser
client       ← core + parser

-- maintenance boundary --
dpm          ← openapi-projection-contract
personas     ← 독립
typia-mock   ← core + parser (+ typia: peer)
```

Dependency direction과 product ownership은 동일한 개념이 아니다. Maintenance-only package가
Core package를 import해도 Core roadmap에 포함되지 않으며, Core package는 새 기능을 위해
maintenance package에 의존해서는 안 된다.

## 향후 분리 경계

Markdown editor와 GitLab agent operations는 2026-07-11에 각각 `markdown-editor`와
`gitlab-agent-ops` 저장소로 추출했다. 현재 monorepo에 남은 후보는 다음과 같다.

| 후보 | 이동 대상 | 현재 호환 경계 |
|---|---|---|
| `data-governance` | `@oa-sdk/dpm`, `@oa-sdk/personas` | projection contract와 OpenAPI artifact interface |
| experiment/archive | `@oa-sdk/typia-mock` | public entrypoint와 optional typia peer contract |

Extraction 전 migration은 package name/import compatibility와 소비자 검증을 보존해야 한다.
신규 non-core feature를 이유로 extraction을 미루거나 package 간 역의존을 추가하지 않는다.

## 패키지별 주요 파일

→ 상세: [api-index.md](https://github.com/mineclover/oa-sdk/blob/main/docs/internal/api-index.md) (source SSOT)

### @oa-sdk/core

| 파일 | 역할 |
|------|------|
| `src/strings.ts` | pascalCase, escapeKey, toColonPath |
| `src/codegen-utils.ts` | collectTypeNames |
| `src/format.ts` | formatGeneratedTs (코드 자동 정렬) |
| `src/response-utils.ts` | pickDefaultStatus |
| `src/http.ts` | createHttpServer, writeJson, readRaw, readJsonBody, ApiError, ApiErrorDetail |

### @oa-sdk/openapi-projection-contract

| 파일 | 역할 |
|------|------|
| `src/index.ts` | OpenApiProjectionResult, projection profile semantics, projection metadata extension constants, dependency-light validation |

### @oa-sdk/parser

| 파일 | 역할 |
|------|------|
| `src/types/*.ts` | OAS 3.2 전체 타입 (§별 13파일) |
| `src/types.ts` | ParsedDocument IR |
| `src/parse.ts` | parseDocument() 풀 파서 (Node/full pipeline entry) |
| `src/parse-core.ts` | pipeline 후 OAS 객체 또는 browser no-deref 객체를 ParsedDocument IR로 구성하는 순수 코어 |
| `src/browser.ts` | 브라우저 안전 parser entry. no-deref parse + query/fold/route match + internal-only deref |
| `src/deref-internal.ts` | 파일시스템 없이 internal `$ref`만 인라인 전개 |
| `src/schema-loader.ts` | loadSchema() + route-match re-export |
| `src/schema-loader-browser.ts` | browser no-deref RouteIndex loader |
| `src/route-match.ts` | HTTP_METHODS + RouteIndex matchRoute() |
| `src/deref.ts` | $ref 역참조 + 순환 감지 |
| `src/fold.ts` | SchemaAlgebra + foldSchema() |
| `src/pipeline.ts` | SpecPass[] 파이프라인 |
| `src/lint.ts` | 자체 OAS 3.2 린터 |
| `src/query.ts` | findOperation, findByTag, describeApi |

### @oa-sdk/schemas

| 파일 | 역할 |
|------|------|
| `typespec/main.tsp` | production TypeSpec schema source |
| `typespec/oa-sdk.typespec-bundle.json` | production TypeSpec bundle manifest |
| `typespec/accepted-restored-drift.json` | reviewed restored-vs-reference drift manifest |
| `src/fragments/**/*.yaml` | Definition Builder rollback/reference fragments |
| `src/targets/*.yaml` | Definition Builder rollback/reference target configs |
| `src/openapi.yaml`, `src/profiles/*.yaml`, `src/domains/*/spec.yaml` | legacy merge reference material |
| `scripts/downgrade-3.1.ts` | 3.2→3.1 다운그레이드 |

### @oa-sdk/dpm

| 파일 | 역할 |
|------|------|
| `src/schema/` | DPM manifest JSON Schema, schema identity, syntax contract |
| `src/catalog/` | PostgreSQL/OpenAPI projection 기반 catalog snapshot model과 freshness hash |
| `src/discovery/` | 실행 불가능한 relationship candidate report |
| `src/registry/` | approved/proposed/rejected/deprecated/superseded relationship snapshot lifecycle |
| `src/model/` | logical entity, canonical key, relationship namespace model |
| `src/validator/` | REL/SAF semantic diagnostics without source DB access |
| `src/compiler/` | validated manifest + catalog + registry → compiled plan |
| `src/dry-run/` | raw sensitive value 없는 impact report |
| `src/gateway/` | DPM 관리 HTTP surface의 OpenAPI artifact |
| `src/publishing/` | AI schema context와 physical FK recommendation output |

### @oa-sdk/personas

| 파일 | 역할 |
|------|------|
| `src/profiles/*.profile.yaml` | 도메인별 persona profile |
| `src/data-models/*.persona.yaml` | 데이터 모델 persona matrix |
| `src/kind.ts` | persona kind taxonomy |
| `src/generate-tests.ts` | profile 기반 테스트 생성 보조 |

### @oa-sdk/mock-server

| 파일 | 역할 |
|------|------|
| `src/core/request-validator.ts` | AJV 검증 + Security + style/explode |
| `src/core/response-picker.ts` | 응답 선택 + headers 전달 |
| `src/core/generate.ts` | 최소 값 생성 (Faker 미사용) |
| `src/core/stream.ts` | SSE/NDJSON 스트리밍 |
| `src/core/route-filter.ts` | 라우트 필터 (paths/operations/tags/custom) |
| `src/adapters/msw.ts` | MSW 어댑터 + createMswMockServer (override 지원) |
| `src/adapters/node-http.ts` | Node HTTP 어댑터 + response override |
| `src/browser.ts` | 브라우저용 엔트리 (Node.js 의존성 없음) |
| `src/testing.ts` | createTestClient + createCoverageTracker |

### @oa-sdk/codegen

| 파일 | 역할 |
|------|------|
| `src/zod-to-schema.ts` | Zod 4 → OAS Schema |
| `src/typegen/schema-to-ts.ts` | OAS → TypeScript 타입 (JSDoc 제약, readonly, deprecated, annotations) |
| `src/typegen/generate-types.ts` | ParsedDocument → TS 파일 (schema/Op 중복 방지) |
| `src/typegen/browser.ts` | 브라우저 안전 typegen entry. in-memory spec만 처리하고 외부 파일 ref graph는 import하지 않음 |
| `src/drizzle/extractor.ts` | Drizzle 테이블 감지 |
| `src/drizzle/converter.ts` | Drizzle → Zod 변환 |
| `src/cli/index.ts` | oa-gen CLI 디스패치 (커맨드 모듈 기반) |
| `src/cli/commands/*.ts` | 7개 커맨드 모듈 (generate/typegen/router/client/lint/validate/dev) |
| `src/cli/lib/*.ts` | CLI 공유 유틸 (types, args, load-spec, output, help, run, try-import) |

### @oa-sdk/router

| 파일 | 역할 |
|------|------|
| `src/generate-router.ts` | OAS → Hono/Express 라우터 |
| `src/browser.ts` | 브라우저 안전 라우터 생성 entry. in-memory spec만 처리하고 Node parser pipeline은 import하지 않음 |

### @oa-sdk/client

| 파일 | 역할 |
|------|------|
| `src/generate-client.ts` | OAS → fetch createClient() + SSE + 인증 미들웨어 + retry/timeout + validate |
| `src/browser.ts` | 브라우저 안전 클라이언트 생성 entry. in-memory spec만 처리하고 Node parser pipeline은 import하지 않음 |

### @oa-sdk/typia-mock

| 파일 | 역할 |
|------|------|
| `src/types.ts` | ILlmApplication/ILlmFunction 호환 타입 + ValidationResult |
| `src/core/validator.ts` | 3단계 파이프라인 (parse → coerce → validate) |
| `src/core/generate.ts` | typiaGenerateAlgebra + foldSchema 기반 mock 데이터 생성 |
| `src/core/function-registry.ts` | ILlmApplication 함수 조회 |
| `src/server/node-http.ts` | HTTP 검증 서버 (GET /functions, POST /validate, POST /call) |

### @oa-sdk/spec-lens

| 파일 | 역할 |
|------|------|
| `src/application/` | snapshot refresh, graph, diff, timeline query use cases |
| `src/infrastructure/` | GitHub/GitLab/local file source adapters, SQLite cache |
| `src/presentation/http/server.ts` | HTTP presentation adapter |
| `src/cli.ts` | spec observation CLI entry |
