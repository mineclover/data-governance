# DPM Roadmap Checkpoint

**Status: active private-owner maintenance; T1 public release deferred**
**Updated: 2026-07-15**

The [DPM Master Roadmap](./dpm-master-roadmap.md) remains the canonical scope and phase plan.
This checkpoint is the lightweight operational loop for routine progress and feedback; a GitHub
Issue is not required for ordinary roadmap updates.

## Current focus

- Maintain the accepted DPM contract and private owner boundary.
- Use the private T1 preflight workflow for candidate verification.
- Keep public publication, license selection, and adapter cutover behind the formal T1 approval.
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
- Disposable local PostgreSQL rehearsal completed with schema, canonical identity index, fixture
  load, and backup/restore parity; no owner-managed database was contacted.
- Provider-neutral authorization policy port prepared; external identity/RBAC integration remains
  deferred until an operational owner is selected.
- Scoped Phase 8 lookup extension implemented for entity/locator/name/type/origin/lifecycle filters,
  with sync/async consumer coverage and canonical API/DB reverse binding context.
- Canonical `data_definitions` `1.1` import/export helpers implemented with derived-identity stripping,
  deterministic ordering, invalid-input handling, and round-trip tests.
- Identity-only authoring explain helper implemented with deterministic logical/API/DB readback,
  deep immutability, and no sample-value or secret output.
- Semantic-diff quick-fix helper implemented with approval-required breaking-change review,
  alias-preserved rename/deprecation suggestions, deep immutability, and no raw change payloads.
- Routine roadmap feedback moved to this checkpoint and commit history.

## Next

- Review the recommended T1 decision packet in [Issue #2](https://github.com/mineclover/data-governance/issues/2)
  only when an owner decision is needed; the prepared values are in the [T1 candidate decision packet](./t1-candidate-decision-packet.md).
- Review the async service integration boundary and operational migration packet; keep production
  schema application, deployment, and public-release decisions deferred.
- Keep scoped lookup, canonical import/export, explain, and quick-fix consumer evidence green; defer
  unsupported metadata filters, automatic mutation, bulk edit, cross-definition search, and broader
  authoring infrastructure.
- Continue contract maintenance and evidence refreshes through normal commits.
- Re-run `pnpm check:roadmap` and the owner CI for each checkpoint change.

## Deferred

- Public registry publication and public package metadata.
- License and redistribution policy selection.
- `v*` release tag creation and `@oa-sdk/dpm` adapter cutover.
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
| 2026-07-15 | T1 package, registry, license, SemVer, and compatibility decisions can be prepared before public approval. | adopt recommendation / defer release action | Prepare `@mineclover/dpm`, npm, Apache-2.0, `v0.1.0`, and one-release adapter-window recommendations; keep all metadata, tag, publication, and cutover actions behind Issue #2. | [T1 candidate decision packet](./t1-candidate-decision-packet.md) |
| 2026-07-15 | Phase 8 needs a useful read-model increment without opening cross-product indexing or public-release scope. | adopt scoped extension / defer broad search | Add definition-scoped entity/locator/name/type/origin/lifecycle filters and preserve API/DB reverse binding context; defer unsupported metadata and durable indexing. | [Scoped lookup decision](./phase-8-scoped-lookup-decision.md) |
| 2026-07-15 | Import/export is useful for authoring review but does not need repository, DB, or public-release changes. | adopt pure canonical helpers / defer broader authoring | Add deterministic `data_definitions` `1.1` import/export with derived-identity stripping and round-trip validation; defer explain, bulk edit, and broad search. | [Authoring import/export decision](./phase-8-authoring-import-export-decision.md) |
| 2026-07-15 | A contract-only explanation view improves review without exposing data values or adding persistence. | adopt pure explain helper / defer broader authoring | Add deterministic, deeply frozen logical/API/DB identity readback; defer quick fixes, bulk edit, and broad search. | [Authoring explain decision](./phase-8-authoring-explain-decision.md) |
| 2026-07-15 | Semantic diff classification is useful to review consumers, but automatic mutation would exceed the private slice. | adopt pure quick-fix suggestions / defer mutation | Add deterministic approval-required breaking-change review plus alias-preserved rename/deprecation suggestions; keep automatic mutation, bulk edit, and broad search deferred. | `bbd335e`, [Authoring quick-fix decision](./phase-8-authoring-quick-fix-decision.md) |
| 2026-07-15 | The remaining Phase 8 extensions have different persistence, authorization, conflict, and rollback prerequisites. | adopt ordered deferral | Prioritize a future cross-definition read model, then automatic mutation, then bulk edit; keep all three deferred until their entry contracts and operational owners are approved. | [Next follow-on priority decision](./phase-8-next-follow-on-priority-decision.md) |

## Formal approvals

- [T1 release approval — Issue #2](https://github.com/mineclover/data-governance/issues/2) is open and
  intentionally does not authorize publication.
- [Phase 8 private activation decision record](./phase-8-decision-record.md) authorizes only the
  representative private slice and does not authorize T1/public-release actions.
