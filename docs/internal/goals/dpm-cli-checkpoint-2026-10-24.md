# DPM Management CLI and Read-Model Handoff

**Original checkpoint:** 2026-10-24
**Updated:** 2026-10-25
**Repository:** `mineclover/data-governance`
**Verified implementation:** `be47ccc` (this handoff is a subsequent documentation refresh)
**Branch at implementation handoff:** `main` clean and synchronized with `origin/main`
**Recorded published package:** `@oa-sdk/dpm@0.1.3`, OIDC-published 2026-10-24

This is the current resumption/handoff document; the original filename is retained for existing
links and the authoring boundary guard. Subsequent CLI/read-model maintenance is committed in the
repository but has not been published as a new npm version. Local verification below is not a
claim of a new remote CI run or release authorization.

## Repository and product placement

- Work in `/Users/junwoobang/workflow/data-governance`, not the historical
  `/Users/junwoobang/workflow/oa-sdk` mirror.
- DPM contract/control-plane work is canonical here. The `@oa-sdk/dpm` namespace is preserved;
  the OA SDK monorepo copy is maintenance-only and non-publishing, not Core Platform scope.
- DPM cross-definition lookup is not the Spec-Lens source/spec observation index.
- Actual data movement, tokenization, vault access, and data recovery belong to the separately
  owned Phase 10 data plane, not this CLI or read-model maintenance.

## Current state

The file-based `oa-dpm` management CLI is implemented and remains read-only with respect to
external systems. The current surface covers:

- core `validate`, `compile`, and `dry-run` commands;
- registry snapshot `summary` and `list` commands;
- captured profile `inspect` and `analyze` commands;
- authoring `inspect`, bounded offline `search`, `diff`, `review`, `apply-plan`, `rollback-plan`,
  `audit`, and `validate` commands;
- JSON output by default and concise text output through `--format text`;
- grouped command help and global version routing;
- built binary smoke coverage, including expected validation failures.

### Review and search contracts

- `review --fail-on-approval-required true|false` is review-only; the default is `false`.
  With `true`, no changes return `0`, approval-required changes return `1`, and invalid inputs
  or use on another authoring command return `2`. JSON/text reports remain on stdout.
  This detects required review; it does not verify or grant approval.
- Audit validation checks timestamp parsing, duplicate event IDs, and chronological ordering.
- Search uses only explicitly supplied published revision files and freshness identities.
  Empty/unsupported predicates, invalid identity/locator inputs, and malformed cursor tuples
  return `invalid-query` with exit `2`; text output includes `searchStatus` and `reason`.
- Generated cursor continuations remain supported. Cursors are positions, not authorization
  tokens, signatures, query bindings, or cross-generation snapshot guarantees.

### Private read-model hardening

- Known latest non-ready generations and missing authorized definitions fail closed instead of
  serving old/partial results. Unauthorized generation existence/state does not alter permitted
  results, cursors, or continuation pages.
- Default page size `25`, maximum `100`, ordering, duplicate collapse, and shadow fault detection
  have positive and negative conformance coverage.
- Replacing a generation invalidates older sessions for that definition/revision, including
  identical-freshness retries. Obsolete append/complete/fail cannot overwrite the replacement.
- State changes cannot revive cancelled sessions or promote incomplete staged rows to `ready`.
  Terminal sessions remain closed; independent definitions retain isolated sessions.
- These are ephemeral, single-instance checks. They do not discover unindexed source revisions,
  prove external freshness/revocation, implement distributed locks, or prove durable isolation.

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

The existing package already contains representative authoring helpers and injected storage
contracts; their presence is not permission to expose CLI mutation or connect a durable backend.
Definition publication is also distinct from npm publication and from source-row rewriting.

## Selected constraints and unresolved owner inputs

The user-selected conservative values remain recorded as proposals, not activation approvals:

| Decision | Recorded value |
| --- | --- |
| Initial scope | Dry-run only |
| Authorization | Owner-injected default-deny roles |
| Persistence | No writes; ephemeral/injected rehearsal only |
| Idempotency | Required for definition/base-revision scope; retention TBD |
| Audit / rollback | Plan-only; no operational event or revision creation |
| Authoring mutation operational owner | Identifier still TBD; repository release ownership is not a production on-call assignment |

Every mutation approval checkbox remains unchecked. Read-model CI-only shadow evidence does not
approve durable shadow, a consumer pilot, migration, connection, or production deployment.

For the separate read-model follow-on, the user selected `mineclover` as the intended operational
owner and **staging design only** on 2026-10-25. The activation packet now contains the proposed
synthetic-input topology, projection-writer/reader role separation, staging acceptance and stop
criteria. This does not change the authoring mutation owner, approve any durable execution, or
assign production on-call authority. The user subsequently selected isolated disposable local
PostgreSQL as the staging design baseline. The
[local staging design](./phase-8-read-model-local-staging-design.md) now describes logical records,
durable session/transaction and freshness requirements, and acceptance scenarios. Actual instance,
version/image pin, namespace, roles, retention, thresholds, recovery, and the execution change
record remain pending; no SQL, driver, container, or connection was added or run.

## Key implementation locations

