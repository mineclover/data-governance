# Goal 68.4 — External Extraction Acceptance Checklist

**Status: private owner acceptance recorded 2026-07-15; public registry release remains disabled**

> Parent: [Goal 68 — DPM Logical Data Definition and Extraction Boundary](./goal-68-dpm-logical-data-definition-boundary.md)
>
> Contract: [Goal 68 Extraction Migration and Rollback Contract](./goal-68-dpm-extraction-migration.md)
>
> Decision: [DPM Private Owner Decision Record](./owner-decision-record.md)
>
> Review: [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1)

This is the owner handoff and acceptance record for the private extracted DPM contract plane. It
accepts private extraction maintenance and the compatibility transition policy. It does not approve
public registry publication or removal of the existing import surface.

## Evidence

| Evidence | Current proof |
|---|---|
| Packed runtime consumer | `packages/dpm/test/package-extraction-smoke.mjs` runs `external-consumer-fixture.mjs` against the packed artifact and a clean production dependency tree. |
| Packed declaration consumer | The same smoke runs `tsc --noEmit` against `external-consumer-type-fixture.ts` and the packed public `@oa-sdk/dpm/data` declarations. |
| Packed rollback consumer | `external-consumer-rollback-fixture.mjs` proves stale rollout rejection, changed-artifact plan identity, and restoration of the preserved plan identity through the packed package. |
| Public package boundary | `packages/dpm/package.json` declares the root and category subpaths; package-name imports do not use monorepo source or deep chunk paths. |
| Owner CI | [Workflow `29427810791`](https://github.com/mineclover/data-governance/actions/runs/29427810791) passed build, typecheck, boundary, documentation, tests, and DPM consumer smoke for the selected private source ref. |
| Contract rules | [Goal 68 Extraction Migration and Rollback Contract](./goal-68-dpm-extraction-migration.md) defines v1.0/v1.1, artifact markers, migration order, and rollback behavior. |

## Accepted owner gates

- [x] Canonical repository, owning namespace, release authority, and issue/review location are
      named: private `mineclover/data-governance`, `mineclover` repository owner, and [Issue #1](https://github.com/mineclover/data-governance/issues/1).
- [x] The neutral artifact marker `kind: dpm.data-binding-artifact.v1` and `version: 1.0` are
      accepted; unknown markers or versions are rejected.
- [x] `data_definitions` `1.0` is accepted as the frozen structural contract. `1.1` is explicitly
      deferred as experimental and has no compatibility promise.
- [x] The package/publication policy is accepted: `@oa-sdk/dpm` is the selected public package
      identity, while the repository remains private and npm publication stays owner-gated through
      the `v0.1.2` release gate and Trusted Publishing workflow.
- [x] The owner artifact is staged in the private repository and runtime, declaration, workflow,
      rollback, pack, and clean-dependency consumer smokes pass under owner CI.
- [x] Package continuity is defined: the canonical owner publishes the existing `@oa-sdk/dpm`
      package identity, so consumer imports remain unchanged. The `oa-sdk` repository is a
      historical mirror and must not publish a conflicting artifact.
- [x] This owner document set is canonical for the extraction contract; the `oa-sdk` documents are
      the historical non-publishing mirror.
- [x] The rollback fixture is accepted: changed freshness creates a new plan identity and rollback
      restores the preserved artifact and historical mirror reference.

## Sign-off record

| Decision | Recorded value |
|---|---|
| Canonical repository | `https://github.com/mineclover/data-governance` (private, `main`) |
| Owner / release authority | `mineclover` repository owner; delegated maintainer may prepare but not unilaterally approve contract/version changes |
| Issue / review location | [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1) and pull-request review |
| Package and registry | `@oa-sdk/dpm` on the npm public registry after the owner-approved `v0.1.2` gate; repository remains private |
| Accepted `data_definitions` versions | `1.0` frozen; `1.1` deferred experimental |
| Accepted artifact kind/version | `dpm.data-binding-artifact.v1` / `1.0` |
| Compatibility window | Existing `@oa-sdk/dpm` imports remain unchanged; no alternate adapter package is published |
| Canonical-document location | Owner repository `docs/internal/goals/`; `oa-sdk` remains the historical mirror |
| Rollback fixture / review link | [Owner CI `29427810791`](https://github.com/mineclover/data-governance/actions/runs/29427810791), [Issue #1](https://github.com/mineclover/data-governance/issues/1) |

## Public-release decision gate

The selected public-release target is `@oa-sdk/dpm`. It is not published until the owner approval,
OIDC Trusted Publisher configuration, and exact `v0.1.2` release gate are complete. `T1` is the first
SemVer tag or GitHub Release on `main` whose release-gate workflow passes and has explicit `mineclover`
owner approval.
A normal branch run or private rehearsal is not `T1`.

## Transition rule

The private owner acceptance is complete for Goal 68.4/DPM-90. The external owner is canonical for
the extraction contract, while the package remains under the selected `@oa-sdk` scope until the
first accepted owner artifact release. Public registry publication and breaking removal remain
separately gated and are not authorized by this record.
