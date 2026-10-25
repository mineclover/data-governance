# TODO — Always-On Shared Search

**ID:** TODO-SHARED-SEARCH
**Status: deferred backlog; not an active implementation task**
**Decision date:** 2026-10-25
**Current priority:** file-based read-only CLI maintenance; no database required

The user explicitly deferred always-on/shared search to TODO. This decision supersedes earlier
recommendations to continue staging, privilege, adapter, or database work as the next step.
No schedule, service activation, additional rehearsal, or infrastructure work is assigned.

## User problem to establish before reopening

An optional service could let multiple authorized users/processes search a shared set of published
DPM definitions without supplying files on every invocation, while retaining an index between
requests or restarts. This is different from today's bounded offline search over explicit files.

Reopen only after a concrete user workflow demonstrates that explicit versioned files, in-memory
lookup and CI artifacts are insufficient, and the user explicitly selects this capability for a
new work scope. A routine “continue in recommended order” is not a reopening decision.

## Current behavior stays unchanged

- The file-based CLI, including offline authoring search, needs no PostgreSQL, Docker, DB account,
  persistent index, background worker, or hosted service.
- API/DB binding identifiers describe metadata; their presence does not require a live business DB.
- The private in-memory reference, SQL proposal and tests remain as regression/reference material.
  No package database driver/client or search service is wired in.
- The completed disposable PostgreSQL rehearsal is historical feasibility evidence. Its container
  and data were removed; it is not infrastructure to keep running or automatically recreate.
- PostgreSQL is a previously explored candidate, not a required dependency or a final product
  storage decision. Existing staging-owner selection does not assign active service work.

## Deferred TODOs — all require an explicit reopening decision

- [ ] Confirm the shared/always-on user need, callers, workload and why file-based alternatives fail.
- [ ] Define approved metadata/source authority, definition/tenant scopes, freshness and revocation
  semantics, result bounds and cross-generation continuation behavior; exclude raw values/secrets.
- [ ] Compare persistence choices and operational cost, including whether a database is necessary;
  do not automatically adopt the earlier PostgreSQL proposal.
- [ ] Review reusable contracts and gaps, especially source-registrar authority and least-privilege
  builder/reader enforcement not proven by the bootstrap-superuser rehearsal.
- [ ] Accept accountable service/operations ownership, environment, retention, SLO/observation,
  backup/recovery, abort and fallback responsibilities.
- [ ] Separately approve implementation/dependencies, deployment/migration and any further local
  execution or durable-shadow rehearsal; keep consumers disabled beforehand.
- [ ] Accept scoped pilot evidence and explicitly approve consumer activation/expansion. Search
  approval must not imply authoring mutation, bulk edit, external IdP deployment or Phase 10.

## Retained reference material, not a next-step queue

- [Read-model contract](./phase-8-cross-definition-read-model-contract.md)
- [Activation packet](./phase-8-cross-definition-read-model-activation-packet.md)
- [Local PostgreSQL design](./phase-8-read-model-local-staging-design.md)
- [Private conformance report](./phase-8-cross-definition-read-model-shadow-report.md)
- [Completed local PostgreSQL rehearsal](./phase-8-read-model-local-postgres-rehearsal.md)
- [Current handoff](./dpm-cli-checkpoint-2026-10-24.md)

Preserve these artifacts and their limits. Passing their checks, an intended owner name, or prior
one-off permission does not establish current product need or reactivate this TODO.
