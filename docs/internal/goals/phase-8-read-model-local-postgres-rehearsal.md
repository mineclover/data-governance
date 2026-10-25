# Phase 8 Read-Model Local PostgreSQL Rehearsal

**Status: isolated local validation passed; container/data removed; consumers remain disabled**
**Date:** 2026-10-25
**SQL candidate:** `c73e166`, private `proposal-1`
**Execution change record:** this report (`read-model-local-validation-2026-10-25`)

The user authorized proceeding from offline SQL contracts to actual PostgreSQL validation.
This authorization is limited to disposable local synthetic fixtures. It does not activate a
package/CLI storage adapter, consumers, managed staging, production, authoring mutation, or Phase 10.

## Bounded execution conditions

| Item | Local rehearsal value |
| --- | --- |
| Intended owner / abort authority | `mineclover`; agent stops and cleans up on failure |
| Executor | OpenCode, for this user-requested local validation only |
| Docker endpoint | Local Unix socket; no remote Docker context |
| Cached PostgreSQL image | `postgres:17-alpine`, pinned to `sha256:742f40ea20b9ff2ff31db5458d127452988a2164df9e17441e191f3b72252193`; no image pull |
| Database / restore target | New `dpm_read_model_rehearsal` / `dpm_read_model_restore` inside one disposable container |
| Namespace | `dpm_read_model`, created only in these empty disposable databases |
| Input | Existing synthetic customer/billing published-revision fixtures, normalized through the built offline CLI |
| Network / mounts | `--network none`; no ports, bind mounts, or persistent volumes; tmpfs data/runtime/temp paths and read-only root filesystem |
| Authentication / transport | Random one-run SCRAM password, never committed or reported; container-internal Unix sockets only, so no TCP/TLS endpoint is exposed |
| Resources / sessions | At most 1 CPU / 512 MiB; no application pool, at most 3 concurrent psql sessions; connection limit 10 |
| Timeouts | Statement 15 s, lock 3 s (500 ms in the deliberate contention test), idle-in-transaction 10 s; bounded subprocess deadlines |
| Roles | Disposable bootstrap/migration superuser `rehearsal_admin`; this does not validate least-privilege runtime roles or grant a real builder/source-registrar identity |
| Retention / cleanup | No retry on failed acceptance; preserve only non-secret evidence, then stop/remove the exact created container and its tmpfs data |
| Observation / acceptance | One bounded synthetic run; zero unexpected SQL errors, completeness/parity mismatches, or obsolete ownership writes; no production latency/lag or on-call claim |

## Results

**PostgreSQL:** `17.10` on the pinned cached image above.
**Result:** 19 acceptance checks passed, zero unexpected failures.
**Cleanup:** container `dpm-read-model-local-f1971b62bc4a` was stopped/removed; no persistent volume
or host data mount existed. Final inspection confirmed the container no longer existed.

| Check | Result |
| --- | --- |
| Isolation: tmpfs only, read-only root, no network/ports/persistent volumes | Passed |
| Four-record schema applied to empty database | Passed |
| All 10 parameterized statements accepted by PostgreSQL `PREPARE` | Passed |
| Source registration and unchanged registration returning zero rows | Passed |
| Scoped attempt start; incomplete ready and pointer publication rejected | Passed |
| Unknown object and changed projection payload rejected | Passed |
| Canonical fixture row staging | Passed |
| Duplicate staging produces the expected uniqueness violation | Passed |
| Pointer rejection followed by rollback restores attempt to building and leaves pointer absent | Passed |
| Complete ready and pointer publication in one transaction | Passed |
| Duplicate attempt lookup leaves writer epoch unchanged | Passed |
| Identical-source retry fences obsolete append/complete/fail | Passed |
| Independent session blocks on source row and reaches the expected lock timeout | Passed |
| Waiting session re-reads committed source change and rejects obsolete publication/failure | Passed |
| New attempt recovers against the changed source expectation | Passed |
| Missing authorized scope member prevents partial ready success | Passed |
| Independent definition reuses an attempt ID without interference | Passed |
| Namespace keys isolate otherwise identical definition/attempt IDs | Passed |
| `pg_dump` to a separate empty restore database preserves all scoped records and ready status | Passed |

The schema/statement strings were exported unchanged from the private module. Synthetic expected
projections came from the built offline CLI over `customer-before-revision.json` and
`billing-revision.json`. A one-off harness in the approved OpenCode scratch directory invoked
container-local `psql`, held source locks in explicit transactions, asserted affected row counts,
and compared complete restored records. No database driver, app client/adapter, permanent runner,
container launcher, or default CI dependency was added to the repository.

PostgreSQL `PREPARE` checked syntax and parameter inference. Lifecycle statements were exercised
with trusted synthetic literal bindings through `psql`/assertion blocks; this is not validation of
a production client's parameter-binding or connection implementation.

| Record | Count before backup and after restore |
| --- | --- |
| Source expectations | 3 |
| Build attempts | 6 |
| Projected fields | 6 |
| Ready pointers | 3 |

Non-secret machine-readable evidence is retained in
[the local result record](./evidence/read-model-postgres-local-2026-10-25.json).
Temporary DB contents, bootstrap password, and dump stream are not retained as repository artifacts.

## Evidence limits

- This is one bounded local PostgreSQL version/image/run, not a production deployment or workload.
- Schema and lock/rollback behavior were exercised as a disposable bootstrap superuser. Namespace
  predicates are not proof of least-privilege roles, RLS, source-registrar enforcement, or IdP policy.
- Scope IDs were supplied as already resolved inputs. No production authorization, revocation,
  external freshness reconciliation, or complete durable search/pagination adapter was exercised.
- The tested two-session contention cases are not an exhaustive concurrency/crash or long-running
  recovery suite. No production capacity, TLS/network, retention, on-call or monitoring SLA is proven.
- Local backup/restore parity is not a managed backup service or production disaster-recovery result.
- The 19 local acceptance checks are separate from the 19 offline SQL structural tests and the
  81 reference tests; do not add them to the Vitest suite count.

## Remaining boundary

The [local staging design](./phase-8-read-model-local-staging-design.md) still governs future
integration. Any real driver/client, adapter, role deployment, consumer route, external source
reconciliation or broader environment needs separate approval. Default `verify`/CI must not acquire
a Docker/database prerequisite as a result of this one-run validation.
The one-off permission has been exercised and cleaned up; it is not standing approval to create
another database, enable durable shadow/pilot, or broaden the execution scope.
