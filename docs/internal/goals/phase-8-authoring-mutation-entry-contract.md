# Phase 8 Authoring Mutation Entry Contract

**Status: recommendation prepared; mutation activation deferred**
**Scope:** future `authoring apply` after explicit owner approval

This document defines the minimum entry contract for converting the current review-only authoring
workflow into an apply workflow. It does not authorize implementation, database access, external
authorization integration, publication, or rollback execution.

## Current boundary

The current CLI supports `authoring diff`, `review`, and `apply-plan`. The plan is intentionally
non-executable:

```text
mutation: none
executable: false
```

The future apply path must be a separate capability. It must not infer authorization or persistence
from the current file-based CLI, and it must not silently turn a quick-fix suggestion into a write.

## Required input contract

An apply request must include:

- one normalized draft artifact and its `definitionId`;
- the exact `baseRevisionId` observed during review;
- an explicit approval reference for the semantic diff and quick-fix decisions;
- an actor identity resolved by an owner-provided authorization adapter;
- an idempotency key scoped to the definition and base revision;
- an explicit execution mode, with dry-run as the default until activation is approved.

Raw values, credentials, vault material, connector payloads, and unbounded definition documents are
not valid apply inputs.

## Mandatory gates

1. **Artifact validation:** normalize the draft and validate all referenced source/freshness
   identities before authorization or persistence.
2. **Authorization:** require `editor` for draft preparation, `reviewer` for approval, and
   `publisher` for publication. A default-deny policy is required.
3. **Optimistic concurrency:** re-read the latest published revision and reject a stale
   `baseRevisionId`; never merge silently over a newer revision.
4. **Semantic approval:** recompute the diff from the persisted base and draft. Approval must cover
   the recomputed diff, not only a client-supplied summary or quick-fix identifier.
5. **Idempotency:** repeat requests with the same idempotency key must return the original outcome
   without creating a second revision or duplicate audit event.
6. **Atomic persistence:** publish the immutable revision and its audit event under one owner-approved
   transaction boundary; partial publication is not a successful outcome.
7. **Rollback retention:** preserve the target revision, source/freshness/provenance identities,
   and the audit reference required to create a later rollback revision.

## Result and audit contract

Every apply attempt must return a machine-readable outcome with:

- request and idempotency identity;
- definition, base revision, and resulting revision identity when published;
- status: `dry-run`, `applied`, `rejected`, or `conflict`;
- diagnostic codes without raw sensitive values;
- approval and actor references;
- audit event identity and timestamp when persistence occurs;
- rollback target reference when a new revision is created.

Rejected, conflict, and failed attempts must not create a published revision. Audit persistence and
retry semantics require an owner-approved durable target; the current CLI only reads audit snapshots.

## Activation gates

Do not implement or enable `authoring apply` until an owner explicitly accepts:

- the authorization adapter and role mapping;
- the durable storage and transaction boundary;
- idempotency retention and conflict policy;
- audit retention and observability requirements;
- rollback authority and recovery procedure;
- a packed consumer rehearsal proving no mutation occurs in dry-run and stale-base requests fail;
- package/release implications under the existing T1 gate.

The current `apply-plan`, `validate`, audit readback, and demo flows remain the only permitted CLI
authoring operations until those values are recorded.
