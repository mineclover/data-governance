# 프로젝트 목표

→ 진행 현황 체크리스트: [progress-index.md](./progress-index.md)

## 현재 목표 운영 범위

제품 범위의 SSOT는 [`../platform-scope.md`](../platform-scope.md)다. 앞으로 active feature
goal의 기본 범위는 다음 Core Platform 여섯 패키지다.

`@oa-sdk/core`, `@oa-sdk/openapi-projection-contract`, `@oa-sdk/schemas`,
`@oa-sdk/parser`, `@oa-sdk/codegen`, `@oa-sdk/spec-lens`

`router`, `client`, `mock-server`를 포함해 Core Platform 밖의 신규 feature goal은 구현 전에
명시적인 scope-reactivation decision을 요구한다. 결정에는 사용자 문제, Core Mission과의 관계,
소유자와 유지 비용, release/CI 책임, monorepo 유지 또는 extraction 방향을 기록한다.

`dpm`, `personas`, `typia-mock`은 maintenance-only다. 별도 decision이 없는
상태에서 허용되는 goal은 security, compatibility, migration/extraction에 한정한다.
App/reference workspace는 Core roadmap 밖의 consumer surface다. Markdown editor와 GitLab agent
operations의 신규 목표는 각각 `markdown-editor`, `gitlab-agent-ops` 저장소에서 관리한다.

아래 완료 목록은 구현 이력이다. 과거 goal의 완료 상태는 현재 active product scope나 신규 기능
투자 승인을 뜻하지 않는다. 특히 Goal 4~64와 Goal 67의 DPM 결과물은 보존하되 maintenance-only
policy를 적용한다.

## Scope-gated next candidate

통합 순서와 goal 간 gap은 [DPM Master Roadmap](./dpm-master-roadmap.md)을 기준으로 한다.

| 목표 | 상태 | 패키지 |
|---|---|---|
| [Goal 68 — DPM Logical Data Definition and Extraction Boundary](./goal-68-dpm-logical-data-definition-boundary.md) | 진행 중 — private canonical repository 생성, 68.4 local packed runtime/declaration/rollback rehearsal 완료, artifact validation 및 owner acceptance 대기 | dpm / data-governance |

## 완료 목표 이력

