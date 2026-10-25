# DPM Owner Plan

This plan is scoped to the public DPM owner repository. The historical implementation baseline
is preserved in [mineclover/oa-sdk](https://github.com/mineclover/oa-sdk); this repository is the
canonical owner for the extracted contract plane.

## Current boundary

- `@oa-sdk/dpm` owns logical data definitions, explicit API/catalog bindings, neutral artifacts,
  provenance, and migration/rollback rules.
- `@oa-sdk/openapi-projection-contract` is retained as the workspace compatibility/reference contract; `@oa-sdk/dpm` keeps its own internal projection types.
- The repository is public. `@oa-sdk/dpm@0.1.2` was published on 2026-07-28 and
  `@oa-sdk/dpm@0.1.3` was published through npm Trusted Publishing on 2026-10-24. Future releases
  use the same `publish.yml` OIDC workflow and `npm-release` environment.
- `data_definitions` `1.0` is the frozen structural compatibility contract.
- `data_definitions` `1.1` is experimental until formal wire-compatibility acceptance.
- `@oa-sdk/dpm@0.1.3` is published. The monorepo package is the non-publishing
  compatibility/source mirror and becomes a forwarding adapter for one subsequent compatibility
  release.
- The later management CLI remains file-based and read-only. Private read-model validation and
  rebuild-session safety maintenance do not activate a durable index, consumer service, or CLI
  approval/publish/apply/rollback execution; these changes have not been republished.
- Resume from the [CLI/read-model handoff](./goals/dpm-cli-checkpoint-2026-10-24.md), updated
  2026-10-25 (DPM 441 tests; private read-model 81 and SQL structural 19 included).
- Always-on/shared search is [deferred TODO](./goals/shared-search-todo.md), not the current work
  sequence. The CLI and default verification need no database or Docker. Existing SQL and the
  completed disposable rehearsal are preserved reference evidence, not a mandatory DB direction.

## Work sequence

1. Keep the logical identity, semantic binding, neutral artifact, and provenance contracts
   deterministic and independently testable.
2. Run the external package-name, declaration, workflow, rollback, and pack consumer smokes.
3. Keep owner CI green on its configured Node.js 22.x/24.x matrix and pnpm 11.28.6 for `main` and pull requests.
4. Keep the accepted owner policy and evidence in [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1).
5. After the `0.1.2` publication, switch the monorepo package to a forwarding compatibility
   adapter and carry the deprecation notice through the next compatibility release.
   This is a separately governed mirror transition, not authorization to modify the historical
   repository during read-only CLI maintenance.
6. Maintain the current no-write CLI and offline conformance. Do not resume shared-search
   privileges, drivers/adapters, infrastructure or further DB rehearsals unless its TODO is
   explicitly reopened after product-need review. Storage selection and all execution/pilot
   approvals would then be separate decisions; mutation/bulk authoring remain independently gated.

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
For the complete serial local gate, including authoring boundary checks, use `CI=true pnpm verify`.
Do not run competing package builds/smokes against the same `dist` directories in parallel.

## Explicitly deferred decisions

- breaking removal of the `@oa-sdk/dpm` import surface;
- broad search, automatic mutation/bulk authoring beyond the activated Phase 8 representative slice,
  and production data-plane runtime.
- runtime activation of the cross-definition read model, durable index migration, and external
  authorization; the entry contract is prepared separately in the Phase 8 contract record.

## Recommended public-release policy

The `T1` gate was satisfied for `@oa-sdk/dpm@0.1.2`: the exact tag is on `main` with successful CI,
and the package is published. Future releases repeat that sequence: an owner-approved SemVer tag or
GitHub Release on `main` with successful CI for the exact release commit. Keep the old import surface
through one compatibility release, add a deprecation notice, and require a separate approved major
release before removal.
