# Phase 8 Cross-Definition Read-Model Activation Packet

**Status: recommendation prepared; no read-model activation or database deployment authorized**
**Recommended flag state: disabled**

This packet turns the [cross-definition read-model contract](./phase-8-cross-definition-read-model-contract.md)
into an owner-reviewable activation runbook. It is a recommendation and approval artifact only.
It does not select an operational owner, connect to a database, add a public API, integrate an
external identity provider, or authorize any T1/public-release action.

## Recommended operating model

| Decision | Recommendation | Approval state |
| --- | --- | --- |
| Contract owner | `mineclover/data-governance` owns the contract and reference implementation. | Accepted for private preparation |
| Operational owner | Name a separate owner for index storage, rebuild, monitoring, backup, and rollback. | Not selected |
| Durable target | Use the prepared PostgreSQL direction with a dedicated read-model projection under the existing `dpm` namespace. | Recommendation only; migration deferred |
| Build protocol | Build a new generation from one immutable published revision and publish an atomic `ready` pointer only after all rows are complete. | Contract prepared; runtime pending |
| Consistency | Strict by default. Missing, `building`, `stale`, or `failed` generations return `read-model-unavailable`, never a false empty result. | Recommended |
| Authorization | Use an owner-injected definition-scope resolver with deny-by-default behavior. | Adapter and owner pending |
| Rollout | `disabled` → `shadow` → `read-only pilot` → approved expansion. | Owner change record pending |
| Fallback | Keep the existing definition-scoped lookup as the fallback. Disable the read model without deleting source revisions or index history. | Recommended |

The logical flag remains `disabled` until the owner-approved change record names its actual
deployment flag, operator, and rollback path. This repository does not add or set that flag.

## Scope of the first activation

The first runtime pilot may serve only:

- immutable latest published revisions;
- exact object/API/DB identity lookups and bounded field predicates;
- explicitly authorized definition scopes;
- identity-only field locator and binding context;
- a hard page-size maximum of `100` with deterministic opaque cursors.

The pilot must not serve drafts, historical revisions by default, sensitivity/owner metadata,
relationship or policy where-used data, full-text search, sample values, secrets, or any mutation
operation. Automatic mutation, bulk edit, and adapter cutover remain separate decisions.

## Required owner values before activation

The owner-approved change record must fill every item below; a recommendation or blank is not an
activation value:

- operational owner, on-call owner, abort authority, and change-record identifier;
- target environment/provider, database/schema identity, and data residency boundary;
- schema/migration role, least-privilege application role, migration runner, and operator;
- connection pool, TLS, statement timeout, idle timeout, backup, and retention values;
- authorization adapter, definition-scope source, cache/expiry policy, and deny-by-default test;
- generation trigger, retry budget, rebuild concurrency, ready-pointer transaction boundary, and
  stale-generation retention;
- observation window, success/error/lag/cardinality thresholds, and expansion authority;
- fallback feature flag, definition-scoped lookup route, and rollback owner.

## Recommended activation sequence

### 1. Freeze the candidate and decision

- Record the exact private source ref and successful Owner CI/T1 preflight links.
- Record the accepted read-model contract version and the owner values above.
- Keep the runtime flag disabled and do not apply schema or deployment changes yet.

### 2. Rehearse the projection privately

- Use two definitions with colliding display names but distinct definition scopes.
- Build a generation for each latest published revision with object/API/DB identity rows.
- Interrupt and retry a rebuild; prove partial generations never become visible.
- Mark a generation stale and failed; prove strict queries return `read-model-unavailable`.
- Prove duplicate identity matches collapse to one logical-field hit and pagination is stable.

### 3. Validate authorization isolation

- Resolve an explicit caller scope before evaluating the query.
- Prove an out-of-scope identity returns `forbidden` without existence, count, cursor, or freshness
  leakage.
- Prove an empty or invalid scope fails closed and cannot be widened by an identity key.

### 4. Run shadow verification

- Keep the read model disabled for consumers and compare bounded read-model results with the
  existing definition-scoped lookup.
- Record canonical identity parity, freshness identity, result ordering, error mapping, and
  latency without changing authoring state.
- Abort on any mismatch, stale result, unauthorized observation, or unbounded query.

### 5. Enable a read-only pilot

- Enable only the approved pilot scope and keep the definition-scoped fallback available.
- Observe one full workload cycle or the owner-approved window, whichever is longer.
- Do not enable writes, drafts, automatic mutation, bulk edit, or public package behavior.

### 6. Expand or rollback

- Expand only after operator sign-off records thresholds, evidence, and the next scope.
- On failure, disable the read-model flag and route to definition-scoped lookup; preserve source
  revisions and generation evidence for investigation.
- A schema rollback, retention change, or deletion of projection history requires a new approved
  operational change.

## Required evidence

Activation is not complete until the owner links all of the following:

- selected source ref, Owner CI, and private T1 preflight;
- schema/version and migration output, if a migration was separately approved;
- backup/restore rehearsal and generation rebuild/interrupt evidence;
- two-definition collision, exact API/DB, duplicate-collapse, pagination, and stale-state fixture;
- authorization isolation and deny-by-default evidence;
- shadow parity report, pilot metrics, observation-window result, and operator sign-off;
- fallback/rollback execution record.

## Abort conditions

Abort before serving any read-model result when the operational owner or authorization adapter is
missing, a generation is not `ready`, a source freshness identity cannot be verified, a result
bound is exceeded, a scope is ambiguous, or parity differs from the definition-scoped fallback.
Never repair an activation failure by mutating a published revision, widening a caller scope, or
deleting audit/index history.

## Explicit non-goals

- No PostgreSQL migration, owner-managed database connection, or production deployment is performed.
- No external OIDC/RBAC integration or token/secret access is performed.
- No public package metadata, license finalization, registry publication, `v*` tag, or adapter
  cutover is authorized.
- No automatic mutation, bulk authoring, source data rewrite, tokenization, or vault execution is
  added to the private reference implementation.

The packet is checked by `pnpm check:read-model-activation`. Until its owner values and gates are
explicitly approved, it remains a recommendation-only review artifact.
