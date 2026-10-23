# Package Architecture

Product scope and reactivation rules are owned by [../platform-scope.md](../platform-scope.md).
This document describes the physical package layout and dependency boundaries in
`data-governance`.

## Layout

```text
data-governance/
  packages/
    dpm/                           @oa-sdk/dpm (published)
    openapi-projection-contract/   @oa-sdk/openapi-projection-contract (private workspace companion)
  docs/
    concepts/                      DPM concept baseline
    internal/
      architecture/                package and dependency boundaries
      goals/                       owner decisions, contracts, roadmap, progress
  scripts/                         documentation, roadmap, T1, boundary, read-model, operational gates
  .github/                         CI, release gate, publish workflow, owner issue forms
```

There are no application or reference workspaces in this repository. The historical monorepo
remains in `mineclover/oa-sdk` and is not mirrored here.

## Package Roles

| Package | Role | Registry |
| --- | --- | --- |
| `@oa-sdk/dpm` | DPM contract implementation, CLI, storage/authoring contracts, and consumer surfaces | Published (`0.1.2`, Apache-2.0) |
| `@oa-sdk/openapi-projection-contract` | Shared OpenAPI projection types and validation retained for compatibility checks | Private workspace package |

`@oa-sdk/dpm` exposes these public subpaths:

```text
@oa-sdk/dpm
@oa-sdk/dpm/package
@oa-sdk/dpm/catalog
@oa-sdk/dpm/data
@oa-sdk/dpm/profile
@oa-sdk/dpm/relationship
@oa-sdk/dpm/gateway
@oa-sdk/dpm/storage
@oa-sdk/dpm/publishing
@oa-sdk/dpm/authoring
```

The `oa-dpm` binary is published from `dist/cli/index.js`. Implementation paths (`src/**`,
`dist/chunk-*`) are not compatibility surfaces.

## Dependency Boundary

```text
@oa-sdk/openapi-projection-contract   (no runtime dependencies)
        │
        └── retained as a workspace compatibility/reference contract

@oa-sdk/dpm
├── ajv
├── yaml
└── internal src/contract/openapi-projection.ts
```

`@oa-sdk/dpm` does not currently import `@oa-sdk/openapi-projection-contract` at runtime; it keeps
its own projection contract types under `src/contract/`. The workspace companion is built and
tested by the root commands so the shared contract vocabulary stays reviewable.

The boundary check rejects imports that reach back into monorepo source:

```bash
pnpm check:boundary
```

No parser, codegen, router, client, mock-server, spec-lens, or application source may be imported
from this repository.

## Module Map — `@oa-sdk/dpm`

| Path | Responsibility |
| --- | --- |
| `src/model/` | Logical entity, canonical key, and relationship namespace model |
| `src/schema/` | Manifest JSON Schema, schema identity, and syntax contract |
| `src/catalog/` | Catalog snapshot model, PostgreSQL profiler, OpenAPI projection adapters, freshness |
| `src/discovery/` | Non-executable relationship candidate evidence and reports |
| `src/registry/` | Approved/proposed/rejected/deprecated/superseded relationship lifecycle |
| `src/validator/` | REL/SAF semantic diagnostics without source database access |
| `src/compiler/` | Validated manifest, catalog, and registry to compiled plan |
| `src/dry-run/` | Impact reports that never include raw sensitive values |
| `src/gateway/` | OpenAPI contract document and in-process runtime helpers |
| `src/storage/` | Job, report, registry, and profile-baseline repository contracts |
| `src/publishing/` | AI schema context and physical foreign-key recommendations |
| `src/authoring/` | Phase 8 scoped lookup, draft/revision, diff, approval, publish, audit, rollback |
| `src/bridge/` | TypeSpec logical-ERD field bridge |
| `src/profile/` | Profile artifacts, Kafka topic profiling, connector validation |
| `src/cli/` | `oa-dpm` command surface |
| `src/contract/` | Internal DPM contract types, including the projection boundary |
| `src/public/` | Stable category entrypoints for the published subpaths |

## Release Boundary

- `packages/dpm` is publishable and carries the Apache-2.0 license.
- The root workspace package is private and is never published.
- Publication uses `publish.yml` with the repository `NPM_TOKEN` secret; OIDC trusted publishing
  remains a future hardening step.
- The release gate verifies the owner approval issue, package identity, license, and rollback
  evidence before accepting a `v*` tag.
- `mineclover/oa-sdk/packages/dpm` is a non-publishing source/compatibility mirror.
