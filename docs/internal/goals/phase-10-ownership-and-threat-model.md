# Phase 10 Ownership and Threat Model

**Status: design draft; no production execution authorized**
**Started: 2026-10-24**

This is the P10.0 design artifact for a future runtime/data-plane program. It defines the system
boundary, data classes, responsibility gaps, threat scenarios, and required controls without
connecting to real data, a vault, a database, or a deployment environment.

## System boundary

```text
@oa-sdk/dpm contract plane
  └─ accepted DPM artifact + freshness/provenance
       ↓ explicit, approved input boundary
separate Phase 10 runtime
  ├─ job orchestrator
  ├─ tokenization worker
  ├─ vault/key-management adapter
  ├─ source/target connectors
  ├─ reconciliation and integrity validator
  └─ audit/metrics/rollback evidence
```

The DPM package produces and validates the contract. The future runtime consumes that contract; it
does not add production execution code to `@oa-sdk/dpm` or the historical `oa-sdk` mirror.

## Data classification

| Data | Classification | Allowed in this repository? | Future runtime rule |
| --- | --- | --- | --- |
| DPM definitions, bindings, artifact identity, freshness, provenance | Contract metadata | Yes, subject to contract policy | Reject stale/unverifiable inputs |
| Synthetic field values and relationship fixtures | Test data | Yes | Use for all design and rehearsal work |
| Real source rows and PII | Restricted production data | No | Access only through approved runtime boundary |
| Token-to-source mapping | Sensitive security data | No | Keep inside approved vault boundary |
| Encryption keys, credentials, break-glass material | Secret | No | External secret/key-management system only |
| Job/audit/metrics records | Operational metadata | Limited, redacted only | Never include raw values or secrets |

## Responsibility matrix

| Responsibility | Current owner | Required before execution |
| --- | --- | --- |
| DPM contract and artifact | `mineclover/data-governance` | Already assigned |
| Runtime implementation | Not assigned | Named runtime owner |
| Runtime operations/on-call | Not assigned | Named operator and on-call rotation |
| Security/privacy review | Not assigned | Named security/privacy owner |
| Vault and key management | Not assigned | Named key-management owner |
| Source data stewardship | Not assigned | Source owner approval |
| Target data stewardship | Not assigned | Target owner approval |
| Deployment/change authority | Not assigned | Named deployment authority |
| Abort/incident authority | Not assigned | Named authority and escalation path |

The DPM contract owner is not automatically any production runtime owner. Until the missing owners
are assigned, Phase 10 remains design-only.

## Threat scenarios and required controls

| Threat | Impact | Required control/evidence |
| --- | --- | --- |
| Stale or substituted DPM artifact | Wrong fields are transformed | Verify artifact hash, freshness identity, provenance, and approved scope before execution |
| Vault/key compromise | Token reversal or broad data exposure | External vault, least privilege, key rotation, break-glass audit, and separation of duties |
| Raw PII in logs or metrics | Privacy breach | Structured redaction, value-free diagnostics, log review, and retention limits |
| Unauthorized definition scope | Cross-tenant or cross-domain disclosure | Deny-by-default scope policy, explicit approvals, and isolation tests |
| Duplicate or replayed job | Inconsistent or repeated rewrite | Idempotency key, checkpoint, monotonic job state, and replay tests |
| Partial row rewrite | Broken references or mixed identity state | Transaction/batch boundary, resumability, reconciliation, and abort threshold |
| Token collision or domain mismatch | Incorrect identity joins | Versioned tokenization domain, collision policy, canonical-key tests, and cardinality checks |
| Failed rollback | Irreversible data loss | Backup/restore rehearsal, rollback fixture, abort authority, and immutable audit evidence |
| Compromised worker/dependency | Unauthorized data access | Least-privilege runtime identity, signed artifacts, dependency policy, isolation, and audit |
| Operator misuse or emergency access | Unapproved production change | Two-person approval, change record, break-glass expiry, and complete audit trail |
| Data residency/retention violation | Legal or contractual exposure | Residency boundary, retention/deletion policy, target approval, and deletion evidence |

## Required design evidence

P10.0 is complete only when the future runtime owner and security owner accept:

- the responsibility matrix and escalation path;
- the data classification and residency/retention policy;
- the vault/key-management boundary;
- the artifact verification and tokenization threat controls;
- the synthetic-only test boundary;
- the incident, abort, and rollback evidence requirements.

## Current decision

- Design documents and synthetic fixtures are permitted.
- Real data, production secrets, owner-managed databases, vault access, and deployments are not
  permitted.
- The next gate is assignment of the missing owners in [Issue #5](https://github.com/mineclover/data-governance/issues/5).
- Phase 10 execution remains deferred under the
  [runtime boundary decision](./phase-10-runtime-boundary-decision.md).
