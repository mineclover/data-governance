# DPM Master Roadmap — Capability and Gap Alignment

**Status: private owner acceptance recorded 2026-07-15; public release and breaking removal remain separately gated**

> Relationship-first baseline: [Goal 4](https://github.com/mineclover/oa-sdk/blob/main/docs/internal/goals/goal-4-dpm-relationship-first-roadmap.md)<br>
> Control-plane runtime/storage baseline: [Goal 5](https://github.com/mineclover/oa-sdk/blob/main/docs/internal/goals/goal-5-dpm-runtime-storage-integration.md)<br>
> Current gap goal: [Goal 68](./goal-68-dpm-logical-data-definition-boundary.md)<br>
> Package boundary: [Package Architecture](../architecture/packages.md)

## Executive state

DPM의 relationship governance loop은 Goal 4~67을 통해 구현되어 있다. 현재 남은 핵심 contract
gap은 “논리 데이터 정의가 없다”가 아니라, 이미 존재하는 logical entity/relationship와
API artifact, DB catalog object를 독립 identity로 연결하고 그 binding을 semantic
validation과 compiled provenance에 반영하는 층이다.

전체 제품 목적은 contract에서 끝나지 않는다. 스펙 관리, 고유 키 관리, 검색, 편집,
작성 편의성을 완성하려면 stable identity와 neutral artifact 위에 read model과
draft/edit/publish workflow를 제공하는 control-plane capability가 추가로 필요하다. 이
capability는 Goal 68의 contract boundary와 구분하며, owner 결정 전에 active feature goal로
취급하지 않는다.

현재 상태를 한 줄로 요약하면 다음과 같다.

```text
relationship-first DPM core       = implemented and tested
logical data/API/DB shape         = v1.1 identity, semantic binding, and neutral artifact implemented
ownership and implementation site = private external owner is canonical; monorepo remains compatibility/source until T1
cross-object semantic binding     = implemented and tested for v1.1
search/edit/authoring control     = scope-gated follow-on capability
production pseudonymization       = outside current oa-sdk boundary
```

## Product-purpose coverage

| Product purpose | Current coverage | Remaining capability |
|---|---|---|
| Spec management | logical entity/relationship, explicit field identity, semantic validation, compilation, and neutral artifact | immutable revision, diff, lifecycle, breaking-change classification |
| Unique-key management | column coordinate uniqueness, versioned canonical-key encoding, and separate object/revision/locator/binding identities | final external wire ownership and migration compatibility |
| Search | profile summary and registry/audit readback | cross-identity lookup, filtered search, reverse lookup and where-used |
| Edit | proposal review and relationship approval | data-definition draft, validate preview, publish, deprecate and rollback |
| Convenience | public subpaths, package smoke, import/export, explain, and machine-readable quick-fix suggestions | automatic mutation, bulk edit and broader authoring workflows |

## Capability map

| Phase | Goal history | Capability | Current status | Gap after phase |
|---|---|---|---|---|
| 0. Governance | ADR-010, release policy, package architecture, Goal 68.0 | DPM package ownership, implementation site and safety boundary | Private `mineclover/data-governance` owner and private acceptance recorded | public release metadata and breaking removal |
| 1. Relationship contract | Goals 4–6, 64, 67 | manifest, entity, relationship, column policy, validator, compiler, typed identity | Implemented | logical field identity is not yet cross-bound to API/catalog |
| 2. Evidence and proposal | Goals 7–19, 24–26, 31, 33, 37, 38, 51–56 | catalog/profile evidence, discovery proposals, thresholds, provenance, endpoint resolution | Implemented | evidence does not itself become data binding or relationship approval |
| 3. Approval and durability | Goals 23, 27–30, 32, 34–50, 58, 59, 61, 63 | gateway workflow, registry approval, storage, audit and reports | Implemented within declared boundary | no production token/vault/data-plane execution |
| 4. Public package contract | Goals 20–22, 57, 60, 62 | subpaths, pack boundary, consumer workflow, docs and contract checks | Implemented; private external extraction and CI verified | public release metadata |
| 5. Logical identity contract | Goal 68.1 | stable object/revision identity, namespace-safe refs, binding cardinality | Implemented and accepted for private owner contract | future wire revisions |
| 6. Semantic binding | Goal 68.2 | entity/API/catalog resolution and deterministic diagnostics | Implemented and accepted for private owner contract | future owner-authorized capability |
| 7. Neutral artifact and provenance | Goal 68.3 | binding freshness, compiled plan, trace/review links, read-model source | Implemented and accepted for private owner contract | future owner-authorized capability |
| 8. Search, edit and authoring control plane | Private representative product slice | exact cross-identity lookup, scoped field filters, canonical import/export/explain, semantic-diff quick-fix suggestions, draft/revision/publish, diff, and rollback | Active private slice implemented; cross-definition search first, automatic mutation second, and bulk authoring last remain deferred | [Next follow-on priority decision](./phase-8-next-follow-on-priority-decision.md) |
| 9. Extraction rehearsal | Goal 68.4 | external consumer, migration, compatibility adapter | Private owner acceptance recorded; adapter transition scheduled after first accepted owner artifact release | public release metadata and breaking removal |
| 10. Data-plane runtime | Future external/runtime program | vault, tokenization worker, row rewrite, post-run integrity | Explicitly outside current roadmap | requires separate runtime owner, security model, and deployment authority |

## Dependency order

```mermaid
flowchart LR
  G0["Phase 0 owner and implementation-site decision"] --> G5["Phase 5 identity contract"]
  G1["Phases 1-4 completed DPM core"] --> G5
  G5 --> G6["Phase 6 semantic binding"]
  G6 --> G7["Phase 7 neutral artifact and provenance"]
  G7 --> G8["Phase 8 search, edit and authoring"]
  G0 --> G9["Phase 9 extraction rehearsal"]
  G7 --> G9
  G0 --> G10["Phase 10 external data-plane ownership"]
  G7 --> G10
```

The completed goals are prerequisites, not competing roadmap branches. No new semantic
binding implementation should bypass Phase 0, and no data-plane runtime should be added to
the current `@oa-sdk/dpm` maintenance-only package without a separate ownership decision. Phase 10
is a separate external branch. Phase 8 and Phase 9 are parallel owner-gated branches after the
neutral artifact: extraction rehearsal does not wait for the future search/edit control plane,
and local extraction is not evidence of production runtime readiness.

## Gap register

### G-01 — Ownership and authority

Current `@oa-sdk/dpm` is private and maintenance-only. The canonical private owner is now
`https://github.com/mineclover/data-governance`; the repository
owner `mineclover` is the release authority for the private contract plane.

The 2026-07-15 owner decision created the private repository and completed the private extraction
handoff. The accepted decision record is [here](./owner-decision-record.md), and the latest owner
verification workflow [29412035473](https://github.com/mineclover/data-governance/actions/runs/29412035473)
passed for the selected private source ref. GitHub Issues, the structured Goal 68.4 acceptance form, the compatibility
window, and the canonical document ownership are recorded in [Issue #1](https://github.com/mineclover/data-governance/issues/1).

The remaining release gate is intentionally narrow: the recommended public target is
`@mineclover/dpm`, but public package metadata/registry publication and breaking removal of the old
import surface require a separate owner-approved SemVer tag or GitHub Release with a successful
release-gate workflow for the selected source ref. No scope reactivation is authorized by this decision.

Blocking phases: 5–10.

### G-02 — Identity contract

Goal 68.1 implements the separate `field:`, `db:`, `api:`, and `binding:` identities, rename-safe
logical object/revision/locator/binding records, dataset/namespace-safe references, catalog
snapshot/freshness context, API pointer identity, and Goal 67 canonical data-value encoding.
`operationId` remains a navigation hint and does not participate in canonical API object identity.

The current contract gap is closed and accepted for the private owner. Future wire revisions or
additional lifecycle semantics are owner-authorized extensions, not unfinished Phase 5 work.

Blocking phase: none for the accepted contract; future extensions are owner-gated.

### G-03 — Cross-object semantic validation

Goal 68.2 implements entity membership, catalog table/column membership, API pointer and operation
consistency, artifact version/provenance verification, binding cardinality, storage-origin
consistency, and deterministic diagnostics.

The current semantic binding contract is closed and accepted for the private owner. Future search,
authoring, and read-model consumers may extend these diagnostics after Phase 8 activation.

Blocking phase: none for the accepted contract; future consumers are Phase 8 owner-gated.

### G-04 — Neutral artifact and freshness

Goal 68.3 provides the immutable `DpmNeutralDataBindingArtifact`, freshness tuple, compiled plan
identity, trace/review links, and read-model source without making Core depend on DPM policy
internals. The neutral artifact contract is implemented and accepted for private ownership.

Remaining work is consumption by the owner-authorized Phase 8 control plane and final external wire
ownership in Phase 9; neither is a missing Phase 7 implementation.

Blocking phases: 8–9 for future consumers and external release only.

### G-05 — Spec lifecycle and change classification

The structural slice has no immutable published revision, draft base revision, semantic diff,
breaking-change classification, rename/deprecation lifecycle, or rollback contract. These are
control-plane capabilities and must not be hidden inside the compiler contract.

Blocking phase: 8.

### G-06 — Cross-identity search and read model

Existing list/export APIs prove focused workflows, but there is no neutral read model that can find
the same binding by logical object id, current locator, API pointer, DB coordinate, semantic type,
sensitivity, or lifecycle state. Reverse lookup and where-used behavior are also undefined.

Blocking phase: 8.

### G-07 — Edit and authoring convenience

Relationship review/approval does not provide a data-definition authoring workflow. Draft validation,
optimistic concurrency, publish approval, audit/rollback, import/export, explain, and
machine-readable quick-fix suggestions require one representative owner-authorized product flow;
automatic mutation and bulk edit remain outside that slice.

Blocking phase: 8.

### G-08 — Runtime boundary

The existing DPM goals deliberately stop before production vault behavior, real tokenization, source
mutation, and physical FK creation. These are not missing implementation details inside Goal 68;
they require a separate runtime owner and security/deployment contract.

Blocking phase: 10 only.

## Delivery order

### Phase 0 — Ownership and compatibility decision (Goal 68.0) ✅

Goal 68.0 is resolved. The 2026-07-15 owner decision makes this private repository canonical for
the extraction contract and freezes `data_definitions` `1.0` as the structural compatibility
contract; `1.1` remains deferred experimental. The former `oa-sdk` package remains the
source/compatibility implementation until the first accepted owner artifact release (`T1`) and
then becomes a forwarding adapter for one subsequent compatibility release.

New persisted schemas, gateway workflows, cross-repository resolvers, search services, and edit
workflows remain blocked unless separately authorized by the owner. Public registry publication and
breaking removal remain separate release gates.

### Phase 5 — Identity and wire contract (Goal 68.1)

Complete G-02:

- rename-safe logical object id, immutable revision id, human locator, and binding edge id;
- dataset/namespace-safe entity references;
- logical field identity independent of physical/API addresses;
- catalog snapshot/freshness/source-coordinate reference;
- API artifact/version/pointer identity with `operationId` excluded from canonical identity;
- persisted/derived/computed/API-only field-origin taxonomy;
- reverse binding cardinality plus rename, alias, deprecation, and supersession policy;
- identity golden vectors and an explicit experimental-or-frozen `data_definitions` wire-version decision.

### Phase 6 — Semantic binding (Goal 68.2)

Complete Goal 68.2:

- entity membership validation;
- catalog table/column membership validation;
- API pointer and operation consistency validation;
- artifact version/provenance verification;
- API-object-to-field and DB-object-to-field cardinality validation;
- persisted field origin/storage binding consistency validation;
- deterministic `DAT` diagnostics with source coordinates.

### Phase 7 — Neutral artifact, compiler and provenance (Goal 68.3)

Completed Goal 68.3:

- include binding freshness in compiled plan identity;
- emit an immutable neutral binding artifact that can source a future read model;
- connect API/data/DB identities to behavior trace and review records;
- prove the chain with an OpenAPI → DPM → catalog fixture.

### Phase 8 — Search, edit and authoring control plane (private representative slice active)

The 2026-07-15 [Phase 8 private activation decision](./phase-8-decision-record.md), amended by the
[scoped lookup decision](./phase-8-scoped-lookup-decision.md), currently authorizes one
definition-scoped representative flow in the private owner repository:

- exact lookup by logical object id, API pointer, or DB coordinate;
- deterministic field filters for entity, full locator, field name, semantic type, origin, and lifecycle;
- API/DB reverse identity context with the matched logical field and all of its API bindings;
- deterministic canonical import/export for the `data_definitions` `1.1` input shape;
- identity-only explain output for logical/API/DB review without sample values or secrets;
- immutable published revisions plus draft/base-revision optimistic concurrency;
- validate preview, semantic diff, breaking-change classification, publish approval, audit readback,
  and rollback.

Automatic mutation, cross-definition/product search, sensitivity/owner metadata,
relationship/policy/trace where-used, and bulk edit remain separate follow-on decisions.

Durable production persistence, external authorization, broad indexing, and unrestricted authoring
remain deferred. No Phase 8 implementation is added to the historical `oa-sdk` mirror.

### Phase 9 — Extraction rehearsal (Goal 68.4, owner-gated)

Private owner rehearsal and migration acceptance complete:

- clean external consumer build and package smoke;
- import/package migration contract;
- private repository governance and owner release authority;
- adapter fallback and rollback window.

The local packed artifact and clean runtime/declaration/rollback consumer evidence live in
`packages/dpm/test/package-extraction-smoke.mjs`, with fixtures in
`packages/dpm/test/external-consumer-fixture.mjs` and
`packages/dpm/test/external-consumer-type-fixture.ts` and
`packages/dpm/test/external-consumer-rollback-fixture.mjs`; migration and rollback rules live in
[Goal 68 Extraction Migration and Rollback Contract](./goal-68-dpm-extraction-migration.md), and
the accepted owner handoff is recorded in the [Goal 68.4 External Extraction Acceptance Checklist](./goal-68-extraction-acceptance-checklist.md) and [Issue #1](https://github.com/mineclover/data-governance/issues/1).

### Phase 10 — Separate external runtime program

Only after an external/runtime owner is selected, define vault, tokenization, source/target data
movement, post-run relationship validation, and production operational controls as a separate goal
family. Do not mark the current DPM contract roadmap incomplete because these are intentionally
outside its boundary.

## Definition of done for the owner-authorized roadmap

The owner-authorized DPM roadmap is complete when:

- the logical field/API/DB binding contract is semantically resolvable;
- logical object id, revision id, locator, binding id, and canonical data-value encoding are not conflated;
- stale or unverifiable references block compilation;
- compiled artifacts and traces preserve all three independent identities;
- one binding can be found from its logical id, API pointer, or DB coordinate with deterministic results;
- published revisions are immutable and concurrent edits reject a stale base revision;
- lifecycle values, semantic diff, breaking-change review, audit, and rollback are explicit in the
  accepted private slice;
- the current representative authoring flow covers definition-scoped import/explain/edit/validate/publish/search/readback
  plus semantic-diff quick-fix review suggestions without deep imports; automatic mutation and bulk authoring remain follow-on capabilities;
- external consumers can use the package without monorepo path assumptions;
- the runtime/data-plane boundary has an explicit external owner or remains explicitly deferred.

## Verification ladder

```bash
pnpm --filter @oa-sdk/dpm test
pnpm --filter @oa-sdk/dpm typecheck
pnpm --filter @oa-sdk/dpm smoke:subpaths
pnpm check:api-index
pnpm check:feature-tests
pnpm check:docs
git diff --check
```
