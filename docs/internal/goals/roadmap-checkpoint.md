# DPM Roadmap Checkpoint

**Status: v0.1.1 public package identity transition; registry publication pending**
**Updated: 2026-07-16**

The [DPM Master Roadmap](./dpm-master-roadmap.md) remains the canonical scope and phase plan.
This checkpoint is the lightweight operational loop for routine progress and feedback; a GitHub
Issue is not required for ordinary roadmap updates.

## Current focus

- Maintain the accepted DPM contract and private owner boundary.
- Use the T1 preflight and release-gate workflows for the corrected public package candidate.
- Publish `@context-action/dpm@0.1.1`, then verify and cut over the one-release compatibility adapter.
- Continue the activated [Phase 8 control-plane slice](./phase-8-decision-record.md) with focused
  private-owner work units, consumer evidence, and the [PostgreSQL persistence/index proposal](./phase-8-persistence-proposal.md).
- Maintain the completed scoped [Phase 8 lookup extension](./phase-8-scoped-lookup-decision.md)
  through consumer evidence before considering cross-definition search or broader authoring workflows.
- Maintain the completed private [Phase 8 authoring import/export helpers](./phase-8-authoring-import-export-decision.md)
  through round-trip consumer evidence; keep bulk edit and broad search deferred.
- Maintain the completed private [Phase 8 authoring explain helper](./phase-8-authoring-explain-decision.md)
  as a read-only identity summary; keep bulk edit and broad search deferred.
- Maintain the completed private [Phase 8 authoring quick-fix helper](./phase-8-authoring-quick-fix-decision.md)
  as review-only semantic-diff suggestions; keep automatic mutation, bulk edit, and broad search deferred.
- Follow the [Phase 8 next follow-on priority decision](./phase-8-next-follow-on-priority-decision.md)
  before activating cross-definition search, automatic mutation, or bulk authoring.
- Maintain the [cross-definition read-model contract](./phase-8-cross-definition-read-model-contract.md)
  as the prepared entry contract; keep runtime activation, durable indexing, and external
  authorization deferred until the listed owner gates are accepted.
- Use the [full phase execution forecast](./full-phase-execution-forecast.md) for work-unit and
  gate-based planning instead of calendar promises.

## Completed

- Private `mineclover/data-governance` owner and canonical document set established.
- Owner CI, documentation, boundary, test, consumer-smoke, and T1 preflight gates pass.
- Phase 8 activation, persistence, authorization, public-seam, audit, and compatibility decisions
  recorded for the private representative slice.
- Phase 8 authoring seam implemented with identity lookup, draft concurrency, semantic diff,
  role-gated approval/publish/rollback, immutable audit readback, and package smoke coverage.
- PostgreSQL durable target and canonical object/API/DB identity index direction recorded; no
  migration or deployment executed.
- Async PostgreSQL storage contract, schema blocks, identity-index writer, and fake-client evidence
  implemented without adding a database driver or applying SQL.
- Async authoring service façade and [operational migration packet](./phase-8-operational-migration-packet.md)
  prepared; no production cutover or migration authorized.
- The recommendation-only operational change decision is checked by `pnpm check:operational-change`
  so required owner gates and no-execution invariants are verified without an Issue.
- The approved T1 candidate state is checked by `pnpm check:t1-readiness`, preserving the private
  repository boundary, Apache-2.0 metadata, exact package identity/version, and release-gate wiring.
- The T1 release gate verifies all six explicit Issue #2 approval rows, including final release
  authorization, before accepting a `v*` tag;
  the private readiness check protects that workflow guard from drift.
- Goal 68 owner-acceptance documents point to the latest successful Owner CI and T1 preflight for
  the corrected `@context-action/dpm@0.1.1` candidate.
- Disposable local PostgreSQL rehearsal completed with schema, canonical identity index, fixture
  load, and backup/restore parity; no owner-managed database was contacted.
- Provider-neutral authorization policy port prepared; external identity/RBAC integration remains
  deferred until an operational owner is selected.
- Packed external consumer smoke now exercises the configured async authoring service through the
  public `@oa-sdk/dpm/authoring` subpath with an injected backend adapter; it does not create a
  database client or perform a storage cutover.
