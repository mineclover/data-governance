# Phase 8 Local PostgreSQL Rehearsal Report

**Status: disposable local rehearsal passed; production migration and deployment remain unauthorized**
**Date: 2026-07-15**

This report records a local, disposable rehearsal of the prepared PostgreSQL authoring schema. It
is evidence for the operational packet only; it is not an owner-approved migration, production
deployment, or T1/public-release action.

## Run identity

| Item | Value |
| --- | --- |
| Repository candidate | `418b72d` (`main`) |
| PostgreSQL image | `postgres:17-alpine` |
| Schema contract | `DPM_AUTHORING_STORAGE_SCHEMA_VERSION = 1.0` |
| SQL application | Five additive schema blocks from `DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS` |
| Database lifecycle | Temporary container and restore database removed after verification |

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Schema application | Passed | Schema, four tables, and three operational indexes created without errors. |
| Structural constraints | Passed | Four primary keys, three check constraints, and one revision/index foreign key were present. |
| Canonical fixture load | Passed | One published revision, three object/API/DB identity rows, and one seeded audit event. |
| Identity preservation | Passed | Canonical object, API, and DB keys matched before backup and after restore. |
| Backup/restore | Passed | Plain SQL `pg_dump` stream restored into a separate disposable database. |
| Restore parity | Passed | Restored counts were `revisions=1`, `identity_index=3`, `audit=1`; all three operational indexes were present. |
| Cleanup | Passed | The temporary PostgreSQL container and restore database were removed. |

## Scope limitations

- No production or owner-managed database was contacted.
- No application traffic, feature flag, external authorization, connection pool, backup policy, or
  observation window was exercised.
- No destructive DDL, data rewrite, package publication, license change, tag, registry action, or
  adapter cutover occurred.
- The rehearsal proves local SQL/schema and backup/restore mechanics only; the owner still must
  select the target environment, operator, operational change, and sign-off path.

The remaining operational steps are defined in the
[Phase 8 operational migration packet](./phase-8-operational-migration-packet.md).
