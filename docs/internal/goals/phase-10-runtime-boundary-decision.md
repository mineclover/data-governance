# Phase 10 Runtime Boundary Decision

**Status: design-only preparation authorized; production data-plane execution deferred**
**Decision date: 2026-10-24**

This decision defines the next safe step for Phase 10 without turning the DPM contract repository
into a production data-plane runtime. It is an owner decision about scope and entry conditions, not
an authorization to access real data or deploy workers.

## Decision

1. Keep production vaults, tokenization workers, source/target data movement, row rewriting, source
   database mutation, physical foreign-key creation, and production operations **deferred**.
2. Authorize only non-executing preparation: threat-model drafts, runtime interface contracts,
   synthetic fixtures, integrity/rollback procedures, deployment topology drafts, and security
   review materials.
3. Keep all Phase 10 implementation outside `@oa-sdk/dpm`; a future runtime must have a separate
   repository/service boundary and must consume the published DPM contract rather than mutate this
   contract package.
4. Do not use production credentials, real personal data, owner-managed databases, or live vaults
   during preparation.

## Ownership decision

| Responsibility | Current decision |
| --- | --- |
| DPM contract owner | `mineclover/data-governance` |
| Runtime operational owner | **Not assigned** |
| Security/privacy owner | **Not assigned** |
| Deployment authority | **Not assigned** |
| Production data steward | **Not assigned** |
| Abort authority | No production execution is authorized; a future runtime owner must name it |

The missing owners are intentional blockers. The DPM repository owner is not automatically the
production runtime, security, or deployment owner.

## Preparation boundary

Permitted without a runtime-owner approval:

- versioned runtime interface and job-state contract drafts;
- vault/tokenization threat model and key-management responsibility matrix;
- synthetic-only source/target fixtures and referential-integrity checks;
- idempotency, retry, checkpoint, audit, and rollback design;
- deployment, observability, incident, and data-retention runbook drafts;
- contract-consumer compatibility tests that do not access live data.

Not permitted:

- connecting to an owner-managed database or vault;
- generating, storing, or resolving production tokens;
- rewriting rows or creating physical constraints;
- importing real PII or secrets into fixtures;
- deploying a worker, enabling a production flag, or performing a cutover.

## Required gates before runtime execution

A separate owner-approved decision must name and accept all of the following:

1. runtime operator, on-call owner, abort authority, and deployment authority;
2. data classification, residency, retention, deletion, and customer-ownership policy;
3. vault/key-management design, rotation, recovery, access boundary, and break-glass procedure;
4. tokenization algorithm, determinism/idempotency domain, collision policy, and versioning;
5. source/target movement, row-rewrite transaction, checkpoint, retry, and resumability contract;
6. referential-integrity, cardinality, reconciliation, and post-run validation thresholds;
7. least-privilege database roles, network/TLS controls, audit, monitoring, alerting, and incident
   response;
8. backup/restore, rollback, abort, retention, and irreversible-change policy;
9. synthetic rehearsal and non-production canary evidence;
10. explicit approval for the target environment and production cutover window.

Until every gate is accepted, Phase 10 remains design-only and the DPM repository remains
maintenance-only for the contract plane.

## Tracking

The design-only decision and missing ownership inputs are tracked in
[Issue #5](https://github.com/mineclover/data-governance/issues/5). Phase 10 remains separate from
the Phase 8 read-model shadow decision in [Issue #4](https://github.com/mineclover/data-governance/issues/4).
