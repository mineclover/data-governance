# Phase 8 Operational Change Decision

**Status: recommendation prepared; no operational change or database deployment authorized**

This document separates the recommended operating model from the owner-specific values required
before the prepared PostgreSQL authoring contract can be applied. It does not grant database access,
select an environment, or authorize a production migration.

## Recommended operating model

| Decision | Recommendation | Approval state |
| --- | --- | --- |
| Environment order | Validate in a disposable/staging PostgreSQL environment first, then promote to production through a separate change record. Use a managed PostgreSQL service compatible with the rehearsed schema contract. | Recommendation only |
| Schema boundary | Use the existing `dpm` schema and the five additive SQL blocks from `DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS`. | Contract prepared; execution pending |
| Database roles | Separate a schema/migration owner role from a least-privilege application role. The application role must not have DDL or ownership privileges. | Owner must name roles |
| Connection handling | Use a dedicated authoring pool with TLS, bounded connection/statement/idle timeouts, and owner-approved pool limits. | Owner must select values |
| Migration mechanism | Use the owner-selected migration runner to apply the additive blocks in order. Do not add a new database driver or migration CLI to this repository as part of the rehearsal. | Owner must select runner |
| Data state | Treat the target as empty by default. If any pilot or production data exists, stop and create a separate reconciliation/backfill decision; never silently backfill the in-memory repository. | Owner must confirm |
| Backup | Take a managed database snapshot and a logical backup before applying schema. Restore both evidence paths into a disposable database before enabling traffic. | Owner must record retention |
| Backend switch | Recommend `DPM_AUTHORING_BACKEND=memory|postgres`, with `memory` as the default until parity is accepted. The name is a configuration recommendation, not an implemented production flag. | Implementation and owner approval pending |
| Cutover order | Enable PostgreSQL reads/parity checks first. Enable PostgreSQL writes only after identity, audit, conflict, and rollback checks pass. | Operational approval pending |
| Observation window | Observe at least one complete workload cycle; use 24 hours or one full business cycle, whichever is longer, as the default pilot window. | Owner must set end time |
| Rollback | Before PostgreSQL writes are enabled, switch the backend back to `memory`. After writes are enabled, freeze authoring writes and reconcile/replay before fallback; never drop tables to roll back. | Runbook approval pending |

## Required owner values

The following fields must be filled in the owner-approved operational change before execution:

- target environment/provider, database, host, and `dpm` schema identity;
- schema/migration owner role and application role;
- connection pool limits, TLS policy, statement timeout, and idle timeout;
- migration runner and operator;
- managed snapshot and logical-backup retention policy;
- target data-state confirmation (`empty` or a separately approved reconciliation plan);
- feature-flag owner and previous-backend fallback path;
- on-call owner, change record, start time, observation-window end time, and abort authority.

## Recommended execution order

1. Owner records the values above and approves the operational change.
2. Run the disposable rehearsal and backup/restore checks against the selected staging shape.
3. Apply the five additive blocks and verify tables, constraints, indexes, and identity rows.
4. Run read parity, stale-base, publish, audit, and rollback checks with the deterministic fixture.
5. Enable reads, observe the complete window, then enable writes under the approved flag.
6. Record metrics and operator sign-off; keep the previous backend and abort path available until
   the window closes.

## Explicit non-goals

- No production database connection or migration is performed by this document.
- No public package metadata, registry publication, license finalization, tag, or adapter cutover
  is authorized.
- No destructive DDL, row rewrite, tokenization, vault access, or generic search index is added.

The detailed runbook remains in the
[Phase 8 operational migration packet](./phase-8-operational-migration-packet.md), and the
disposable evidence remains in the [local PostgreSQL rehearsal report](./phase-8-local-postgres-rehearsal.md).
