# Phase 10 Runtime Contract

**Status: design draft; no runtime implementation or execution authorized**
**Started: 2026-10-24**

This is the P10.1 contract draft. It defines the boundary between the published DPM artifact and a
future separately owned data-plane runtime. It contains no production endpoint, credential, vault
integration, database driver, or source-data operation.

## Contract boundary

```text
DPM artifact + freshness + provenance + approved scope
                         │
                         ▼
separate runtime job contract
  ├─ validate input and approval
  ├─ plan/checkpoint batches
  ├─ transform through approved tokenization boundary
  ├─ reconcile source/target integrity
  └─ emit audit/metrics/rollback evidence
```

The runtime consumes the published DPM contract. It does not import `src/**`, mutate DPM
definitions, or add production behavior to `@oa-sdk/dpm`.

## Job input

A future job must include:

- immutable DPM artifact identity and content hash;
- source and target system references without embedded credentials;
- artifact freshness identity and provenance links;
- explicitly approved definition/field scope;
- tokenization policy/version reference;
- requested execution mode and rollback strategy;
- owner-approved change record and idempotency key.

The runtime must reject missing, stale, unverifiable, out-of-scope, or previously conflicting input.

## Job lifecycle

Allowed states:

```text
planned → approved → running → completed
                    ├→ paused → running
                    ├→ failed
                    └→ rolled-back
```

Rules:

- `planned` is immutable after approval except through a new revision;
- only an authorized owner can move `planned` to `approved`;
- `running` requires a verified artifact, scope, vault boundary, and checkpoint;
- `paused` must preserve the last committed checkpoint and be resumable or explicitly aborted;
- `failed` requires diagnostics without raw values and an abort/rollback decision;
- `rolled-back` is terminal and must reference restore/reversal evidence;
- `completed` requires reconciliation and post-run integrity evidence.

## Checkpoint and idempotency

- Every batch has a stable job, artifact, scope, and checkpoint identity.
- Replaying a completed batch must be a no-op or a verified equivalent operation.
- Retry budgets and poison-record behavior are explicit job inputs.
- A partial batch must never be reported as complete.
- The runtime must record a clear point of no return before any irreversible action.

## Tokenization boundary

The contract references a tokenization policy and version; it does not select a cryptographic
algorithm here. A future security-approved design must define:

- key/token domain and tenant separation;
- deterministic versus randomized behavior;
- key rotation and historical token resolution;
- collision and reprocessing policy;
- vault access and break-glass audit;
- prohibition on returning raw values or secrets in job output.

## Integrity and audit output

Required outputs are value-free operational records:

- source/target counts and cardinality checks;
- relationship/orphan/referential-integrity results;
- artifact and freshness identities;
- batch/checkpoint outcomes and retry history;
- actor, approval, scope, timestamps, and runtime version;
- rollback/restore evidence and final disposition.

Threshold failure must abort or pause the job according to the approved policy. A successful exit
must never mean only that a worker process finished.

## Error classes

| Class | Example | Required behavior |
| --- | --- | --- |
| `input-invalid` | malformed or out-of-scope artifact | reject before execution |
| `input-stale` | freshness/provenance mismatch | reject and require new plan |
| `authorization-denied` | missing or widened scope | fail closed without existence leakage |
| `tokenization-failed` | vault/key/collision failure | pause or abort; no silent fallback |
| `checkpoint-conflict` | replay or concurrent job | stop and require reconciliation |
| `integrity-failed` | orphan/cardinality threshold breach | abort/rollback according to policy |
| `rollback-failed` | restore/reversal evidence incomplete | escalate to abort authority |

## Exit gate for P10.1

P10.1 is ready for synthetic implementation only when the interim design owner accepts:

1. lifecycle and transition rules;
2. artifact/freshness/scope validation;
3. checkpoint and idempotency semantics;
4. tokenization boundary responsibilities;
5. integrity and audit output requirements;
6. error and rollback semantics;
7. the prohibition on production execution during the next synthetic phase.

Production runtime ownership, security approval, deployment authority, and real-data access remain
separate gates tracked in [Issue #5](https://github.com/mineclover/data-governance/issues/5).
