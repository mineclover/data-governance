# Phase 8 Cross-Definition Read-Model Activation Packet

**Status: recommendation prepared; no read-model activation or database deployment authorized**
**Recommended flag state: disabled**

Owner decision tracking: [Issue #4](https://github.com/mineclover/data-governance/issues/4)

The private reference fixture passes; Issue #4 collects the operational owner, persistence,
authorization, observation, fallback, and explicit `disabled` → `shadow` approval values required
before activation.

## Current approved scope

Issue #4 approves only a private GitHub Actions CI-only shadow rehearsal against the existing
ephemeral in-memory fixture. The consumer flag remains `disabled`; no durable target, owner-managed
database, production on-call commitment, public route, or read-only pilot is approved.

The full future rollout remains `disabled` → `shadow` → `read-only pilot` → approved expansion.

This packet turns the [cross-definition read-model contract](./phase-8-cross-definition-read-model-contract.md)
into an owner-reviewable activation runbook. It is a recommendation and approval artifact only.
It does not select an operational owner, connect to a database, add a public API, integrate an
external identity provider, or authorize any T1/public-release action.

## Recommended operating model

| Decision | Recommendation | Approval state |
| --- | --- | --- |
| Contract owner | `mineclover/data-governance` owns the contract and reference implementation. | Accepted for private preparation |
| Operational owner | `mineclover` repository owner for the CI-only rehearsal; production operational owner remains unselected. | CI-only scope confirmed; production pending |
| Durable target | Use the prepared PostgreSQL direction only after a separate production decision. | No durable target; migration deferred |
| Build protocol | Build a new generation from one immutable published revision and publish an atomic `ready` pointer only after all rows are complete. | Contract prepared; runtime pending |
| Consistency | Strict by default. Missing, `building`, `stale`, or `failed` generations return `read-model-unavailable`, never a false empty result. | Recommended |
| Authorization | Use an owner-injected definition-scope resolver with deny-by-default behavior. | Adapter and owner pending |
| Rollout | `disabled` → private CI-only shadow rehearsal → future read-only pilot. | CI-only shadow approved; consumer flag disabled |
| Fallback | Keep the existing definition-scoped lookup as the fallback. Disable the read model without deleting source revisions or index history. | Recommended |

The logical flag remains `disabled` until the owner-approved change record names its actual
deployment flag, operator, and rollback path. This repository does not add or set that flag.

## Product ownership and current work boundary

This read model belongs to the DPM contract/control plane in `mineclover/data-governance`, not
OA SDK Core code generation or the Spec-Lens source/spec observation index. The historical
`@oa-sdk/dpm` workspace in OA SDK remains maintenance-only; package namespace continuity is not
a scope reactivation or permission to implement this service in that monorepo.

The current follow-up prepares operational requirements and approval criteria only. It retains
file-based CLI inputs and the existing ephemeral in-memory conformance/shadow fixture. It creates
no durable index, audit event, revision, connection, migration, deployment flag, or consumer route.
Transient fixture generation is evidence, not operational persistence. Read-model activation is
also not Phase 10 data-plane activation: neither authoring writes nor source-row processing is
authorized by a search pilot.

## Operational requirements and pending decisions

These requirements refine the owner-value list below. All future operational values remain
pending; this table supplies no owner approval, credentials, or production defaults.

| Area | Required behavior and acceptance evidence | Owner value still required |
| --- | --- | --- |
| Ownership and environment | One accountable operator can stop serving results and restore the definition-scoped fallback; record the permitted definitions and environment before any service is enabled. | Production operator/on-call, abort authority, environment, definition scope, change record |
| Durable projection | Derive the index only from immutable published revisions; preserve canonical identity and source/freshness references. Rebuild must not rewrite source definitions. | Durable target, schema/version, residency, migration authority, backup/restore and retention policies |
| Writer/reader separation | Search is read-only for callers, but index rebuilds write projection storage. Approve rebuild writes separately; a read-only pilot never grants authoring or source-database write rights. | Builder and query roles, transaction boundary, least-privilege grants, connection limits and timeouts |
| Authorization | Resolve explicit definition scopes before evaluation, deny empty or widened scopes, and expose no out-of-scope existence, count, cursor, or freshness information. | Adapter owner, caller-scope authority, scope expiry/revocation policy |
| Freshness and recovery | Expose only complete `ready` generations; missing/building/stale/failed generations are unavailable, not empty matches. Interrupted rebuilds must be retryable without partial visibility. | Generation trigger, freshness verification policy, retry budget, rebuild concurrency, stale-generation retention |
| Query bounds | Exact identity or bounded predicates only; deterministic ordering, duplicate collapse, and opaque cursors; page size defaults to `25` and must not exceed `100`. | Approved pilot workload and capacity envelope; no arbitrary SQL, full-text search, or raw values |
| Observation | Record identity parity, authorization isolation, generation lag, availability, latency, and query/rebuild outcomes without sensitive payloads or credentials. Correctness parity mismatches and authorization leakage must be zero. | Observation window, latency/error/lag/cardinality thresholds, telemetry access and retention |
| Fallback and expansion | Stop on any correctness/scope/freshness failure; rehearse disabling the service and using definition-scoped lookup without deleting source or generation evidence. | Actual flag/route, rollback owner, recovery objective, pilot and expansion sign-off |

Latency, capacity, observation-window, and retention numbers are deliberately not invented here.
They must be chosen against the owner-approved workload. Zero correctness mismatches and zero
authorization leakage are safety requirements, not a claim that production measurement exists.

## Approval boundaries

1. **Current preparation / private CI evidence:** documentation, file-based CLI, and the existing
   ephemeral fixture only. Keep consumers disabled and retain no-write behavior.
2. **Durable shadow:** requires explicit owner acceptance of target, migration/connection and
   index-writer authority, source scope, authorization, rebuild/backup, telemetry, and abort values.
   Consumers remain disabled; the CI-only shadow approval is not sufficient for this step.
3. **Read-only pilot:** requires accepted durable-shadow evidence, exact consumer scope, bounded
   query behavior, observation thresholds, and a rehearsed fallback. Projection maintenance may
   write only its separately approved storage; authoring and source-data writes remain excluded.
4. **Expansion:** requires a new scope and operator sign-off based on pilot evidence. Authoring
   apply, bulk edit, external identity-provider deployment, and Phase 10 execution require their
   own decisions; they are not implied by any read-model gate.

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
- Interrupt and retry a rebuild through the staged private reference; prove partial generations
  never become visible and only a complete row set publishes `ready` atomically.
- Mark a generation stale and failed; prove strict queries return `read-model-unavailable`.
- Prove duplicate identity matches collapse to one logical-field hit and pagination is stable.

### 3. Validate authorization isolation

- Resolve an explicit caller scope before evaluating the query.
- Use the private scoped authorization helper to intersect requested definitions with the caller
  scope and deny empty or widened scopes.
- Prove an out-of-scope identity returns `forbidden` without existence, count, cursor, or freshness
  leakage.
- Prove an empty or invalid scope fails closed and cannot be widened by an identity key.

### 4. Run shadow verification

- Keep the read model disabled for consumers and compare bounded read-model results with the
  existing definition-scoped lookup.
- Use the private shadow parity harness to compare canonical identities, freshness identity, result
  ordering, API binding context, cursor bounds, and strict error mapping.
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
- two-definition collision, exact API/DB, duplicate-collapse, pagination, stale-state, and
  interrupted-rebuild retry fixture;
- authorization isolation and deny-by-default evidence from the private scoped policy fixture;
- private shadow parity report, pilot metrics, observation-window result, and operator sign-off;
- fallback/rollback execution record.

The completed private evidence is recorded in the
[shadow report](./phase-8-cross-definition-read-model-shadow-report.md). It is not a pilot result
and does not change the disabled flag.

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
