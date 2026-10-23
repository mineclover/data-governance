# `data-governance`

Canonical owner repository for the Data Pseudonymization Manifest (DPM) contract extraction
from `mineclover/oa-sdk`. The repository is public; package publication remains governed by the
owner acceptance record and T1 release gate.

## Current scope

- `@oa-sdk/dpm` owns the logical data definition, explicit API/catalog bindings, neutral artifact,
  and migration/rollback contract.
- `@oa-sdk/openapi-projection-contract` is retained in this workspace as the DPM package's
  dependency contract.
- The repository is public. `@oa-sdk/dpm@0.1.2` was published to npm on 2026-07-28 and is the
  current `latest` version; further releases remain governed by the owner acceptance record.

## Verification

```bash
corepack pnpm install
corepack pnpm build
corepack pnpm typecheck
corepack pnpm check:boundary
corepack pnpm smoke:dpm
```

The DPM extraction smoke covers package-name runtime imports, public declarations, changed
freshness plan identity, stale rollout rejection, and rollback from preserved inputs. It remains
the release-candidate verification for every new version.

The migrated Goal 68 documents are under `docs/internal/goals/`.

The owner decision is recorded in `docs/internal/goals/owner-decision-record.md`. Publication is
gated by the T1 release gate; existing `@oa-sdk/dpm` consumer imports remain unchanged.

## Owner handoff state

The canonical repository was created on 2026-07-15 at
`https://github.com/mineclover/data-governance`. The package snapshot and local migration evidence
were validated here before the `@oa-sdk/dpm@0.1.2` publication on 2026-07-28.
