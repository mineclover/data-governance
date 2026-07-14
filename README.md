# `data-governance`

Private canonical owner repository for the Data Pseudonymization Manifest (DPM) contract
extraction from `mineclover/oa-sdk`.

## Current scope

- `@oa-sdk/dpm` owns the logical data definition, explicit API/catalog bindings, neutral artifact,
  and migration/rollback contract.
- `@oa-sdk/openapi-projection-contract` is retained in this workspace as the DPM package's
  dependency contract.
- The repository is private while the owner acceptance and public package release policy are
  finalized.

## Verification

```bash
corepack pnpm install
corepack pnpm build
corepack pnpm typecheck
corepack pnpm check:boundary
corepack pnpm smoke:dpm
```

The DPM extraction smoke covers package-name runtime imports, public declarations, changed
freshness plan identity, stale rollout rejection, and rollback from preserved inputs. It does not
claim a public registry release until the owner acceptance record and publication metadata are
completed.

The migrated Goal 68 documents are under `docs/internal/goals/`.

The interim owner decision is recorded in
`docs/internal/goals/owner-decision-record.md`. Public publication and monorepo adapter cutover
remain disabled until the formal sign-off items in that record are completed.

## Owner handoff state

The private canonical repository was created on 2026-07-15 at
`https://github.com/mineclover/data-governance`. The package snapshot and local migration evidence
are being validated here before any public registry release is considered.
