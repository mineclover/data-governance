# DPM Owner Plan

This plan is scoped to the private DPM owner repository. The historical implementation baseline
is preserved in [mineclover/oa-sdk](https://github.com/mineclover/oa-sdk); this repository is the
candidate canonical owner for the extracted contract plane.

## Current boundary

- `@oa-sdk/dpm` owns logical data definitions, explicit API/catalog bindings, neutral artifacts,
  provenance, and migration/rollback rules.
- `@oa-sdk/openapi-projection-contract` is retained as the DPM dependency contract.
- The repository remains private; `@oa-sdk/dpm` is approved for public npm publication after the
  exact `v0.1.2` release gate and Trusted Publishing configuration.
- `data_definitions` `1.0` is the frozen structural compatibility contract.
- `data_definitions` `1.1` is experimental until formal wire-compatibility acceptance.
- The monorepo package remains the source/compatibility implementation until
  `@oa-sdk/dpm@0.1.2` is published. It then becomes a forwarding adapter for one
  subsequent compatibility release.

## Work sequence

1. Keep the logical identity, semantic binding, neutral artifact, and provenance contracts
   deterministic and independently testable.
2. Run the external package-name, declaration, workflow, rollback, and pack consumer smokes.
3. Keep owner CI green on Node.js 25 and pnpm 10.30.3 for `main` and pull requests.
4. Keep the accepted private owner policy and evidence in [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1).
5. At the first accepted owner artifact release, switch the monorepo package to a forwarding
   compatibility adapter and carry the deprecation notice through the next compatibility release.

## Canonical documents

The document set is indexed in
[docs/internal/goals/README.md](./goals/README.md), with the governing status in
[Goal 68](./goals/goal-68-dpm-logical-data-definition-boundary.md) and the accepted decisions in
[owner-decision-record.md](./goals/owner-decision-record.md).

## Verification

The authoritative local commands are:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm typecheck
corepack pnpm check:boundary
corepack pnpm check:docs
corepack pnpm test
corepack pnpm smoke:dpm
```

The same gates run in
[.github/workflows/ci.yml](../../.github/workflows/ci.yml).

## Explicitly deferred decisions

- breaking removal of the `@oa-sdk/dpm` import surface;
- broad search, automatic mutation/bulk authoring beyond the activated Phase 8 representative slice,
  and production data-plane runtime.
- runtime activation of the cross-definition read model, durable index migration, and external
  authorization; the entry contract is prepared separately in the Phase 8 contract record.

## Recommended public-release policy

Keep the repository and package private until an owner-approved SemVer tag or GitHub Release exists
on `main` with successful CI for the exact release commit. That release is `T1`. A normal commit,
branch build, or private rehearsal is not `T1`. Before `T1`, do not add public package metadata,
license, or registry publication. After `T1`, keep the old import surface through one compatibility
release, add a deprecation notice, and require a separate approved major release before removal.
