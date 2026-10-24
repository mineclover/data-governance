# Phase 8 Cross-Definition Read-Model Shadow Report

**Status: private verification passed; runtime flag remains `disabled`**
**Verified: 2026-10-25**

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

- Result: **1 test file passed; 81 tests passed**

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
8. A known latest generation in `building`, `stale`, or `failed` state cannot fall back to an
   older ready revision, regardless of insertion order. Missing authorized definitions return
   unavailable rather than partial results.
9. A ready latest revision excludes historical hits and leaves the supplied source artifacts unchanged.
10. Unauthorized definitions in missing, ready, building, stale, or failed states do not change
    authorized hits, cursors, continuation pages, or forbidden responses.
11. Page size defaults to `25`; a synthetic 120-hit fixture proves the maximum `100`-hit page and
    continuation contain deterministic, non-duplicated results. Invalid numeric bounds are rejected.
12. Injected identity, freshness, API-binding, ordering, and cursor-presence faults produce shadow
    mismatches; an unchanged control still matches.
13. False empty success for an unavailable model and incorrect failure reasons are detected.
14. Empty/unsupported predicates, incomplete locators, mixed query modes, invalid enum values,
    and malformed identity inputs return `invalid-query` instead of broadening a search, returning
    a false empty success, or throwing a null-input exception. Supported bounded filters still match.
15. Cursor tuples require five non-empty strings and a supported identity kind; malformed base64url
    is rejected while generated cursor continuations remain valid. This is structural validation,
    not cursor signing, query binding, or cross-generation snapshot consistency.
16. Superseded rebuild sessions cannot append, complete, or fail over a replacement generation,
    including a retry with identical revision/freshness. Explicit state changes also invalidate
    session ownership and cannot revive it by setting the generation back to `building`.
17. The state setter cannot publish an incomplete staged generation as `ready`. Unknown/duplicate
    rows and premature completion are rejected without preventing a valid session from finishing.
18. Completed/failed sessions remain closed, and rebuilding separate definitions with the same
    revision ID does not invalidate their independent sessions.

These are ephemeral reference/conformance checks, not production measurements. The fixture receives
the revisions and generation states explicitly; it does not discover a newer unindexed source
revision, prove external freshness reconciliation, or validate a durable database transaction.
Operational source reconciliation, revocation timing, latency/lag thresholds, backup/restore, and
deployment fallback remain separate owner-approved evidence requirements.
Session ownership checks here cover interleaved calls in one ephemeral reference instance; they
are not a distributed lock, a worker scheduler, or evidence of durable transaction isolation.

## Boundary confirmation

- Runtime flag: `disabled`
- PostgreSQL migration: not performed
- Owner-managed database connection: not performed
- External OIDC/RBAC integration: not performed
- Public authoring/search route: not enabled
- Automatic mutation, bulk authoring, source rewrite, tokenization, and vault execution: not added

## Next gate

The evidence and owner values are sufficient for the approved private CI-only shadow rehearsal.
The consumer/runtime flag remains `disabled`; production movement to `shadow` remains blocked on a
separate durable-target, production operational-owner, authorization, and deployment decision in
[Issue #4](https://github.com/mineclover/data-governance/issues/4).
