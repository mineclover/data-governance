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
| Owner CI | [Workflow `29417713569`](https://github.com/mineclover/data-governance/actions/runs/29417713569) passed build, typecheck, boundary, documentation, tests, and DPM consumer smoke for the selected private source ref. |
| Contract rules | [Goal 68 Extraction Migration and Rollback Contract](./goal-68-dpm-extraction-migration.md) defines v1.0/v1.1, artifact markers, migration order, and rollback behavior. |

## Accepted owner gates

- [x] Canonical repository, owning namespace, release authority, and issue/review location are
      named: private `mineclover/data-governance`, `mineclover` repository owner, and [Issue #1](https://github.com/mineclover/data-governance/issues/1).
- [x] The neutral artifact marker `kind: dpm.data-binding-artifact.v1` and `version: 1.0` are
      accepted; unknown markers or versions are rejected.
- [x] `data_definitions` `1.0` is accepted as the frozen structural contract. `1.1` is explicitly
      deferred as experimental and has no compatibility promise.
- [x] The private package/publication policy is accepted: `@oa-sdk/dpm` remains private and is not
      published to a public registry. Public package name/scope, license, and public release
      metadata are intentionally deferred.
- [x] The owner artifact is staged in the private repository and runtime, declaration, workflow,
      rollback, pack, and clean-dependency consumer smokes pass under owner CI.
- [x] The compatibility window is defined: existing imports remain supported through the first
      accepted external owner artifact release and one subsequent compatibility release. The
      monorepo becomes a forwarding adapter at the first accepted owner release, and the final
      compatibility release carries a deprecation notice.
- [x] This owner document set is canonical for the extraction contract; the `oa-sdk` documents are
      the historical/compatibility mirror until adapter transition.
- [x] The rollback fixture is accepted: changed freshness creates a new plan identity and rollback
      restores the preserved artifact/adapter identity.

## Sign-off record

| Decision | Recorded value |
|---|---|
| Canonical repository | `https://github.com/mineclover/data-governance` (private, `main`) |
| Owner / release authority | `mineclover` repository owner; delegated maintainer may prepare but not unilaterally approve contract/version changes |
| Issue / review location | [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1) and pull-request review |
| Package and registry | Private `@oa-sdk/dpm`; no public registry; future default target `@mineclover/dpm`; public license and metadata deferred |
| Accepted `data_definitions` versions | `1.0` frozen; `1.1` deferred experimental |
| Accepted artifact kind/version | `dpm.data-binding-artifact.v1` / `1.0` |
| Compatibility window | Through the first accepted owner release plus one subsequent compatibility release; deprecation notice in the final compatibility release |
| Canonical-document location | Owner repository `docs/internal/goals/`; `oa-sdk` remains the historical/compatibility mirror |
| Rollback fixture / review link | [Owner CI `29391356852`](https://github.com/mineclover/data-governance/actions/runs/29391356852), [Issue #1](https://github.com/mineclover/data-governance/issues/1) |

## Public-release decision gate

The recommended public-release target is `@mineclover/dpm`, while `@oa-sdk/dpm` remains the
compatibility adapter. This target is not published or considered selected until a separate owner
approval records the registry, license, and release policy. `T1` is the first SemVer tag or GitHub
Release on `main` whose release-gate workflow passes and has explicit `mineclover` owner approval.
A normal branch run or private rehearsal is not `T1`.

## Transition rule

The private owner acceptance is complete for Goal 68.4/DPM-90. The external owner is canonical for
the extraction contract, while `@oa-sdk/dpm` remains the source/compatibility implementation until
the first accepted owner artifact release. Public registry publication, public metadata, and
breaking removal remain separately gated and are not authorized by this record.