- The same packed consumer smoke covers canonical `1.1` import/export round-trip, identity-only
  explain output, and approval-required review-only quick-fix suggestions for breaking, rename, and
  deprecation changes.
- Its declaration consumer also typechecks the public authoring backend, async-service, semantic-diff,
  explanation, and quick-fix types from the packed `@oa-sdk/dpm/authoring` subpath.
- Scoped Phase 8 lookup extension implemented for entity/locator/name/type/origin/lifecycle filters,
  with sync/async consumer coverage and canonical API/DB reverse binding context.
- Canonical `data_definitions` `1.1` import/export helpers implemented with derived-identity stripping,
  deterministic ordering, invalid-input handling, and round-trip tests.
- Identity-only authoring explain helper implemented with deterministic logical/API/DB readback,
  deep immutability, and no sample-value or secret output.
- Semantic-diff quick-fix helper implemented with approval-required breaking-change review,
  alias-preserved rename/deprecation suggestions, deep immutability, and no raw change payloads.
- Routine roadmap feedback moved to this checkpoint and commit history.
- The first Phase 8 follow-on now has a private contract for canonical keys, projection ownership,
  freshness/rebuild state, deny-by-default authorization, bounded pagination, and fail-closed
  outcomes; its reference projection/query and conformance fixture pass privately while runtime
  activation remains deferred.
- The read-model activation sequence is now captured as a recommendation-only packet with disabled,
  shadow, read-only pilot, fallback, owner-value, and abort rules; it does not authorize migration
  or deployment.

## Next

