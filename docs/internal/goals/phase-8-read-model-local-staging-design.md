# Phase 8 Read-Model Local PostgreSQL Staging Design

**Status: design and offline SQL proposal only; no provisioning, connection, migration, or durable write authorized**
**Updated:** 2026-10-25
**Intended read-model operational owner:** `mineclover`
**Selected design environment:** isolated disposable local PostgreSQL
**Consumer flag:** `disabled`

The user selected this environment for design, not execution. This document refines the
[activation packet](./phase-8-cross-definition-read-model-activation-packet.md) and
[read-model contract](./phase-8-cross-definition-read-model-contract.md). It contains no SQL,
connection settings, credentials, container launcher, driver integration, or migration command.

The user subsequently approved **private SQL contracts and offline tests only**. The proposal in
`packages/dpm/src/authoring/read-model-postgres-contract.ts` is declarative SQL/parameter/recipe
constants, not an executing client or adapter. The 19 structural tests in
`packages/dpm/test/authoring-read-model-postgres-contract.test.ts` do not parse or run PostgreSQL.

## Isolation and source boundary

- Use a dedicated disposable local database and projection namespace, never an existing authoring,
  business-data, shared staging, or production database. Exact instance/schema/role names and the
  PostgreSQL version/image pin remain pending before execution.
- Accept only explicitly listed synthetic immutable published revisions and freshness identities.
  A frozen fixture manifest defines the expected source set for one rehearsal; it is not proof of
  the latest revision in an external system and must not become a new source of truth.
- Do not connect to source databases, perform catalog discovery, or copy customer rows, drafts,
  sensitive descriptions, credentials, or production dumps.
- Separate migration, projection-builder, and scoped shadow-reader privileges. Neither runtime
  role receives DDL or authoring/source-write permission. Actual grants and executor authority
  require review; intended ownership does not grant them automatically.
- Do not assume local execution permits `trust` authentication, plaintext credentials, public
  network binding, or disabled TLS. Network/authentication/TLS choices require explicit acceptance.

## Proposed logical storage records

These are design responsibilities, not table names, a schema version, or approved DDL. All
records are scoped by owner namespace and definition; display names never determine identity.

| Record | Logical key | Contents and responsibility |
| --- | --- | --- |
| Source expectation | `(ownerNamespace, definitionId)` | Expected published `revisionId`, freshness identity, fixture-manifest identity, and current writer epoch; derived from approved input, not authoritative publication state |
| Build attempt | `(ownerNamespace, definitionId, attemptId)` | Captured source expectation and writer epoch, building/ready/stale/failed state, expected object set/completeness evidence; attempt identity distinguishes identical-freshness retries |
| Projected field | `(ownerNamespace, definitionId, attemptId, objectId)` | Identity-only field locator, canonical object/API/DB match keys, binding context, source revision/freshness references; no raw definition/sample/secret payload |
| Ready pointer | `(ownerNamespace, definitionId)` | Selected complete attempt, writer epoch and source revision/freshness; not an unconditional fallback to historical data |

Canonical identity match context retains the contract tuple
`(ownerNamespace, definitionId, revisionId, identityKind, identityKey, objectId)`.
One logical-field result may carry several matched identities; query output collapses duplicates.
The projected-field key adds attempt isolation without redefining canonical field identity.

## Proposed build and publication protocol

1. **Freeze input:** normalize and validate the synthetic revision, freshness, namespace/scope, and
   exact expected object set against the approved manifest. Reject ambiguous/missing inputs.
2. **Start attempt:** within an owner-reviewed transaction, capture the current source expectation,
   advance the per-definition writer epoch, and create a new building attempt. Any earlier attempt
   loses authority to publish even when revision/freshness are identical.
3. **Stage rows:** write only under the attempt key. Reject unknown or duplicate object IDs;
   partial rows are not queryable through the shadow-reader path. Source definitions are immutable.
4. **Verify completeness:** compare the actual object set and canonical identity/binding context
   with expected projection output. Row count alone is not proof of completeness.
5. **Commit ready:** in one transaction, re-check source expectation, current attempt ownership,
   writer epoch, building state, and complete row set; only then mark ready and switch the pointer.
   Source change, cancellation, or supersession must reject this commit without changing the pointer.
6. **Fail/retry:** failure updates only an attempt still owned by that writer. A late failure must
   not mark a replacement failed or alter its pointer. A retry uses a new attempt/epoch; do not
   revive a terminal or superseded session. Retention and cleanup remain separate decisions.

The private reference currently fences interleaved sessions with in-memory object identity. A
future PostgreSQL implementation needs a reviewed compare-and-set/locking and transaction-isolation
contract; neither the current tests nor this design implement or prove that durable mechanism.

## Scoped read and freshness protocol

1. Resolve an explicit authorized definition scope through the injected default-deny adapter.
   Empty/widened scopes are forbidden; hidden definitions must not affect counts, cursors, state,
   or diagnostics.
2. Evaluate the accepted source expectation and ready pointer in a consistent database snapshot.
   Every authorized definition needs a complete ready attempt matching its expected revision,
   freshness, and current writer epoch. A newer expected source or rebuilding ownership epoch with
   an older ready pointer is unavailable, even for identical freshness; it is not a fallback.
3. Reject missing/building/stale/failed generations as `read-model-unavailable`, never successful
   empty or partial results. Real operational use additionally requires authoritative source
   reconciliation; a frozen fixture manifest does not solve that problem.
