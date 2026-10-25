# Phase 8 Next Follow-On Priority Decision

**Status: private priority decision and contract preparation adopted 2026-07-15; runtime activation deferred**

This record defines the recommended order for capabilities that remain outside the accepted
definition-scoped Phase 8 representative slice. It does not activate implementation, database
migration, external authorization, or any public-release action.

## Current priority amendment — 2026-10-25

The user has parked always-on/shared search in [TODO-SHARED-SEARCH](./shared-search-todo.md).
The current task is DB-free file-based CLI maintenance, not further database/privilege/adapter
preparation. The ordering below is conditional on a future explicit capability reopening; it is
not an instruction to start the first row. Earlier preparation and one-off local evidence remain
valid historical records, not current product requirements. Mutation and bulk edit are not
automatically promoted when search is deferred.

## Conditional future order

| Priority | Capability | Decision now | Required entry conditions |
| --- | --- | --- | --- |
| 1 | Always-on cross-definition search/read model | Deferred TODO; retain existing contract/reference evidence and do not continue implementation. | Accepted shared-service need and explicit reopening first, then storage selection, stable identity, freshness, authorization, and bounded results. |
| 2 | Automatic mutation from review suggestions | Defer activation; keep current quick-fix output review-only. | Explicit apply contract, role-gated authorization, optimistic concurrency, audit events, dry-run, and rollback behavior. |
| 3 | Bulk authoring/edit | Defer until mutation and the read model are accepted. | Batch conflict policy, partial-failure semantics, per-item audit, idempotency, bounded batch size, and rollback/recovery evidence. |

Cross-definition search is listed first because it establishes the read context and authorization
boundary needed to make a mutation target unambiguous. Automatic mutation follows only after the
existing review-only suggestions have a durable apply contract. Bulk edit is last because it
multiplies conflict, audit, and rollback concerns across definitions.

## Current action

- Keep the private Phase 8 representative slice limited to scoped lookup, canonical import/export,
  identity-only explain, immutable authoring revisions, semantic diff, and review-only quick fixes.
- Continue consumer evidence, documentation, and private T1 preflight maintenance.
- Maintain the [cross-definition read-model contract](./phase-8-cross-definition-read-model-contract.md)
  and its private reference/conformance fixture as review artifacts; do not activate a search
  service or persistent index yet.
- Maintain the [read-model activation packet](./phase-8-cross-definition-read-model-activation-packet.md)
  with disabled rollout values until an operational owner and authorization/persistence approvals
  are recorded.
- Keep [Issue #4](https://github.com/mineclover/data-governance/issues/4) as historical activation
  tracking, not the active task queue. Its CI-only approval and the completed local exception do
  not reopen the TODO; keep the consumer/runtime flag `disabled`.
- Do not apply PostgreSQL migrations or integrate external authorization until the operational
  owner approves the [persistence proposal](./phase-8-persistence-proposal.md) and
  [operational migration packet](./phase-8-operational-migration-packet.md).
- Keep future public package metadata, license changes, `v*` tags, registry publication, and
  adapter cutover behind the owner-approved release gate. The OIDC validation release is complete
  in [Issue #3](https://github.com/mineclover/data-governance/issues/3).

## Revisit trigger

Reopen only after the shared-service user need is accepted and the user explicitly selects the
capability. Then revisit storage alternatives, operational ownership and authorization/persistence
contracts. Existing tests, a previous owner name, or a generic continuation request alone do not
reactivate any deferred capability.
