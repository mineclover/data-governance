# Phase 10 Vault and Tokenization Design

**Status: design draft; no vault, key, or tokenization execution authorized**
**Started: 2026-10-24**

This is the P10.2 design artifact. It defines the future vault/key-management and tokenization
boundaries consumed by the runtime contract. It does not select a vendor, create keys, access real
data, resolve tokens, or implement a worker.

## Boundary

```text
Phase 10 runtime
  ├─ requests token operation with approved domain/version
  ├─ never receives master keys or unrestricted vault credentials
  └─ records value-free operation/audit identity
       │
       ▼
separate vault/key-management service
  ├─ key custody and rotation
  ├─ token mapping policy
  ├─ access and break-glass controls
  └─ security/audit evidence
```

The DPM contract contains logical identity, binding, freshness, and policy references. It must not
contain raw values, token mappings, encryption keys, vault credentials, or reversible secrets.

## Key-management lifecycle

Every future key domain must have an explicit lifecycle:

```text
planned → generated → active → retiring → retired → destroyed
```

Rules:

- key generation occurs only in the approved key-management boundary;
- master keys never enter job logs, artifacts, fixtures, package code, or worker environment files;
- rotation creates a new version and preserves an approved historical resolution policy;
- retiring keys may resolve existing authorized tokens only when policy allows it;
- retired/destroyed keys cannot be silently substituted or recreated with the same identity;
- recovery and break-glass access require two-person approval, expiry, and immutable audit;
- deletion requires retention/legal approval and evidence that dependent mappings are handled.

## Tokenization policy contract

A runtime job must reference a versioned tokenization policy containing at least:

- tokenization domain/tenant boundary;
- policy and algorithm version identifier;
- deterministic or randomized mode;
- canonical input identity and normalization rules;
- output format/length/character constraints;
- collision detection and response;
- reprocessing/idempotency behavior;
- key-version selection and rotation behavior;
- allowed detokenization direction, if any;
- retention and deletion relationship to the source record.

The algorithm and cryptographic parameters remain a future security-owner decision. The DPM
contract must not guess them from field names, database coordinates, or display metadata.

## Determinism and identity domains

Determinism is a policy choice, not a global default:

| Mode | Use | Required control |
| --- | --- | --- |
| Deterministic | Preserve approved joins across datasets | Explicit domain/key version, canonical normalization, collision test |
| Randomized | Reduce correlation where joins are not required | Mapping persistence, replay policy, authorized recovery path |
| Hybrid | Different obligations by field/domain | Per-field policy version and explicit cross-domain compatibility rules |

The same source value must not produce the same token across unrelated tenant/security domains unless
an explicit approved policy says so. A token operation must include domain, policy version, key
version, and canonical input identity; a raw value alone is never a sufficient idempotency key.

## Access model

- Runtime identity receives only the minimum operation permission for the approved job scope.
- Key administration, token issuance, detokenization, rotation, and deletion are separate
  permissions.
- Detokenization is disabled by default and requires an independently approved use case.
- Operators cannot read token mappings through ordinary job or audit queries.
- Emergency access is time-limited, reason-bound, dual-approved, and audited.
- External OIDC/RBAC integration is not implemented by this repository; the future runtime must
  provide the adapter and deny-by-default tests.

## Failure and collision policy

The runtime must fail closed for:

- unknown policy or key version;
- key-domain mismatch;
- malformed or non-canonical input;
- collision or unexpected duplicate mapping;
- vault timeout, unavailable key, or authorization ambiguity;
- replay with incompatible policy/freshness identity;
- attempted detokenization outside the approved scope.

No failure may fall back to plaintext, an unversioned key, a guessed policy, or a newly generated
token that breaks referential integrity.

## Synthetic design evidence

Before any non-production integration, synthetic fixtures must prove:

1. equal canonical inputs join only inside the approved deterministic domain;
2. distinct domains do not correlate by default;
3. policy/key rotation preserves the explicitly approved historical behavior;
4. retry/replay is idempotent and does not create conflicting mappings;
5. collisions stop the job and produce value-free diagnostics;
6. unauthorized token read or detokenization fails closed;
7. logs and audit records contain no raw values, keys, or mapping contents;
8. deletion/retention behavior is represented without real data.

## Required security decisions

P10.2 cannot exit design review until the security/key-management owner accepts:

- custody boundary and vendor/provider responsibilities;
- key generation, rotation, recovery, retirement, and destruction;
- deterministic/randomized policy by data domain;
- collision and reprocessing behavior;
- detokenization prohibition or explicit approval path;
- least-privilege roles and break-glass procedure;
- audit, monitoring, retention, and incident response requirements.

Until then, this is a synthetic-only design artifact. No key, vault, token mapping, or live
tokenization operation is created.