- `packages/dpm/src/cli/runner.ts` — top-level dispatch, grouped help/version routing.
- `packages/dpm/src/cli/runner-authoring.ts` — authoring inspect/search/review/plan/audit/validate.
- `packages/dpm/src/cli/result.ts` — JSON/text result formatting and search failure reasons.
- `packages/dpm/src/cli/runner-registry.ts` — registry snapshot read-only commands.
- `packages/dpm/src/cli/runner-profile.ts` — profile artifact read-only commands.
- `packages/dpm/test/cli-authoring.test.ts` — authoring CLI behavior and diagnostics.
- `packages/dpm/test/package-cli-smoke.mjs` — built `dist/cli/index.js` smoke boundary.
- `packages/dpm/src/authoring/read-model-contract.ts` — private projection/query and rebuild ownership.
- `packages/dpm/src/authoring/read-model-shadow.ts` — private fallback parity comparison.
- `packages/dpm/src/authoring/read-model-authorization.ts` — injected definition-scope isolation.
- `packages/dpm/test/authoring-read-model-contract.test.ts` — 81 private conformance tests.
- `docs/internal/goals/roadmap-checkpoint.md` — canonical routine roadmap/evidence record.

## Verification snapshot

Local `CI=true pnpm verify` passed for implementation `be47ccc`:

- `pnpm verify` — full build, typecheck, gates, tests, and DPM smokes;
- DPM full suite: **134 files / 422 tests**;
- projection contract: **4 files / 30 tests**;
- private read-model fixture: **1 file / 81 tests**, included in the DPM total;
- `pnpm --filter @oa-sdk/dpm smoke:cli` — built binary positive and negative paths;
- built CLI smoke compares authoring fixture bytes and directory entries after every command,
  including approval-required and invalid-input failures; this is input-integrity evidence,
  not a filesystem sandbox or proof against writes elsewhere;
- built CLI smoke also verifies `review --fail-on-approval-required true` returns exit code `1`
  with machine-readable approval diagnostics and no stderr/mutation;
- `pnpm check:authoring-cli-boundary` — static guard for non-executable apply plans, deferred
  mutation, and the authoring demo smoke gate;
- root `pnpm verify` now includes `demo:authoring` through `smoke:dpm`;
- subpath, extraction, consumer-workflow, and pack smoke;
- `pnpm --filter @oa-sdk/dpm demo:authoring` — authoring inspect, diff, review, apply-plan, audit,
  validation, offline search, rollback-plan, and approval-failure CI-gate rehearsal with
  `mutation: none`;
- docs, roadmap, operational-change, read-model contract/activation/shadow, T1 readiness, and
  boundary checks.

The customer-orders, storage, and captured-profile demos passed earlier in the CLI work; unlike
`demo:authoring`, they are not part of the current root `verify` command. Do not present those
earlier runs as fresh evidence for this handoff.

Run from the canonical repository root when resuming:

```bash
git status --short --branch
CI=true pnpm check:read-model-shadow
CI=true pnpm check:authoring-cli-boundary
CI=true pnpm check:read-model-contract
CI=true pnpm check:read-model-activation
CI=true pnpm check:docs
CI=true pnpm check:roadmap
CI=true pnpm verify
```

Keep builds and package smokes sequential: several commands rebuild the same `dist` directories.
Build/test artifacts are not operational revision/audit/index persistence.

## Recent implementation references

| Commit | Change |
| --- | --- |
| `23e1587` | Review-only approval option, no-change success, invalid-input/output regression coverage |
| `e23de30` | Built CLI fixture-byte and directory-entry preservation checks |
| `58c9296` | OA SDK ownership distinction and read-model operational approval boundaries |
| `49b7888` | Negative read-model/shadow conformance evidence |
| `92aeb32` | Fail-closed query/cursor validation and search text diagnostics |
| `be47ccc` | Rebuild session ownership and incomplete-ready protection |

## Recommended continuation

This work unit is complete; no additional implementation or activation is implied by the handoff.

1. Maintain the current read-only CLI, private conformance, and consumer evidence. Re-check git
   state rather than assuming this recorded clean snapshot is still current.
2. For the first operational follow-on, review the staging design in the read-model activation
   packet and local PostgreSQL design with intended owner `mineclover` and Issue #4. Review the
   proposed records/protocols, name the exact local instance and execution authorities, and
   approve projection-writer authority, durable target configuration,
   source reconciliation, authorization, observation, backup/restore, and fallback before durable
   shadow. Approve the consumer read-only pilot separately; keep consumers disabled beforehand.
3. Only after a separate mutation decision, consider automatic authoring apply with durable
   authorization/concurrency/idempotency/audit/rollback contracts. Bulk authoring follows accepted
   read-model and mutation foundations; it is not the next unapproved task.
4. Keep Phase 10 as a separate owner/security/deployment program. Its plans/synthetic evidence
   are reference-only and not required DPM release/CI gates.
5. Any new package release requires the existing owner-approved T1/release process. Do not bump,
   tag, publish, or change the historical mirror as a routine resumption step.

The prepared contract is documented in
[`phase-8-authoring-mutation-entry-contract.md`](./phase-8-authoring-mutation-entry-contract.md);
it is not an activation decision. Owner inputs are collected in the
[`phase-8-authoring-mutation-review-checklist.md`](./phase-8-authoring-mutation-review-checklist.md).

The prepared cross-definition read-model contract remains evidence-only; its persistent index,
external authorization, and consumer route remain disabled.
See the [activation packet](./phase-8-cross-definition-read-model-activation-packet.md) for pending
operational values and the [shadow report](./phase-8-cross-definition-read-model-shadow-report.md)
for evidence and its limitations.
