# DPM Management CLI Checkpoint

**Checkpoint:** 2026-10-24
**Repository:** `mineclover/data-governance`
**Latest commit:** `5c030fb`
**Branch state:** `main` clean and synchronized with `origin/main`
**Package:** `@oa-sdk/dpm@0.1.3`

## Current state

The file-based `oa-dpm` management CLI is implemented and remains read-only with respect to
external systems. The current surface covers:

- core `validate`, `compile`, and `dry-run` commands;
- registry snapshot `summary` and `list` commands;
- captured profile `inspect` and `analyze` commands;
- authoring `inspect`, bounded offline `search`, `diff`, `review`, `apply-plan`, `audit`, and
  `validate` commands;
- JSON output by default and concise text output through `--format text`;
- grouped command help and global version routing;
- built binary smoke coverage, including expected validation failures.

## Authoring safety boundary

The following are deliberately not implemented in the CLI:

- `authoring apply` or automatic quick-fix mutation;
- draft creation, publish, approval, or rollback execution;
- database, PostgreSQL, audit-store, vault, credential, Kafka, or external connector access;
- persistent cross-definition indexing or runtime search activation;
- Phase 10 data-plane behavior.

`authoring apply-plan` is planning-only and must continue to report `mutation: none` and
`executable: false`. `authoring validate` is a no-write preflight gate. Non-chronological audit
snapshots fail validation with a non-zero exit code.

## Key implementation locations

- `packages/dpm/src/cli/runner.ts` — top-level dispatch, grouped help/version routing.
- `packages/dpm/src/cli/runner-authoring.ts` — authoring inspect/search/review/plan/audit/validate.
- `packages/dpm/src/cli/runner-registry.ts` — registry snapshot read-only commands.
- `packages/dpm/src/cli/runner-profile.ts` — profile artifact read-only commands.
- `packages/dpm/test/cli-authoring.test.ts` — authoring CLI behavior and diagnostics.
- `packages/dpm/test/package-cli-smoke.mjs` — built `dist/cli/index.js` smoke boundary.
- `docs/internal/goals/roadmap-checkpoint.md` — canonical routine roadmap/evidence record.

## Verification snapshot

Passed:

- `pnpm verify` — full build, typecheck, gates, tests, and DPM smokes;
- DPM full suite: **134 files / 329 tests** after audit validation hardening;
- `pnpm --filter @oa-sdk/dpm smoke:cli` — built binary positive and negative paths;
- packed CLI smoke also verifies `review --fail-on-approval-required true` returns exit code `1`
  with machine-readable approval diagnostics and no stderr/mutation;
- `pnpm check:authoring-cli-boundary` — static guard for non-executable apply plans, deferred
  mutation, and the authoring demo smoke gate;
- root `pnpm verify` now includes `demo:authoring` through `smoke:dpm`;
- subpath, extraction, consumer-workflow, and pack smoke;
- `pnpm --filter @oa-sdk/dpm demo` — validate/compile/dry-run and safety diagnostics;
- `pnpm --filter @oa-sdk/dpm demo:storage` — fixture-backed catalog/registry/report flow with no
  source database mutation;
- `pnpm --filter @oa-sdk/dpm demo:profile` — captured Kafka profile analysis, baseline comparison,
  and proposal review without live Kafka access;
- `pnpm --filter @oa-sdk/dpm demo:authoring` — authoring inspect, diff, review, apply-plan, audit,
  validation, offline search, and rollback-plan rehearsal with `mutation: none`;
- docs, roadmap, operational-change, read-model contract/activation/shadow, T1 readiness, and
  boundary checks.

## Recommended continuation

Do not add mutation or runtime activation without the owner-approved Phase 8 entry conditions.
The next work should be one of:

1. maintain consumer/release evidence and run the owner-approved release gate; or
2. prepare a separately approved mutation contract covering authorization, optimistic concurrency,
   audit persistence, dry-run, and rollback before any `authoring apply` implementation.

The prepared contract is documented in
[`phase-8-authoring-mutation-entry-contract.md`](./phase-8-authoring-mutation-entry-contract.md);
it is not an activation decision. Owner inputs are collected in the
[`phase-8-authoring-mutation-review-checklist.md`](./phase-8-authoring-mutation-review-checklist.md).

The prepared cross-definition read-model contract remains evidence-only; its persistent index,
external authorization, and consumer route remain disabled.