4. Preserve existing exact-identity/bounded-filter semantics, ordering and duplicate collapse;
   default page size is `25`, maximum `100`. Invalid query/cursor shapes remain `invalid-query`.
   Current cursor positions do not guarantee snapshot consistency across manifest/generation
   changes; any stronger continuation policy needs a separate contract review.
5. Compare the private result with definition-scoped fallback output; consumers remain disabled.

## Proposed rehearsal acceptance matrix

| Scenario | Required evidence before accepting local execution results |
| --- | --- |
| Normal complete build | Identity/freshness/binding parity and deterministic bounded pages match fallback |
| Interrupted build or early ready request | No partial visibility; completion rejected until the exact expected row set exists |
| Overlapping identical-source retries | Superseded append/complete/fail cannot affect the replacement attempt or pointer |
| Source expectation changes during build | Old commit rejected; old ready data not served as current |
| Cancelled/failed attempt | No resurrection; explicit new attempt required; no destructive repair |
| Hidden/missing/unauthorized definitions | No cross-scope existence/state/cursor leakage; no partial authorized success |
| Backup/restore and rebuild | Restore into a separate disposable target; verify keys, source references, complete attempts and pointer parity without contacting another environment |
| Stop/fallback | Keep consumers disabled, stop writers, preserve evidence, and use the definition-scoped path; do not drop source or projection history as rollback |

The existing 81-test private fixture is reusable contract evidence, not a PostgreSQL result. The
[historical local rehearsal](./phase-8-local-postgres-rehearsal.md) tested authoring schema version
1.0, not these records or protocols. Its SQL blocks and backup counts must not be reused as proof
that the read-model schema or durable fencing has been validated.

## Remaining execution gates and next review

### Offline SQL proposal scope and review requirements

- `proposal-1` is an unexecuted private proposal identifier, not a public wire/schema compatibility
  promise. Fixed SQL namespace `dpm_read_model` is a proposed isolation boundary, not a selected
  existing schema or permission to create one. Plain table creation deliberately fails on reuse;
  no upgrade/idempotent migration system is supplied.
- Four records model source expectations, attempts, identity-only projected fields and ready
  pointers. Namespace/definition keys and foreign keys preserve attempt isolation. There is no
  authoring table reuse, source revision mutation, automatic cleanup, or grant/role creation.
- `expected_projection` maps object IDs to canonical `{ field, identities, apiBindings }` payloads
  derived from the existing validated projection helper. A separately authorized source registrar
  must accept the synthetic manifest. Builders must not choose or modify this blueprint.
  Top-level payload checks and equality with approved expectations are not a general JSON sanitizer;
  approved input normalization and actual database privilege enforcement remain required.
- Source registration is a single atomic upsert that advances the epoch only on changed
  expectation content. An unchanged registration returns zero rows and means no change, not a
  new build. This operation is separate from builder authority.
- The proposed begin/append/complete/fail recipes use separate statements in one `READ COMMITTED`
  transaction, retaining a per-definition source-row lock until commit/rollback. Re-read after
  locking; do not replace the sequence with a single snapshot-based CTE. The isolation/privilege
  mechanism still needs PostgreSQL review and execution evidence.
- Begin checks for an existing scoped attempt ID after locking and before advancing the epoch.
  A duplicate with matching source identity returns its original outcome without advancing or
  reviving ownership; mismatched identity is a conflict. Superseded/terminal attempts do not become
  active merely because their ID is retried. A new rebuild uses a new attempt ID.
- Except unchanged registration and the optional initial attempt lookup, require exactly one row
  from each scoped lock/mutation. A missing source, stale epoch, rejected row, or missing ready
  transition means reject and roll back; uniqueness violations also roll back. In particular,
  ready promotion and pointer change are one transaction: pointer failure must undo promotion.
- Append compares both expected object membership and full canonical payload equality; duplicate
  rows are errors, not upserts. Completion checks expected-minus-actual and actual-minus-expected
  sets and payload parity, not merely row counts. Failure never changes the ready pointer.
- Scope readiness is a single status-only statement over already-authorized definition IDs;
  empty/malformed scopes are forbidden and any unavailable member prevents partial success.
  It is not authentication, a full search query, a pagination adapter, or a consumer route.
- No driver/client, transaction executor, connection/configuration, migration runner, package/CLI
  export, worker, or durable read path is provided. Direct table writes could bypass the protocol;
  an approved access-control/privilege boundary is a prerequisite, not a capability of these strings.

Offline tests inspect placeholder metadata, scoped constraints/predicates, completeness expressions,
recipe ordering and absence of public/CLI wiring. They do **not** establish PostgreSQL syntax,
locking, rollback, source authorization, throughput, or backup/restore correctness.

### Still blocked before execution or client/driver integration

Separately approve:

- this logical layout and durable ownership/transaction/freshness semantics;
- exact PostgreSQL version/image pin, database/namespace, migration and application role identities;
- approved synthetic fixture manifest, executor, abort authority, and execution change record;
- connection/network/authentication/TLS policy, pool/statement/idle limits;
- retry/concurrency, retention and cleanup, backup/restore and recovery requirements;
- observation window and latency/error/lag/cardinality thresholds, plus telemetry access/retention.

The immediate next step is review of the unexecuted SQL/transaction proposal and completion of
these values, not container startup, SQL application, or a storage adapter. No scope change is
implied for authoring mutation, managed staging, production,
consumer pilots, external IdP deployment, package release, or Phase 10.
