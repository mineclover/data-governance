# DPM Owner Plan

This plan is scoped to the private DPM owner repository. The historical implementation baseline
is preserved in [mineclover/oa-sdk](https://github.com/mineclover/oa-sdk); this repository is the
candidate canonical owner for the extracted contract plane.

## Current boundary

- `@oa-sdk/dpm` owns logical data definitions, explicit API/catalog bindings, neutral artifacts,
  provenance, and migration/rollback rules.
- `@oa-sdk/openapi-projection-contract` is retained as the DPM dependency contract.
- The repository and package remain private; no public registry publication is approved.
- `data_definitions` `1.0` is the frozen structural compatibility contract.
- `data_definitions` `1.1` is experimental until formal wire-compatibility acceptance.
- The monorepo package remains the source/compatibility implementation until the first accepted
  external owner artifact release. It then becomes a forwarding adapter for one subsequent
  compatibility release; public registry publication remains disabled.

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

- public package name, registry scope, license, and public release metadata;
- breaking removal of the `@oa-sdk/dpm` import surface;
- search, draft/edit/publish, authoring convenience, and production data-plane runtime.
