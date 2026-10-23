# Phase 8 Cross-Definition Read-Model Shadow Report

**Status: private verification passed; runtime flag remains `disabled`**
**Verified: 2026-10-24**

This report records the private rehearsal and shadow-parity evidence for the first Phase 8
follow-on. It does not authorize a database migration, persistent index, consumer route, external
authorization provider, or production deployment.

## Evidence

- Fixture: `packages/dpm/test/authoring-read-model-contract.test.ts`
- Command:

  ```bash
  pnpm --filter @oa-sdk/dpm exec vitest run test/authoring-read-model-contract.test.ts \
    --maxWorkers 1 --no-file-parallelism
  ```

- Result: **1 test file passed; 7 tests passed**

## Verified behaviors

1. Canonical identity projection excludes raw definition content.
2. Bounded cross-definition lookup collapses duplicate identity matches and produces deterministic
   cursors.
3. Interrupted rebuilds remain unavailable until a complete retry publishes an atomic ready
   generation.
4. Shadow parity matches fallback identity, freshness, ordering, and API binding context.
5. Strict error mapping distinguishes unavailable read models from valid empty results.
6. Authorization scope is isolated and denies empty or widened scopes.
7. Unauthorized scopes, stale generations, and unbounded queries fail closed.

## Boundary confirmation

- Runtime flag: `disabled`
- PostgreSQL migration: not performed
- Owner-managed database connection: not performed
- External OIDC/RBAC integration: not performed
- Public authoring/search route: not enabled
- Automatic mutation, bulk authoring, source rewrite, tokenization, and vault execution: not added

## Next gate

The evidence is sufficient for private contract/rehearsal review. Runtime movement from `disabled`
to `shadow` remains blocked on the operational owner, persistence target, authorization adapter,
observation thresholds, fallback owner, and explicit approval tracked in
[Issue #4](https://github.com/mineclover/data-governance/issues/4).
