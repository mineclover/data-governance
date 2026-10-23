# `data-governance`

Canonical owner repository for the **Data Pseudonymization Manifest (DPM)** contract plane.

## Purpose

This repository exists to own and evolve the DPM contract that was extracted from
[`mineclover/oa-sdk`](https://github.com/mineclover/oa-sdk). It keeps the logical data definition,
API/catalog binding, neutral artifact, and migration/rollback rules reviewable and deterministic
without owning the runtime that would move or rewrite production data.

In practical terms, the repository answers three questions:

1. **What does a logical data field mean, and where is it bound?** — `data_definitions` identity,
   explicit API/catalog bindings, and semantic validation.
2. **What artifact does a compiler or consumer receive?** — the neutral
   `dpm.data-binding-artifact.v1` contract, compiled plans, provenance, and freshness identity.
3. **How can the contract change safely?** — compatibility windows, migration rules, rollback
   rehearsals, and owner-controlled release gates.

The canonical implementation is `@oa-sdk/dpm`. The historical `oa-sdk` copy remains a
non-publishing source/compatibility mirror; it is not the release authority for this repository.

## What this repository owns

- Logical data definitions and namespace-safe identity (`data_definitions` `1.0` is frozen;
  `1.1` is explicitly experimental).
- Explicit API/catalog/DB bindings and deterministic semantic validation.
- The neutral data-binding artifact (`kind: dpm.data-binding-artifact.v1`, `version: 1.0`).
- Compiler plans, freshness identity, provenance, and review/rollback evidence.
- The compatibility and migration contract for consumers of the existing `@oa-sdk/dpm` imports.
- The activated Phase 8 representative authoring slice: scoped lookup, import/export, explain,
  quick fix, and the cross-definition read-model contract.

## Out of scope

The following are intentionally **not** owned by this repository or its current decision record:

- production token vaults or tokenization workers;
- row rewriting or source/target data movement;
- source database mutation or physical foreign-key creation;
- production deployment, operations, or the Phase 10 data-plane runtime;
- control-plane capabilities beyond the activated Phase 8 slice;
- publishing a competing artifact from the historical `oa-sdk` mirror.

These require a separate runtime owner, security/deployment contract, and owner decision.

## Current status

| Item | Status |
| --- | --- |
| Repository | Public |
| Package | [`@oa-sdk/dpm@0.1.3`](https://www.npmjs.com/package/@oa-sdk/dpm) — OIDC-published 2026-10-24, current `latest` |
| License | Apache-2.0 |
| Canonical contract | `data_definitions` `1.0` frozen; `1.1` experimental |
| Release authority | `mineclover` repository owner |
| Phase 10 data-plane | Explicitly deferred |

Publication uses the `publish.yml` workflow with npm Trusted Publishing through GitHub Actions
OIDC (`id-token: write`). The npm package must trust this repository, workflow, and
`npm-release` environment as its configured publisher.

## Repository layout

| Path | Contents |
| --- | --- |
| `packages/dpm/` | `@oa-sdk/dpm` source, CLI, public subpaths, and extraction/consumer smokes |
| `packages/openapi-projection-contract/` | Shared projection contract retained as a workspace compatibility/reference package |
| `docs/internal/goals/` | Owner decisions, Goal 68 contracts, Phase 8 records, roadmap, and progress |
| `scripts/` | Boundary, documentation, roadmap, T1 readiness, and approval gates |
| `.github/` | CI, release gate, publish workflow, and owner acceptance forms |

## Governance and release

- The owner decision is recorded in
  [`docs/internal/goals/owner-decision-record.md`](./docs/internal/goals/owner-decision-record.md).
- The formal acceptance review is [Issue #1](https://github.com/mineclover/data-governance/issues/1);
  the T1 approval record is [Issue #2](https://github.com/mineclover/data-governance/issues/2),
  and the OIDC validation release is [Issue #3](https://github.com/mineclover/data-governance/issues/3).
- The `mineclover` repository owner is the release authority. Delegated maintainers may prepare a
  release but may not unilaterally approve contract/version changes or adapter cutover.
- Future releases and breaking removal follow the owner-approved `v*` release gate.
  Breaking removal additionally requires a major release, migration guide, deprecation notice, and
  passing rollback fixture.

The canonical document set is indexed in
[`docs/internal/goals/README.md`](./docs/internal/goals/README.md). Start with the
[DPM Master Roadmap](./docs/internal/goals/dpm-master-roadmap.md) and the
[Goal 68 boundary](./docs/internal/goals/goal-68-dpm-logical-data-definition-boundary.md).

## Verification

Run from the repository root:

```bash
corepack pnpm install
corepack pnpm build
corepack pnpm typecheck
corepack pnpm check:boundary
corepack pnpm check:docs
corepack pnpm check:roadmap
corepack pnpm test
corepack pnpm smoke:dpm
```

The DPM extraction smoke covers package-name runtime imports, public declarations, changed
freshness plan identity, stale rollout rejection, and rollback from preserved inputs. It remains
the release-candidate verification for every new version.

## History

The repository was created on 2026-07-15 for the Goal 68 extraction handoff. The package snapshot
and migration evidence were validated here before the `@oa-sdk/dpm@0.1.2` publication on
2026-07-28 and the OIDC validation release `@oa-sdk/dpm@0.1.3` on 2026-10-24. Completed monorepo
implementation history remains in `mineclover/oa-sdk`; this repository carries only the history
needed to review and evolve the DPM contract.
