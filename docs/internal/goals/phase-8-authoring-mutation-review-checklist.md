# Phase 8 Authoring Mutation Review Checklist

**Status: review preparation only; no mutation activation authorized**
**Related contract:** [Authoring Mutation Entry Contract](./phase-8-authoring-mutation-entry-contract.md)

This checklist collects the owner decisions required before implementing or enabling
`authoring apply`. Checking an item requires explicit owner evidence; passing repository tests alone
does not check or activate it.

## Proposed review values

These are the conservative values selected for review. They are proposals, not approvals, and do
not change the unchecked gates below.

| Decision | Proposed value | State |
| --- | --- | --- |
| Operational owner | TBD; owner role/identifier still required | pending owner input |
| Initial scope | Dry-run only | proposed |
| Authorization | Owner-injected adapter with default-deny `editor`/`reviewer`/`publisher`/`rollback` roles | proposed |
| Persistence | No writes; memory/injected-adapter rehearsal only | proposed |
| Idempotency | Required for `definitionId` + `baseRevisionId`; retention TBD | proposed |
| Audit and rollback | Plan-only; no audit event or revision creation | proposed |
| Release | Existing T1 package/release gate | proposed |

## Required owner decisions

- [ ] Operational owner named for authoring writes, audit, monitoring, backup, and rollback.
- [ ] Authorization owner accepts the role mapping and default-deny policy.
- [ ] Durable persistence target and transaction boundary approved.
- [ ] Draft/revision retention and idempotency retention policy approved.
- [ ] Stale-base conflict behavior and duplicate-request outcome approved.
- [ ] Audit event schema, atomicity, retention, and observability approved.
- [ ] Dry-run, rejection, retry, and partial-failure behavior approved.
- [ ] Rollback authority, target retention, and recovery procedure approved.
- [ ] Packed consumer rehearsal scope and acceptance criteria approved.
- [ ] Package/release impact reviewed under the existing T1 gate.

## Evidence required before activation

- [ ] A contract conformance fixture proves recomputed diff approval, stale-base rejection,
  idempotency, atomic audit behavior, and rollback target preservation.
- [ ] A dry-run rehearsal proves no revision, audit event, or database row is written.
- [ ] An authorized apply rehearsal proves the selected durable adapter is the only writer.
- [ ] A failure rehearsal proves rejected/conflict attempts do not publish a revision.
- [ ] A packed declaration/runtime consumer proves the public seam and compatibility window.
- [ ] Owner CI, `pnpm verify`, and the applicable release gate pass for the exact candidate.

## Explicit non-decisions

- No database migration or production connection is authorized by this checklist.
- No external identity-provider integration is authorized by this checklist.
- No `authoring apply` command is added to the current CLI by this checklist.
- The current `apply-plan` remains `mutation: none` and `executable: false`.
