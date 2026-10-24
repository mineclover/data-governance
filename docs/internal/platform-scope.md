# Platform Scope

This document is the scope SSOT for the `data-governance` repository. It defines what the
repository owns as a first-class product surface, what remains maintenance-only, and what requires
a separate owner decision. Being present in this workspace does not by itself make something an
active product scope.

Implementation status lives in [plan.md](./plan.md), package boundaries in
[`architecture/packages.md`](./architecture/packages.md), and the full document index in
[`goals/README.md`](./goals/README.md).

## Mission

`data-governance` owns the **Data Pseudonymization Manifest (DPM) contract plane**. The mission is
to keep logical data definitions, explicit API/catalog bindings, neutral artifacts, compiled
provenance, and migration/rollback rules reviewable and deterministic.

```text
DPM contract plane
├─ logical data definitions and namespace-safe identity
├─ explicit API / catalog / database bindings
├─ neutral data-binding artifact and compiled plan
├─ freshness, provenance, compatibility, and rollback evidence
└─ representative Phase 8 authoring contract
```

The repository does **not** own production data movement. Vaults, tokenization workers, row
rewriting, source database mutation, physical foreign-key creation, deployment, and the Phase 10
data-plane runtime are outside this scope.

## Scope Tiers

| Tier | Surface | Policy |
| --- | --- | --- |
| Canonical package | `@oa-sdk/dpm` | Owns the DPM contract plane; published as `0.1.3` |
| Workspace companion | `@oa-sdk/openapi-projection-contract` | Retained compatibility/reference contract built and checked with the workspace |
| Canonical documents | `docs/internal/goals/` | Owner decisions, contracts, roadmap, and progress |
| Owner gates | `scripts/`, `.github/` | Boundary, documentation, roadmap, T1, and release checks |
| Out of scope | vault, tokenization, row rewrite, DB mutation, Phase 10 runtime | Requires a separate runtime owner, security model, and deployment authority |

## Maintenance Policy

Allowed changes are limited to:

- security, privacy, and safety fixes;
- compatibility with supported runtimes, dependencies, and contract versions;
- migration, extraction, and rollback preparation;
- corrections that keep the contract, documentation, and release records accurate.

New domain capabilities, new operational workflows, and feature expansion are not maintenance.
They require a scope-reactivation decision before implementation.

## Scope Reactivation Decision

Before adding a feature outside the DPM contract plane, record a decision with at least:

1. the package/workspace and user problem being reactivated;
2. the direct relationship to the DPM mission, or why it must remain a separate product;
3. owner, maintenance cost, release/CI responsibility, and exit criteria;
4. whether it stays in this repository or moves to another extraction candidate.

Without that decision, a non-core feature request is not started and is not promoted to an active
goal. A request that adds a new capability is a feature even when it looks like a bug fix.

### Phase 8 authoring slice

The representative Phase 8 authoring slice is activated under
[`goals/phase-8-decision-record.md`](./goals/phase-8-decision-record.md). It covers scoped lookup,
import/export, explain, quick fix, draft/revision/publish, audit, and rollback. Broader
control-plane search, editing, and authoring workflows remain gated.

### Phase 10 data-plane

Phase 10 is a separate runtime program. The current decision authorizes only non-executing design
preparation; it does not authorize production vaults, tokenization workers, row rewriting, source
database mutation, physical foreign-key creation, data movement, or production operational
controls. The [Phase 10 runtime boundary decision](./goals/phase-10-runtime-boundary-decision.md)
records the required owners and gates. Runtime execution requires a later decision naming the
runtime owner, security model, deployment authority, data contract, and rollback plan.

## Ownership and Release

- The `mineclover` repository owner is the release authority.
- Delegated maintainers may prepare a release but may not unilaterally approve contract/version
  changes or adapter cutover.
- The owner acceptance review is [Issue #1](https://github.com/mineclover/data-governance/issues/1);
  the T1 publication approval record is [Issue #2](https://github.com/mineclover/data-governance/issues/2).
- `@oa-sdk/dpm@0.1.3` was published through OIDC on 2026-10-24. Future releases follow the owner-approved `v*`
  release gate.
- Breaking removal requires a separately approved major release with a migration guide,
  deprecation notice, and passing rollback fixture.

## Relationship to oa-sdk

`mineclover/data-governance` is canonical for the DPM contract plane. The historical
`mineclover/oa-sdk/packages/dpm` copy is a non-publishing source/compatibility mirror and must not
publish a competing artifact. Existing `@oa-sdk/dpm` consumer imports remain unchanged.

## Root Command Semantics

| Command | Scope |
| --- | --- |
| `pnpm build` | Build the projection contract and `@oa-sdk/dpm` |
| `pnpm test` | Run both package test suites |
| `pnpm typecheck` | Typecheck both packages |
| `pnpm smoke:dpm` | Subpath, declaration, extraction, consumer-workflow, and pack smokes |
| `pnpm check:docs` | Local documentation links |
| `pnpm check:roadmap` | Roadmap checkpoint and feedback rows |
| `pnpm check:t1-readiness` | Package identity, release gate, and publication wiring |
| `pnpm check:boundary` | Reject monorepo source imports in `packages/dpm` |
| `pnpm check:operational-change` | Operational migration decision evidence |
| `pnpm check:read-model-contract` | Cross-definition read-model contract state |
| `pnpm check:read-model-activation` | Read-model activation remains disabled |
| `pnpm check:read-model-shadow` | Private cross-definition shadow fixture |
| `pnpm verify` | Run the full verification sequence serially |

Release publication happens only from the owner-approved release gate. The root workspace package
is private and is not itself published.
