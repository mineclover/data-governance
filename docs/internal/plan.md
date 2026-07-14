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
- The monorepo package remains the source/compatibility implementation until a compatibility
  window and adapter cutover are formally recorded.

## Work sequence

1. Keep the logical identity, semantic binding, neutral artifact, and provenance contracts
   deterministic and independently testable.
2. Run the external package-name, declaration, workflow, rollback, and pack consumer smokes.
3. Keep owner CI green on Node.js 25 and pnpm 10.30.3 for `main` and pull requests.
4. Record formal release authority, issue/review location, compatibility window, package metadata,
   and canonical cutover decision.
5. Only after sign-off, decide whether the monorepo package becomes an adapter or remains a
   private compatibility mirror.

## Canonical documents

The document set is indexed in
[docs/internal/goals/README.md](./goals/README.md), with the governing status in
[Goal 68](./goals/goal-68-dpm-logical-data-definition-boundary.md) and the interim decisions in
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

## Open formal decisions

- formal release authority and final review/sign-off workflow (GitHub Issues is enabled as the current issue/review location);
- compatibility window and deprecation release;
- license, package metadata, registry scope, and future publication policy;
- rollback fixture review/sign-off reference;
- final canonical cutover from the monorepo compatibility implementation.
