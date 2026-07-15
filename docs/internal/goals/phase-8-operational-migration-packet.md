# Phase 8 Operational Migration Packet

**Status: prepared for review; no database migration or deployment authorized**

This packet defines the operational conditions for moving the Phase 8 authoring service from the
in-memory reference repository to the prepared PostgreSQL contract. It is a runbook and approval
artifact, not an execution record.

The recommended operating values and owner fields are separated in the
[Phase 8 operational change decision](./phase-8-operational-change-decision.md).

## Scope

- Schema blocks: `DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS` from
  `packages/dpm/src/authoring/postgres.ts`.
- Tables: published revisions, drafts, append-only audit events, and canonical identity index.
- Service path: the async authoring service behind a feature flag or deployment configuration.
- Excluded: public package release, registry publication, license, adapter cutover, tokenization,
  vault access, row rewriting, and production data-plane execution.

## Preconditions before an owner-approved run

1. An owner-approved operational change records the selected source ref, successful CI run, and
   completed values from the [operational change decision](./phase-8-operational-change-decision.md).
2. A target PostgreSQL environment, schema owner, connection pool, least-privilege application role,
   backup policy, retention policy, and on-call owner are recorded.
3. Backup restore is tested against a disposable database before any application traffic is moved.
4. The application has a feature flag that can route reads/writes back to the previous repository
   without deleting the new tables.
5. A migration rehearsal uses the deterministic
   [`authoring-operational-migration.test.ts`](../../../packages/dpm/test/authoring-operational-migration.test.ts)
   fixture containing at least one logical object, API binding, DB coordinate, draft conflict,
   publish event, and rollback event.
6. The owner confirms whether the target database is empty. The in-memory reference repository is
   ephemeral; it must not be treated as durable production data or silently backfilled.

## Execution sequence

### 1. Freeze and record

- Record the application source ref, schema version `1.0`, database identity, and operator.
- Disable authoring writes or route them to the reference repository during the schema change.
- Capture the last accepted published revision and audit event count if a pilot database already
  exists.

### 2. Apply additive schema

- Run the five schema blocks in order using the database migration tool selected by the owner.
- Verify all four tables, primary keys, checks, foreign keys, and indexes.
- Do not run `drop`, destructive alteration, or data rewrite statements as part of this packet.

### 3. Load or reconcile data

- For an empty environment, seed only through the async service's published-revision and audit
  paths, then rebuild the identity index in the same transaction.
- For an existing pilot, replay an exported revision/audit fixture and compare object/API/DB index
  rows before enabling traffic.
- Reject a partial replay; never mark the database ready with a revision missing its identity index
  or audit evidence.

### 4. Verify before cutover

- Read the latest published revision and one historical revision.
- Resolve the same field by canonical object, API, and DB keys.
- Prove stale `baseRevisionId` rejection without a new published row.
- Prove publish creates one immutable revision, one identity-index set, and one audit event.
- Prove rollback creates a new revision that preserves the target source/freshness/provenance.
- Compare row counts, revision identities, index identities, and audit event ids with the fixture.

### 5. Controlled cutover

- Enable async reads first and compare results with the reference path.
- Enable writes only after read parity and audit append checks pass.
- Monitor query errors, unique/foreign-key violations, stale-base conflicts, audit append failures,
  index cardinality, and latency.
- Keep the feature flag and previous repository fallback available through the observation window.

## Rollback and abort rules

- If schema creation fails, stop before enabling traffic; retain diagnostics and restore the backup
  only if the migration tool changed metadata unexpectedly.
- If read parity, index completeness, or audit parity fails, route traffic back to the previous
  repository and do not delete the new tables.
- If a published revision or audit event is duplicated, stop and investigate the constraint or id
  generator; never overwrite history to make the check pass.
- If a post-cutover authoring change must be undone, use the application rollback flow to create a
  new published revision. Do not mutate or delete the previous published revision.
- Dropping tables, restoring over a live database, or changing retention requires a new owner-
  approved operational change.

## Required evidence and approval

The run is complete only when the owner has links to:

- selected source ref and successful owner CI;
- migration tool output and schema version;
- backup/restore rehearsal;
- fixture input and object/API/DB index comparison;
- stale-base, publish, audit, and rollback verification;
- observation-window metrics and final operator/owner sign-off.

Until those artifacts and approvals exist, the prepared PostgreSQL contract remains reviewable code
only. The current repository has not applied this packet.

The private contract rehearsal evidence is green in the owner CI, but it records fake-client
behavior only; it is not evidence of a target database migration or deployment.

The subsequent [local PostgreSQL rehearsal report](./phase-8-local-postgres-rehearsal.md) adds
disposable schema application and backup/restore evidence. It remains explicitly non-production
and does not satisfy the owner-approved operational change requirement.
