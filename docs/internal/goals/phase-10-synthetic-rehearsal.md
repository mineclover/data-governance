# Phase 10 Synthetic Rehearsal

**Status: synthetic rehearsal passed; no production execution authorized**
**Verified: 2026-10-24**

This is the P10.3 synthetic-only rehearsal. It uses fixed fake customer/order rows and a clearly
non-production token marker. It does not access a database, vault, credential, external service, or
real personal data.

## Command

```bash
pnpm check:phase10-synthetic
```

## Verified behaviors

- customer/order cardinality is preserved;
- foreign-key-like order-to-customer references remain valid;
- repeated execution is deterministic for the same synthetic policy/domain;
- separate synthetic domains do not share token output;
- an injected partial failure publishes no target rows;
- a successful commit is integrity-checked;
- rollback removes the synthetic committed state;
- output contains counts and booleans only, never fixture values.

## Boundary

- Runtime: local Node.js process only
- Data: synthetic fixture only
- Vault/key service: not used
- Database: not used
- Production credentials: not used
- Source/target mutation: in-memory only
- Phase 10 production execution: still deferred

The rehearsal is evidence for P10.3 design review. It does not select a cryptographic algorithm,
authorize a production tokenization policy, or replace the security/key-management approval required
by [P10.2](./phase-10-vault-tokenization-design.md).
