# Phase 10 Non-Production Integration Plan

**Status: synthetic-only readiness values fixed; no environment or deployment authorized**
**Started: 2026-10-24**

This is the P10.4 non-production integration plan. It defines how a future runtime can be tested in
an isolated environment using synthetic data. It does not provision infrastructure, connect to a
database or vault, create credentials, or deploy a worker.

## Target boundary

```text
isolated non-production environment
  ├─ future Phase 10 runtime worker
  ├─ synthetic source fixture
  ├─ synthetic target fixture
  ├─ vault emulator or explicitly approved non-production vault
  ├─ least-privilege test identities
  └─ redacted logs/metrics and disposable audit evidence
```

The environment must be unable to reach production networks, production databases, production
vaults, or real customer data. The runtime consumes the approved DPM contract and synthetic
fixtures only.

## Required environment decision

Before provisioning, Issue #5 must name and approve:

- environment/provider and account/project boundary;
- network isolation and egress policy;
- synthetic source/target database or fixture service;
- vault emulator or non-production vault and its owner;
- deployment identity and least-privilege roles;
- TLS/certificate and secret-injection method;
- log/metric destination, retention, and redaction policy;
- backup/restore mechanism for the synthetic target;
- abort authority and cleanup owner.

No default cloud provider, database, vault, or credential is selected by this plan.

## Fixed initial rehearsal values

For the next design/rehearsal step only, the following values are fixed:

| Value | Decision |
| --- | --- |
| Organizational owner | `mineclover` |
| Operator/abort authority | `mineclover` repository owner for the synthetic run |
| Provider | GitHub Actions hosted runner |
| Environment | ephemeral CI job, synthetic fixtures only |
| Source/target | in-memory synthetic source and target fixtures |
| Database/vault | none; no external connection or credential |
| Deployment artifact | repository scripts only; no worker deployment |
| Change record | [Issue #5](https://github.com/mineclover/data-governance/issues/5) |
| Rollback | discard in-memory target and preserve redacted result |

These values authorize only the existing local/CI synthetic rehearsal. They do not authorize a
non-production service, database, vault, cloud resource, or production operation.

## Integration sequence

1. **Provision isolation** — create a disposable environment with deny-by-default network egress;
   verify no production route or credential is reachable.
2. **Load synthetic fixtures** — create source/target schemas and relationship fixtures without real
   PII; record fixture version and expected cardinality.
3. **Deploy the candidate** — deploy a versioned runtime artifact with a non-production identity;
   verify artifact/freshness validation and scope authorization before any rewrite.
4. **Exercise the job** — run planned/approved/running/paused/failed/rolled-back/completed paths;
   inject timeout, collision, checkpoint, and integrity failures.
5. **Observe and reconcile** — verify redacted logs, metrics, audit records, counts, relationships,
   orphan checks, and rollback evidence.
6. **Restore and destroy** — rehearse backup/restore, remove synthetic resources, revoke temporary
   identities, and retain only approved evidence.

## Readiness checks

The integration is not ready to run until all checks pass:

- [ ] production network, DNS, database, vault, and secret endpoints are unreachable;
- [ ] all data is synthetic and fixture provenance is recorded;
- [ ] runtime identity has only the approved non-production permissions;
- [ ] vault/key access is test-only and audited;
- [ ] TLS and secret injection are configured without repository-stored secrets;
- [ ] logs contain no raw values, tokens, keys, or credentials;
- [ ] job retry/checkpoint/replay behavior is deterministic;
- [ ] integrity and reconciliation thresholds are defined;
- [ ] abort, rollback, backup/restore, and cleanup paths are rehearsed;
- [ ] an operator and abort authority are present for the test window.

## Evidence required

- environment isolation proof;
- fixture version, source/target counts, and expected relationship graph;
- deployment artifact and configuration identity;
- least-privilege permission review;
- successful and injected-failure job reports;
- reconciliation and rollback report;
- redacted logs/metrics/audit samples;
- cleanup and temporary-credential revocation evidence;
- owner sign-off for the next canary decision.

## Current blocker

P10.3 synthetic rehearsal passed locally. The fixed values above make the next rehearsal boundary
explicit, but they do not authorize a deployed integration. P10.4 remains a readiness plan only;
production execution remains prohibited by the
[Phase 10 runtime boundary decision](./phase-10-runtime-boundary-decision.md).

The fixed synthetic-only rehearsal evidence is recorded in the
[P10.4 rehearsal report](./phase-10-non-production-rehearsal-report.md).