| 목표/Phase | 상태 | 패키지 |
|-----------|------|--------|
| [Goal 1 — 스키마 관리](./goal-1-schemas.md) | ✅ | schemas |
| [Goal 2 — 코드젠](./goal-2-codegen.md) | ✅ | codegen |
| [Goal 3 — Mock 서버](./goal-3-mock-server.md) | ✅ | mock-server |
| [Goal 4 — Relationship-First DPM Roadmap](./goal-4-dpm-relationship-first-roadmap.md) / [Implementation Strategy](./goal-4-dpm-implementation-strategy.md) | ✅ | dpm |
| [Goal 5 — DPM Runtime/Storage Integration](./goal-5-dpm-runtime-storage-integration.md) | ✅ | dpm |
| [Goal 6 — DPM Contract Stabilization](./goal-6-dpm-contract-stabilization.md) | ✅ | dpm |
| [Goal 7 — DPM Profile/Connector Contract](./goal-7-dpm-profile-connector-contract.md) | ✅ | dpm |
| [Goal 8 — DPM Profile Baseline Storage](./goal-8-dpm-profile-baseline-storage.md) | ✅ | dpm |
| [Goal 9 — DPM Profile Baseline Analysis Resolver](./goal-9-dpm-profile-baseline-analysis-resolver.md) | ✅ | dpm |
| [Goal 10 — DPM Profile Baseline Selection](./goal-10-dpm-profile-baseline-selection.md) | ✅ | dpm |
| [Goal 11 — DPM Profile Baseline Measurement History](./goal-11-dpm-profile-baseline-measurement-history.md) | ✅ | dpm |
| [Goal 12 — DPM Profile Baseline History Summary](./goal-12-dpm-profile-baseline-history-summary.md) | ✅ | dpm |
| [Goal 13 — DPM Profile Baseline Summary Repository](./goal-13-dpm-profile-baseline-summary-repository.md) | ✅ | dpm |
| [Goal 14 — DPM Profile Baseline Resolution Summary](./goal-14-dpm-profile-baseline-resolution-summary.md) | ✅ | dpm |
| [Goal 15 — DPM Profile Baseline Summary Storage Projection](./goal-15-dpm-profile-baseline-summary-storage-projection.md) | ✅ | dpm |
| [Goal 16 — DPM Profile Baseline Summary Gateway](./goal-16-dpm-profile-baseline-summary-gateway.md) | ✅ | dpm |
| [Goal 17 — DPM Profile Baseline Summary-First Selection](./goal-17-dpm-profile-baseline-summary-first-selection.md) | ✅ | dpm |
| [Goal 18 — DPM Profile Baseline Summary Invariants](./goal-18-dpm-profile-baseline-summary-invariants.md) | ✅ | dpm |
| [Goal 19 — DPM Profile Baseline Summary Consumer Smoke](./goal-19-dpm-profile-baseline-summary-consumer-smoke.md) | ✅ | dpm |
| [Goal 20 — DPM Category Subpath Exports](./goal-20-dpm-category-subpath-exports.md) | ✅ | dpm |
| [Goal 21 — DPM Subpath Consumer Smoke](./goal-21-dpm-subpath-consumer-smoke.md) | ✅ | dpm |
| [Goal 22 — DPM Pack Boundary Smoke](./goal-22-dpm-pack-boundary-smoke.md) | ✅ | dpm |
| [Goal 23 — DPM Gateway Blocking Response Contract](./goal-23-dpm-gateway-blocking-response-contract.md) | ✅ | dpm |
| [Goal 24 — DPM Measured Relationship Proposals](./goal-24-dpm-measured-relationship-proposals.md) | ✅ | dpm |
| [Goal 25 — DPM Discovery Gateway Candidate Contract](./goal-25-dpm-discovery-gateway-candidate-contract.md) | ✅ | dpm |
| [Goal 26 — DPM Relationship Discovery Runtime Adapter](./goal-26-dpm-relationship-discovery-runtime-adapter.md) | ✅ | dpm |
| [Goal 27 — DPM Relationship Approval Runtime Adapter](./goal-27-dpm-relationship-approval-runtime-adapter.md) | ✅ | dpm |
| [Goal 28 — DPM Registry Snapshot Export Runtime Adapter](./goal-28-dpm-registry-snapshot-export-runtime-adapter.md) | ✅ | dpm |
| [Goal 29 — DPM Candidate Import Review Report Runtime](./goal-29-dpm-candidate-import-review-report-runtime.md) | ✅ | dpm |
| [Goal 30 — DPM Relationship Workflow Consumer Smoke](./goal-30-dpm-relationship-workflow-consumer-smoke.md) | ✅ | dpm |
| [Goal 31 — DPM Profile Relationship Candidate Bridge](./goal-31-dpm-profile-relationship-candidate-bridge.md) | ✅ | dpm |
| [Goal 32 — DPM Registry Approval Persistence Bridge](./goal-32-dpm-registry-approval-persistence-bridge.md) | ✅ | dpm |
| [Goal 33 — DPM Profile Analysis Policy Contract](./goal-33-dpm-profile-analysis-policy-contract.md) | ✅ | dpm |
| [Goal 34 — DPM Approved Registry Save Guard](./goal-34-dpm-approved-registry-save-guard.md) | ✅ | dpm |
| [Goal 35 — DPM Approved Registry Uniqueness Guard](./goal-35-dpm-approved-registry-uniqueness-guard.md) | ✅ | dpm |
| [Goal 36 — DPM Approved Registry Approval Metadata](./goal-36-dpm-approved-registry-approval-metadata.md) | ✅ | dpm |
| [Goal 37 — DPM Profile Analysis Policy Provenance](./goal-37-dpm-profile-analysis-policy-provenance.md) | ✅ | dpm |
| [Goal 38 — DPM Profile Hint Endpoint Resolution](./goal-38-dpm-profile-hint-endpoint-resolution.md) | ✅ | dpm |
| [Goal 39 — DPM Profile Hint Approval Workflow](./goal-39-dpm-profile-hint-approval-workflow.md) | ✅ | dpm |
| [Goal 40 — DPM Registry Approval Audit Events](./goal-40-dpm-registry-approval-audit-events.md) | ✅ | dpm |
| [Goal 41 — DPM Registry Audit Event Timeline Runtime](./goal-41-dpm-registry-audit-event-timeline-runtime.md) | ✅ | dpm |
| [Goal 42 — DPM Profile Hint Approval Gateway Contract](./goal-42-dpm-profile-hint-approval-gateway-contract.md) | ✅ | dpm |
| [Goal 43 — DPM Registry Write Receipt Gateway Boundary](./goal-43-dpm-registry-write-receipt-gateway-boundary.md) | ✅ | dpm |
| [Goal 44 — DPM Registry Approval Commit Hook](./goal-44-dpm-registry-approval-commit-hook.md) | ✅ | dpm |
| [Goal 45 — DPM Registry Write Receipt Audit Link](./goal-45-dpm-registry-write-receipt-audit-link.md) | ✅ | dpm |
| [Goal 46 — DPM Postgres Registry Storage Adapter](./goal-46-dpm-postgres-registry-storage-adapter.md) | ✅ | dpm |
| [Goal 47 — DPM Postgres Registry Consumer Demo](./goal-47-dpm-postgres-registry-consumer-demo.md) | ✅ | dpm |
| [Goal 48 — DPM Registry Schema Apply Helper](./goal-48-dpm-registry-schema-apply-helper.md) | ✅ | dpm |
| [Goal 49 — DPM Storage Demo Schema Bootstrap](./goal-49-dpm-storage-demo-schema-bootstrap.md) | ✅ | dpm |
| [Goal 50 — DPM Registry Split Append Audit Return](./goal-50-dpm-registry-split-append-audit-return.md) | ✅ | dpm |
| [Goal 51 — DPM Kafka Topic Profile Connector Contract](./goal-51-dpm-kafka-topic-profile-connector-contract.md) | ✅ | dpm |
| [Goal 52 — DPM Kafka Topic Profile Input Validation](./goal-52-dpm-kafka-topic-profile-input-validation.md) | ✅ | dpm |
| [Goal 53 — DPM Kafka Relationship Hint Safe Identity](./goal-53-dpm-kafka-relationship-hint-safe-identity.md) | ✅ | dpm |
| [Goal 54 — DPM Kafka Relationship Hint Source Pointer](./goal-54-dpm-kafka-relationship-hint-source-pointer.md) | ✅ | dpm |
| [Goal 55 — DPM Profile Hint Target Catalog Authority](./goal-55-dpm-profile-hint-target-catalog-authority.md) | ✅ | dpm |
| [Goal 56 — DPM Kafka Invalid Capture Mode Audit](./goal-56-dpm-kafka-invalid-capture-mode-audit.md) | ✅ | dpm |
| [Goal 57 — DPM Package Consumer Surface Guide](./goal-57-dpm-package-consumer-surface-guide.md) | ✅ | dpm |
| [Goal 58 — DPM Approved Registry Conflict Contract](./goal-58-dpm-approved-registry-conflict-contract.md) | ✅ | dpm |
| [Goal 59 — DPM Registry Snapshot Approval Metadata Guard](./goal-59-dpm-registry-snapshot-approval-metadata-guard.md) | ✅ | dpm |
| [Goal 60 — DPM Package Consumer Workflow Smoke](./goal-60-dpm-package-consumer-workflow-smoke.md) | ✅ | dpm |
| [Goal 61 — DPM Registry Conflict Blocking Stabilization](./goal-61-dpm-registry-conflict-blocking-stabilization.md) | ✅ | dpm |
| [Goal 62 — DPM Package Consumer Audit Readback Smoke](./goal-62-dpm-package-consumer-audit-readback-smoke.md) | ✅ | dpm |
| [Goal 63 — DPM Product Flow Operating Strategy](./goal-63-dpm-product-flow-operating-strategy.md) | ✅ | dpm |
| [Goal 64 — DPM Column Policy Uniqueness](./goal-64-dpm-column-policy-uniqueness.md) | ✅ | dpm |
| [Goal 65 — Browser Ref Completeness Contract](./goal-65-browser-ref-completeness-contract.md) | ✅ | parser, client, router |
| [Goal 66 — spec-lens TypeSpec Observability and Cache v2](./goal-66-spec-lens-typespec-observability-v2.md) | ✅ | spec-lens, codegen |
| [Goal 67 — DPM Canonical Key Typed Encoding v2](./goal-67-dpm-canonical-key-typed-v2.md) | ✅ | dpm |
| Phase 3 — OAS 파서/IR | ✅ | parser |
| Phase 4 — TS 타입 생성 | ✅ | codegen/typegen |
| Phase 5 — 라우터 스텁 | ✅ | router |
| Phase 6 — 클라이언트 SDK | ✅ | client |

→ 상세 로드맵: [plan.md](../plan.md)
→ 구현 현황: [spec.md](../spec.md)
