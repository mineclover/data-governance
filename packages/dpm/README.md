# @oa-sdk/dpm

Relationship-first Data Pseudonymization Manifest toolkit for turning database and profile evidence into reviewable, executable pseudonymization contracts.

## Consumer Surface

Prefer package subpaths for new consumers. The root `@oa-sdk/dpm` entrypoint remains a compatibility aggregate, but focused imports keep product code tied to the smallest stable surface.

| Import | Use for | Source owner |
|---|---|---|
| `@oa-sdk/dpm/package` | package metadata and manifest schema validation | `src/public/package.ts` |
| `@oa-sdk/dpm/catalog` | catalog snapshots, PostgreSQL catalog profiling, OpenAPI projection adapters | `src/public/catalog.ts` |
| `@oa-sdk/dpm/data` | logical data fields and explicit API/database object bindings | `src/public/data.ts` |
| `@oa-sdk/dpm/profile` | profile artifacts, Kafka topic profiling, connector validation, profile analysis | `src/public/profile.ts` |
| `@oa-sdk/dpm/relationship` | relationship discovery, registry snapshots, model helpers, validation/compile/dry-run | `src/public/relationship.ts` |
| `@oa-sdk/dpm/gateway` | OpenAPI contract document and in-process runtime helpers | `src/public/gateway.ts` |
| `@oa-sdk/dpm/storage` | job, report, registry, and profile baseline repositories/adapters | `src/public/storage.ts` |
| `@oa-sdk/dpm/publishing` | AI schema context and physical foreign-key recommendation projections | `src/public/publishing.ts` |

`package.json` publishes the same subpaths and `src/index.ts` re-exports the category barrels for compatibility.

## Practical Loops

### Manifest execution

Use `@oa-sdk/dpm/catalog` to build or load catalog evidence, then use `@oa-sdk/dpm/relationship` to validate, compile, and dry-run a manifest against an approved registry snapshot.

The manifest schema version is exposed through `DPM_VERSION`. It is the DPM contract baseline, not the npm package version in `package.json`.

Use `@oa-sdk/dpm/data` for the logical data definition layer. A DPM field identity is
separate from its optional database `storageRef` and from an API artifact pointer; API
bindings make that relationship explicit without making an OpenAPI operation or database
column the data definition itself. The compiler emits the immutable
`DpmNeutralDataBindingArtifact` with binding freshness and source/provenance links so
code-generation and review consumers can read the contract without importing DPM policy
internals.

The frozen `data_definitions` `1.0` shape is retained for structural consumers. The
experimental `1.1` model helpers (`createDpmIdentityDataDefinitions()` and related identity
renderers) require dataset/namespace scope, explicit object and revision ids, origin/lifecycle
metadata, catalog freshness context, and versioned API pointers. `operationId` remains navigation
metadata and is excluded from canonical API identity.

### Kafka profile review

Use `@oa-sdk/dpm/profile` to convert a captured Kafka topic bundle into a profile connector result. The Kafka connector validates malformed input before graph creation, returns failed connector results as diagnostics, and keeps failed envelopes compatible with the generic connector validator.

Profile analysis produces review proposals. It does not auto-approve relationships. Use `@oa-sdk/dpm/gateway` for the product workflow that bridges a reviewer-selected profile hint into candidate import, approval, registry write receipt, and registry snapshot export.

### Persistence and publishing

Use `@oa-sdk/dpm/storage` when product code needs registry rows, approval audit events, job/report rows, or profile baseline history. Use `@oa-sdk/dpm/publishing` to project compiled relationship metadata into AI-readable context without exposing source database credentials, token vault material, raw payload samples, or reverse token lookup APIs.

## Operating Strategy

Treat the package smokes and demos as representative product flow gates. When stabilizing DPM behavior, prefer extending an existing flow gate over adding one test per internal readback.

Add separate focused tests when the change affects a public API/export contract, privacy or safety boundary, storage adapter divergence, real regression, or schema/taxonomy contract. Otherwise, leave naturally covered approval, audit, conflict, and snapshot readbacks inside the representative workflow that already owns the product path.

The internal decision rule is tracked in [Goal 63](../../docs/internal/goals/goal-63-dpm-product-flow-operating-strategy.md).

## Safety Boundaries

- Connectors produce evidence; approved registry snapshots remain the execution source of truth.
- Approved registry snapshots require complete approval metadata before a relationship can become executable.
- PostgreSQL catalog profiling is read-only catalog evidence collection.
- Kafka profile fixtures contain captured shape and metrics, not message payload samples.
- Physical foreign-key output is recommendation-only and does not mutate a target database.
- Split registry storage adapters are convenient for tests and simple integrations. Production approval flows should prefer an atomic commit adapter or database constraints that reject concurrent approved-version conflicts. The PostgreSQL adapter maps approved unique-index conflicts to `DpmRegistryApprovedRelationshipConflictError` so product flows can return deterministic blocking diagnostics.

## Verification

Package surface regressions are covered by:

```bash
pnpm --filter @oa-sdk/dpm run smoke:subpaths
pnpm --filter @oa-sdk/dpm run smoke:extraction
pnpm --filter @oa-sdk/dpm run smoke:consumer-workflow
pnpm --filter @oa-sdk/dpm run smoke:pack
```

`smoke:extraction` packages the built artifact with a clean production dependency tree and runs
runtime, declaration, and rollback consumers through the public package boundary. It is a local
extraction rehearsal; it does not claim registry publication or external owner acceptance.

`smoke:consumer-workflow` imports the built `@oa-sdk/dpm/profile`, `@oa-sdk/dpm/gateway`, and
`@oa-sdk/dpm/storage` subpaths and runs a captured Kafka profile-to-registry approval flow plus
approval audit timeline readback and the deterministic `PROF204` blocking path for an approved
relationship conflict.

Product-oriented profile review is exercised by:

```bash
pnpm demo:dpm:profile
```
