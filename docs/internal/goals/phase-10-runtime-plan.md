# Phase 10 Runtime Plan

**Status: planning only; no runtime execution authorized**
**Plan date: 2026-10-24**

This plan describes how a future production data-plane program could be evaluated and delivered.
It is not an implementation plan for the current `@oa-sdk/dpm` package and does not authorize
production data, credentials, migrations, deployment, or cutover.

## Objective

Build a separately owned runtime that consumes an accepted DPM artifact and safely performs
pseudonymization against approved source and target systems while preserving referential integrity,
auditability, rollback evidence, and security boundaries.

## Scope boundary

### Candidate runtime capabilities

- source/target data movement orchestration;
- deterministic, versioned tokenization;
- vault and key-management integration;
- idempotent row transformation and resumable jobs;
- relationship/cardinality/integrity validation;
- audit, metrics, alerts, reconciliation, and rollback;
- controlled non-production canary and production cutover runbooks.

### Explicitly excluded from this plan's authorization

- access to real customer data or production credentials;
- creation of a vault or tokenization worker in this repository;
- PostgreSQL migration or source database mutation;
- physical foreign-key creation;
- production deployment or cutover;
- automatic mutation through the Phase 8 authoring surface.

## Work phases

| Phase | Purpose | Required output | Exit gate |
| --- | --- | --- | --- |
| P10.0 Ownership and threat model | Assign responsibility and classify risk | Owner matrix, threat model, data classification, residency and retention policy | Runtime, security, deployment, and data-steward owners named |
| P10.1 Runtime contract | Define the worker/job boundary without implementation | Versioned job state, artifact input, tokenization, checkpoint, audit, error, and rollback contracts | Contract review accepts compatibility and failure semantics |
| P10.2 Vault and tokenization design | Define cryptographic and secret-handling boundaries | Key lifecycle, rotation/recovery, access policy, deterministic domain, collision and version policy | Security owner accepts design and break-glass procedure |
| P10.3 Synthetic engine | Prove behavior without real data | Synthetic source/target fixtures, relationship graph, rewrite simulator, reconciliation and rollback evidence | All integrity and idempotency fixtures pass |
| P10.4 Non-production integration | Exercise infrastructure in an isolated environment | Ephemeral or approved non-production deployment, least-privilege roles, observability, backup/restore rehearsal | Deployment and security owners approve canary readiness |
| P10.5 Canary decision | Evaluate bounded workload behavior | Canary metrics, latency/error/cardinality thresholds, incident and abort rehearsal | Explicit canary approval and rollback sign-off |
| P10.6 Production readiness | Decide whether production execution is justified | Production runbook, change record, cutover window, rollback plan, owner sign-offs | Separate production execution decision approved |
| P10.7 Controlled execution | Run only the approved production scope | Monitored job, reconciliation report, audit record, rollback evidence | Post-run integrity and incident review complete |

## Required contract surfaces

1. **Input:** immutable DPM artifact, freshness identity, source/target descriptors, and approved
   scope; reject stale or unverifiable artifacts.
2. **Job lifecycle:** `planned`, `approved`, `running`, `paused`, `failed`, `rolled-back`, and
   `completed` with monotonic transition rules.
3. **Tokenization:** explicit algorithm/version/key domain, deterministic behavior where required,
   collision handling, reprocessing behavior, and no raw secret exposure.
4. **Checkpointing:** idempotent batch boundaries, resumability, retry budget, poison-record handling,
   and a clear point of no return.
5. **Integrity:** preflight counts, relationship/cardinality checks, post-run reconciliation,
   orphan detection, and threshold-based abort.
6. **Audit:** actor, approval, artifact/freshness identity, job, scope, changes, outcomes, and
   rollback evidence without storing raw sensitive values.
7. **Rollback:** reversible mapping or restore strategy, abort authority, backup validity, and
   explicit treatment of irreversible operations.

## Required owners and approvals

- runtime operator and on-call owner;
- security/privacy and key-management owner;
- deployment/change authority;
- source and target data stewards;
- incident/abort authority;
- approval for data residency, retention, deletion, and customer obligations;
- approval for the exact non-production or production environment.

The `mineclover/data-governance` repository owns the DPM contract only. It does not automatically
become any of the operational owners above.

## Stop conditions

Stop and keep execution disabled when any of the following occurs:

- artifact or freshness identity is stale or unverifiable;
- owner scope or authorization is ambiguous;
- vault/key state cannot be verified;
- checkpoint/retry behavior is not idempotent;
- reconciliation, cardinality, or orphan thresholds fail;
- backup/restore or rollback evidence is incomplete;
- monitoring or audit evidence is unavailable;
- a requested change expands scope without a new approval.

## Planning state

Only planning artifacts are authorized by the
[Phase 10 runtime boundary decision](./phase-10-runtime-boundary-decision.md). The missing owner
assignments and execution approvals remain tracked in
[Issue #5](https://github.com/mineclover/data-governance/issues/5). No phase beyond planning starts
until that decision is amended with the required owners and gates.
