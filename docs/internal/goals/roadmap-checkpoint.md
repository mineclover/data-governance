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
- Implement the activated [Phase 8 control-plane slice](./phase-8-decision-record.md) in focused
  private-owner work units.
- Use the [full phase execution forecast](./full-phase-execution-forecast.md) for work-unit and
  gate-based planning instead of calendar promises.

## Completed

- Private `mineclover/data-governance` owner and canonical document set established.
- Owner CI, documentation, boundary, test, consumer-smoke, and T1 preflight gates pass.
- Phase 8 activation, persistence, authorization, public-seam, audit, and compatibility decisions
  recorded for the private representative slice.
- Routine roadmap feedback moved to this checkpoint and commit history.

## Next

- Review the recommended T1 decision packet in [Issue #2](https://github.com/mineclover/data-governance/issues/2)
  only when an owner decision is needed.
- Implement and verify the first Phase 8 work unit: lookup/read model plus immutable revision
  repository boundary.
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

## Formal approvals

- [T1 release approval — Issue #2](https://github.com/mineclover/data-governance/issues/2) is open and
  intentionally does not authorize publication.
- [Phase 8 private activation decision record](./phase-8-decision-record.md) authorizes only the
  representative private slice and does not authorize T1/public-release actions.