- Review the approved T1 decision packet and current evidence in [Issue #2](https://github.com/mineclover/data-governance/issues/2)
  before creating the corrected `v0.1.1` tag.
- Review the async service integration boundary and operational migration packet; keep production
  schema application and deployment deferred.
- Review the [operational change decision](./phase-8-operational-change-decision.md) to prepare
  target, role, backup, flag, observation, and rollback values before any owner-approved run.
- Run `pnpm check:operational-change` whenever the operational decision or migration packet changes.
- Run `pnpm check:t1-readiness` whenever the T1 readiness or candidate decision packet changes.
- Keep scoped lookup, canonical import/export, explain, and quick-fix consumer evidence green; defer
  unsupported metadata filters, automatic mutation, bulk edit, and cross-definition runtime search;
  keep the prepared read-model contract and its drift check green.
- Continue contract maintenance and evidence refreshes through normal commits.
- Re-run `pnpm check:roadmap` and the owner CI for each checkpoint change.

## Deferred

- npm publication of `@context-action/dpm@0.1.1` until the corrected tag gate passes.
- `@oa-sdk/dpm` adapter cutover until the canonical package is published and compatibility smoke passes.
- Breaking removal of the compatibility package.

## Feedback loop

1. Add routine feedback as a row in the table below; do not open an Issue for ordinary progress.
2. Record the decision (`adopt`, `defer`, or `reject`) and the concrete follow-up.
3. Implement the follow-up in a focused commit whose message names the roadmap change.
4. Let `check:roadmap`, `check:docs`, and owner CI verify the checkpoint and evidence links.
5. Use a GitHub Issue only for formal owner approval, release authority, or another decision that
   must be explicitly acknowledged outside the commit history.

| Date | Feedback | Decision | Follow-up | Evidence |
| --- | --- | --- | --- | --- |
| 2026-07-15 | Issue-based roadmap checks are cumbersome for routine feedback. | adopt | Use this checkpoint and commit history for routine progress; keep Issue #2 for formal T1 approval only. | `c10ea98`, [Issue #2](https://github.com/mineclover/data-governance/issues/2) |
| 2026-07-15 | The roadmap's next capability is Phase 8, and its implementation decisions should be settled before coding. | adopt | Activate one private representative slice with an in-memory repository port, explicit roles, immutable audit, and no T1/public-release effects. | [Phase 8 decision record](./phase-8-decision-record.md) |
| 2026-07-15 | Exact calendar prediction is not reliable while Phase 8, T1, and runtime ownership gates are unresolved. | adopt forecast | Use phase status, work-unit ranges, confidence, and gate conditions in the full forecast. | [Full phase forecast](./full-phase-execution-forecast.md) |
| 2026-07-15 | PostgreSQL is the recommended durable target, but applying a migration now would exceed the approved private slice. | adopt contract / defer migration | Add schema/query contract and canonical identity-index tests; keep deployment and migration behind a separate operational approval. | [Persistence proposal](./phase-8-persistence-proposal.md) |
| 2026-07-15 | Authorization must remain portable across future identity providers. | adopt policy port / defer provider integration | Allow owner-injected role mapping with deny-by-default behavior; defer OIDC/RBAC deployment integration. | `0351114`, [Phase 8 decision record](./phase-8-decision-record.md) |
| 2026-07-15 | T1 package, registry, license, SemVer, and compatibility decisions can be prepared before public approval. | adopt recommendation / defer release action | Prepare `@context-action/dpm`, npm, Apache-2.0, `v0.1.0`, and one-release adapter-window recommendations; keep all metadata, tag, publication, and cutover actions behind Issue #2. | [T1 candidate decision packet](./t1-candidate-decision-packet.md) |
| 2026-07-15 | Phase 8 needs a useful read-model increment without opening cross-product indexing or public-release scope. | adopt scoped extension / defer broad search | Add definition-scoped entity/locator/name/type/origin/lifecycle filters and preserve API/DB reverse binding context; defer unsupported metadata and durable indexing. | [Scoped lookup decision](./phase-8-scoped-lookup-decision.md) |
| 2026-07-15 | Import/export is useful for authoring review but does not need repository, DB, or public-release changes. | adopt pure canonical helpers / defer broader authoring | Add deterministic `data_definitions` `1.1` import/export with derived-identity stripping and round-trip validation; defer explain, bulk edit, and broad search. | [Authoring import/export decision](./phase-8-authoring-import-export-decision.md) |
| 2026-07-15 | A contract-only explanation view improves review without exposing data values or adding persistence. | adopt pure explain helper / defer broader authoring | Add deterministic, deeply frozen logical/API/DB identity readback; defer quick fixes, bulk edit, and broad search. | [Authoring explain decision](./phase-8-authoring-explain-decision.md) |
| 2026-07-15 | Semantic diff classification is useful to review consumers, but automatic mutation would exceed the private slice. | adopt pure quick-fix suggestions / defer mutation | Add deterministic approval-required breaking-change review plus alias-preserved rename/deprecation suggestions; keep automatic mutation, bulk edit, and broad search deferred. | `bbd335e`, [Authoring quick-fix decision](./phase-8-authoring-quick-fix-decision.md) |
| 2026-07-15 | The remaining Phase 8 extensions have different persistence, authorization, conflict, and rollback prerequisites. | adopt ordered deferral | Prioritize a future cross-definition read model, then automatic mutation, then bulk edit; keep all three deferred until their entry contracts and operational owners are approved. | [Next follow-on priority decision](./phase-8-next-follow-on-priority-decision.md) |
| 2026-07-15 | Owner-specific operational values must not be mistaken for approval or execution readiness. | adopt automated contract check | Validate the recommendation-only status, required owner fields, backend contract, and no-execution invariants in CI; keep actual values and approval owner-gated. | `pnpm check:operational-change` |
| 2026-07-15 | Backend wiring needs evidence from the packed external consumer boundary, not only in-repository unit tests. | adopt consumer smoke | Run the configured async authoring service from `@oa-sdk/dpm/authoring` with an injected adapter and assert that no unselected adapter receives the write; keep real PostgreSQL cutover owner-gated. | `pnpm --filter @oa-sdk/dpm smoke:extraction` |
| 2026-07-15 | The existing authoring helpers must remain consumable outside the monorepo before broader Phase 8 work is considered. | adopt consumer smoke | Verify canonical import/export, identity-only explain, and review-only quick-fix suggestions from the packed `@oa-sdk/dpm/authoring` subpath; keep automatic mutation deferred. | `pnpm --filter @oa-sdk/dpm smoke:extraction` |
| 2026-07-15 | Runtime authoring evidence is insufficient if packed declaration consumers cannot typecheck the same public seam. | adopt declaration smoke | Typecheck backend, async-service, semantic-diff, explain, and quick-fix types from the packed authoring subpath; keep implementation and cutover owner-gated. | `pnpm --filter @oa-sdk/dpm smoke:extraction` |
| 2026-07-15 | T1 recommendation documents can drift from the private package boundary during routine maintenance. | adopt readiness contract check | Verify the recommendation-only packet, private package identity/version, absent license/publication metadata, absent `v*` tags, and explicit no-action boundaries in CI. | `pnpm check:t1-readiness` |
| 2026-07-15 | Goal 68 acceptance records retained an older Owner CI link after later private verification succeeded. | adopt evidence refresh | Synchronize current owner-acceptance references to the latest successful Owner CI while keeping T1 readiness pinned to the exact code-candidate and preflight runs. | `29412035473`, `29411791058`, `29411796346` |
| 2026-07-15 | A release tag could reach the verification workflow without the formal Issue #2 approval state being machine-checked. | adopt approval guard | Require all six checked Issue #2 approval rows, including final release authorization, in the T1 release gate and verify the guard remains wired during private readiness checks. | `scripts/check-t1-approval.mjs`, `pnpm check:t1-readiness` |
| 2026-07-15 | Cross-definition search is the first follow-on, but activation needs stable identity, freshness, authorization, and bounded-result rules before code or storage is added. | adopt contract / defer runtime | Prepare the read-model entry contract and CI drift check; keep search service, durable index, migration, and external authorization owner-gated. | [Cross-definition read-model contract](./phase-8-cross-definition-read-model-contract.md), `pnpm check:read-model-contract` |
| 2026-07-15 | The latest private Owner CI and T1 preflight now include the cross-definition contract guard, while owner-acceptance documents still referenced older runs. | adopt evidence refresh | Synchronize owner-acceptance and Issue #2 evidence to Owner CI `29414794498` and T1 preflight `29415008020`; leave all six approval rows unchecked. | `29414794498`, `29415008020`, [Issue #2](https://github.com/mineclover/data-governance/issues/2) |
| 2026-07-15 | The read-model activation gates need executable evidence for colliding definitions, duplicate identity collapse, pagination, authorization isolation, and stale-index failure. | adopt reference conformance / defer public seam | Add a private projection/query reference and tests without exporting a runtime API or connecting to a database. | `packages/dpm/test/authoring-read-model-contract.test.ts`, `pnpm check:read-model-contract` |
| 2026-07-15 | The private conformance fixture passed the full Owner CI and T1 preflight for the current candidate. | adopt evidence refresh | Pin readiness and owner-acceptance documents to Owner CI `29416050323` and T1 preflight `29416215842`; keep the public seam and six T1 approval rows unchanged. | `29416050323`, `29416215842`, [Issue #2](https://github.com/mineclover/data-governance/issues/2) |
| 2026-07-15 | The read-model contract needs an explicit operational sequence before any owner can review activation. | adopt recommendation-only packet / defer execution | Record disabled → shadow → read-only pilot rollout, required owner values, strict freshness/authorization gates, fallback, and abort rules; keep migration and deployment unauthorized. | [Read-model activation packet](./phase-8-cross-definition-read-model-activation-packet.md), `pnpm check:read-model-activation` |
| 2026-07-15 | The activation packet requires proof that an interrupted rebuild cannot expose partial rows and that retry publishes one complete generation. | adopt private rebuild conformance / defer runtime | Add a staged private rebuild session with failed-generation blocking and atomic `ready` publication; keep the public seam, durable migration, and runtime activation deferred. | `packages/dpm/test/authoring-read-model-contract.test.ts`, `pnpm check:read-model-contract` |
| 2026-07-15 | The staged rebuild conformance candidate passed the full private Owner CI and T1 preflight. | adopt evidence refresh | Point current readiness and owner-acceptance references to Owner CI `29417713569` and T1 preflight `29417916349`; leave Issue #2 approval rows unchecked. | `29417713569`, `29417916349`, [Issue #2](https://github.com/mineclover/data-governance/issues/2) |
| 2026-07-15 | Shadow activation requires proof that the existing definition-scoped lookup and the disabled read-model agree on bounded identity, freshness, ordering, API context, and failure mapping. | adopt private shadow parity / defer consumer activation | Add a private comparison harness and conformance tests; keep read-model consumers disabled and retain the definition-scoped fallback. | `packages/dpm/src/authoring/read-model-shadow.ts`, `packages/dpm/test/authoring-read-model-contract.test.ts`, `pnpm check:read-model-contract` |
| 2026-07-15 | The private shadow parity candidate passed the full Owner CI and T1 preflight without enabling a consumer route. | adopt evidence refresh | Point current readiness and owner-acceptance references to Owner CI `29418892057` and T1 preflight `29424725868`; leave Issue #2 approval rows unchecked. | `29418892057`, `29424725868`, [Issue #2](https://github.com/mineclover/data-governance/issues/2) |
| 2026-07-15 | Authorization isolation is an activation gate, and an injected identity provider is not yet approved. | adopt private scope conformance / defer provider integration | Add a scope-intersection helper and tests for out-of-scope identity isolation, empty/widened scope denial, and default deny; keep OIDC/RBAC integration deferred. | `packages/dpm/src/authoring/read-model-authorization.ts`, `packages/dpm/test/authoring-read-model-contract.test.ts`, `pnpm check:read-model-contract` |
| 2026-07-15 | The private authorization isolation candidate passed the full Owner CI and T1 preflight without external identity-provider integration. | adopt evidence refresh | Point current readiness and owner-acceptance references to Owner CI `29425668619` and T1 preflight `29425918651`; leave Issue #2 approval rows unchecked. | `29425668619`, `29425918651`, [Issue #2](https://github.com/mineclover/data-governance/issues/2) |
| 2026-07-16 | The acceptance checklist retained one obsolete Owner CI link after SHA-based manual evidence tracking was removed. | adopt evidence hygiene | Replace the stale rollback-evidence link with the current successful Owner CI and verify documentation/roadmap/T1 guards; keep all release and activation gates unchanged. | `goal-68-extraction-acceptance-checklist.md`, `pnpm check:docs`, `pnpm check:roadmap`, `pnpm check:t1-readiness` |
| 2026-07-16 | The historical `oa-sdk` mirror still contained commit-SHA owner evidence after the canonical owner documents moved to ref-based verification. | adopt mirror hygiene | Align the mirror's Goal 68/T1 wording with release-gate and workflow evidence, without changing package, release, database, or adapter state. | `mineclover/oa-sdk@9e4650a`, `pnpm check:docs`, `pnpm check:release-policy`, `pnpm check:api-index` |
| 2026-07-16 | The latest private candidate passed Owner CI and T1 preflight after the mirror evidence cleanup. | adopt current evidence refresh | Point current readiness and owner-acceptance documents to Owner CI `29427810791` and T1 preflight `29429853413`; keep all six Issue #2 approval rows unchecked and retain every public-release boundary. | `29427810791`, `29429853413`, [Issue #2](https://github.com/mineclover/data-governance/issues/2) |
| 2026-07-16 | The historical `oa-sdk` mirror's current Owner CI links lagged the canonical private owner evidence. | adopt mirror evidence sync | Point the five Goal 68 mirror documents to the canonical Owner CI reference, preserve the historical/compatibility-only boundary, and verify the mirror's docs, release-policy, API-index, and full CI gates. | `mineclover/oa-sdk`, [CI `29430839011`](https://github.com/mineclover/oa-sdk/actions/runs/29430839011), `pnpm check:docs`, `pnpm check:release-policy`, `pnpm check:api-index` |
| 2026-07-16 | The approved `@mineclover/dpm` identity could not be published by the authenticated npm owner because the `mineclover` scope was unavailable. | adopt scope correction | Use the owner-controlled `@context-action` scope, keep the immutable private `v0.1.0` release, and execute the corrected `@context-action/dpm@0.1.1` release with a fresh gate. | `npm access list packages @context-action`, `npm view @context-action/dpm`, [Issue #2](https://github.com/mineclover/data-governance/issues/2) |

## Formal approvals

- [T1 release approval — Issue #2](https://github.com/mineclover/data-governance/issues/2) records
  the approved `@context-action/dpm@0.1.1` identity, license, registry, and release sequence.
- [Phase 8 private activation decision record](./phase-8-decision-record.md) authorizes only the
  representative private slice and does not authorize T1/public-release actions.
