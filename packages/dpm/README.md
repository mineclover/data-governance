# @oa-sdk/dpm

Relationship-first Data Pseudonymization Manifest toolkit for turning database and profile evidence into reviewable, executable pseudonymization contracts.

**DPM is not the logical ERD.** The TypeSpec logical ERD owns entity, key, and
relationship meaning first. DPM consumes an explicit subset only when a
pseudonymization policy needs field/API/catalog bindings or relationship-aware execution.
An ERD relationship never becomes a DPM relationship merely because it exists.

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
| `@oa-sdk/dpm/authoring` | Private Phase 8 lookup, draft/revision, semantic diff, approval, publish, audit, and rollback slice | `src/public/authoring.ts` |

`package.json` publishes the same subpaths and `src/index.ts` re-exports the category barrels for compatibility.

## Practical Loops

### Manifest execution

Use `@oa-sdk/dpm/catalog` to build or load catalog evidence, then use `@oa-sdk/dpm/relationship` to validate, compile, and dry-run a manifest against an approved registry snapshot.

The manifest schema version is exposed through `DPM_VERSION`. It is the DPM contract baseline, not the npm package version in `package.json`.

Use `@oa-sdk/dpm/data` for the logical data definition layer. Its private TypeSpec logical-ERD
bridge accepts only explicit DPM field coverage and can compare supplied storage bindings with a
read-only catalog snapshot; it never infers DPM identity from a TypeSpec name or writes a DPM
revision. A DPM field identity is
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

The private Phase 8 representative slice uses `@oa-sdk/dpm/authoring`. It requires an explicit
actor role for editing, review, publishing, and rollback; its first repository implementation is
in-memory behind a repository port. Published revisions and audit events are immutable at the
package boundary. PostgreSQL is the prepared durable target contract, but schema migration and
deployment remain deferred. The identity index covers canonical object, API, and DB keys; it is not
a generic cross-product search service. `createDpmAsyncAuthoringService()` can target the async
PostgreSQL contract, but production cutover requires the operational migration packet and owner
approval.

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

### Management CLI

The `oa-dpm` binary is intentionally file-based and read-only with respect to external systems:

```bash
oa-dpm help
oa-dpm version
oa-dpm validate --manifest manifest.json --catalog catalog.json --registry registry.yaml
oa-dpm validate --manifest manifest.json --catalog catalog.json --registry registry.yaml --format text
oa-dpm compile --manifest manifest.json --catalog catalog.json --registry registry.yaml
oa-dpm dry-run --manifest manifest.json --catalog catalog.json --registry registry.yaml --estimated-rows rows.json
oa-dpm registry summary --registry registry.yaml
oa-dpm registry list --registry registry.yaml --status approved --format text
oa-dpm profile inspect --profile profile.json
oa-dpm profile analyze --profile profile.json --format text
oa-dpm authoring inspect --revision published-revision.json --format text
oa-dpm authoring inspect --draft draft.json
oa-dpm authoring search --revision published-revision.json --revision another-revision.json --field-name customerNo
oa-dpm authoring audit --events authoring-audit.json --format text
oa-dpm authoring validate --revision published-revision.json
oa-dpm authoring diff --before published-revision.json --after draft.json
oa-dpm authoring review --before published-revision.json --after draft.json --format text
oa-dpm authoring apply-plan --before published-revision.json --after draft.json --format text
oa-dpm authoring rollback-plan --current current-revision.json --target target-revision.json
```

JSON is the default for automation. `--format text` provides a concise operator summary. The CLI
does not connect to a database, mutate a registry, access a vault, rewrite rows, or execute Phase 10
runtime behavior.

Registry commands are read-only snapshot management helpers. They inspect status counts or list
relationships from a supplied YAML snapshot; they do not approve, import, export, or persist registry
state.

Profile commands are also read-only. They inspect captured profile graph artifacts or generate
analysis reports from files; they do not connect to Kafka/database connectors, approve proposals,
or mutate registry state.

Authoring commands are review-only. `inspect` reads a revision or draft and returns identity-only
normalized readback. `diff` and `review` consume a published revision document and
a draft document; `rollback-plan` consumes current and target published revision documents. The
documents contain the authoring metadata plus a `definitions` object in the portable `1.1` shape.
These commands report semantic changes, approval-required diagnostics, quick-fix suggestions, and
rollback impact, but never create drafts, approve, publish, execute rollback, or write a database.
`apply-plan` makes the future mutation contract explicit (base-revision guard, reviewer/publisher
roles, audit, and rollback retention) while reporting `mutation: none` and `executable: false`.

`authoring search` is an offline, bounded read-model rehearsal over explicitly supplied published
revision files only. It requires source freshness identities, supports exact canonical identity or
bounded field predicates with pagination, and does not create a persistent index, connect to a
database, or enable the deferred runtime search route.

`authoring audit` reads and validates a file-based append-only event snapshot. It can filter by
definition and reports action counts and chronological ordering; it never appends events or connects
to an audit database.

`authoring validate` is the CI/preflight gate for one revision, draft, or audit-event artifact. It
normalizes and validates the file without creating drafts, publishing revisions, or changing audit
state.

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
