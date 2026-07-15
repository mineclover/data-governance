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
- Provider-neutral authorization policy port prepared; external identity/RBAC integration remains
  deferred until an operational owner is selected.
- Routine roadmap feedback moved to this checkpoint and commit history.

## Next

- Review the recommended T1 decision packet in [Issue #2](https://github.com/mineclover/data-governance/issues/2)
  only when an owner decision is needed.
- Review the async service integration boundary and operational migration packet; keep production
  schema application, deployment, and public-release decisions deferred.
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

## Formal approvals

- [T1 release approval — Issue #2](https://github.com/mineclover/data-governance/issues/2) is open and
  intentionally does not authorize publication.
- [Phase 8 private activation decision record](./phase-8-decision-record.md) authorizes only the
  representative private slice and does not authorize T1/public-release actions.
