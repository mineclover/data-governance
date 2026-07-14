# Goal 68.4 — External Extraction Acceptance Checklist

**Status: private owner repository and CI verified; formal external owner acceptance pending**

> Parent: [Goal 68 — DPM Logical Data Definition and Extraction Boundary](./goal-68-dpm-logical-data-definition-boundary.md)
>
> Contract: [Goal 68 Extraction Migration and Rollback Contract](./goal-68-dpm-extraction-migration.md)

This is an owner handoff artifact, not an external ownership decision. It records the evidence
already available in `oa-sdk` and the decisions an external `data-governance` owner must make
before the monorepo package can become a compatibility adapter or the public artifact can be
published.

## Local evidence already complete

| Evidence | Current proof |
|---|---|
| Packed runtime consumer | `packages/dpm/test/package-extraction-smoke.mjs` runs `external-consumer-fixture.mjs` against the packed artifact and a clean production dependency tree. |
| Packed declaration consumer | The same smoke runs `tsc --noEmit` against `external-consumer-type-fixture.ts` and the packed public `@oa-sdk/dpm/data` declarations. |
| Packed rollback consumer | `external-consumer-rollback-fixture.mjs` proves stale rollout rejection, changed-artifact plan identity, and restoration of the preserved plan identity through the packed public package. |
| Public package boundary | `packages/dpm/package.json` declares the root and category subpaths; package-name imports do not use monorepo source or deep chunk paths. |
| Root surface gate | `check:dpm-surface` includes `smoke:extraction` alongside subpath, workflow, and pack-boundary checks. |
| Compatibility and rollback rules | [Goal 68 Extraction Migration and Rollback Contract](./goal-68-dpm-extraction-migration.md) defines v1.0/v1.1, artifact markers, migration order, and rollback behavior. |

The local evidence proves extraction readiness for review. It does not prove registry publication,
external repository ownership, or acceptance of the experimental v1.1 wire shape.

## Current repository audit

The private owner repository is now `https://github.com/mineclover/data-governance`. The
repository was created on 2026-07-15, and owner workflow
[29350009558](https://github.com/mineclover/data-governance/actions/runs/29350009558) passed for
commit `34dff0f`. Formal owner acceptance, release authority, public package metadata,
compatibility window, and canonical sign-off remain pending.

## External owner acceptance gates

The owner should check each item in the target `data-governance` environment and attach the
corresponding decision or release evidence.

- [ ] Name the canonical repository, owning team, release authority, and issue/review location.
- [ ] Accept the neutral artifact marker `kind: dpm.data-binding-artifact.v1` and `version: 1.0`,
      or record a new marker and migration adapter before publication.
- [ ] Accept `data_definitions` `1.0` as the frozen structural contract and explicitly accept,
      revise, or defer the experimental `1.1` identity contract.
- [ ] Select the public package name, registry scope, license, repository metadata, and release
      policy; these remain intentionally unset while `@oa-sdk/dpm` is private.
- [ ] Rebuild and publish or stage the owner artifact, then run runtime and declaration consumer
      smokes against that artifact and its own production dependency tree.
- [ ] Define the compatibility window for existing `@oa-sdk/dpm` imports and the point at which
      the monorepo package becomes an adapter or is deprecated.
- [ ] Move or canonically link this roadmap, Goal 68, and the migration contract in the owner
      environment without changing accepted identity, freshness, or provenance semantics.
- [ ] Run the rollback fixture: restore the previous adapter/artifact, recompile from preserved
      inputs, and prove changed freshness produces a new plan identity.

## Required sign-off record

Complete this section in the owner environment; an empty record is intentional in this repository.

| Decision | Recorded value |
|---|---|
| Canonical repository | `https://github.com/mineclover/data-governance` (private; created 2026-07-15) |
| Owner / release authority | `mineclover`; release authority confirmation pending |
| Public package and registry | pending |
| Accepted `data_definitions` versions | pending |
| Accepted artifact kind/version | pending |
| Compatibility window and deprecation release | pending |
| Canonical-document location | [Owner decision record](./owner-decision-record.md); formal canonical link pending |
| Rollback fixture / review link | External rehearsal passed in `7f1fb3f`; formal review/sign-off pending |

## Transition rule

Until all owner gates are checked and the sign-off record is committed in the external
environment, keep `@oa-sdk/dpm` private, keep Goal 68 active, and do not add publication metadata
or claim that local extraction is production release readiness.
