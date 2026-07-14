# Goal 68 Extraction Migration and Rollback Contract

**Status: private owner repository, CI, document gate, and issue/review location verified 2026-07-15; formal external owner acceptance pending**

> Parent: [Goal 68 — DPM Logical Data Definition and Extraction Boundary](./goal-68-dpm-logical-data-definition-boundary.md)

The owner handoff gates and empty sign-off record are tracked in the
[Goal 68.4 External Extraction Acceptance Checklist](./goal-68-extraction-acceptance-checklist.md).

This document is the temporary migration contract for moving the DPM contract plane from the
maintenance-only monorepo package to the private
[`mineclover/data-governance`](https://github.com/mineclover/data-governance) owner candidate. It defines what
can be copied or adapted, what must remain byte/version compatible, and how to roll back without
silently changing logical data identity.

## Current boundary

- The source implementation remains `mineclover/oa-sdk/packages/dpm` during the acceptance window.
  The private external owner candidate contains the initial extraction at commit `7f1fb3f`;
  this package becomes a compatibility adapter only after the owner accepts this contract.
- `@oa-sdk/dpm` remains private and non-published. The local extraction rehearsal packages the
  built artifact and resolves a production dependency tree, but it does not claim registry
  publication readiness.
- Consumers must use the package root or declared public subpaths. `src/**`, `dist/chunk-*`, and
  other implementation paths are not compatibility surfaces.
- The stable import set for the data contract is `@oa-sdk/dpm/package`, `@oa-sdk/dpm/data`, and
  `@oa-sdk/dpm/relationship`. Existing profile, catalog, gateway, storage, and publishing
  subpaths remain available to their existing consumers.

## Version migration rules

### Manifest data definitions

| Contract | Migration rule | Rollback rule |
|---|---|---|
| `data_definitions` `1.0` | Frozen structural compatibility. An external adapter may read and re-emit it without adding v1.1-only identity assumptions. | Keep the original v1.0 document and use the previous adapter when v1.1 conversion is rejected. |
| `data_definitions` `1.1` | Experimental identity contract until the external owner accepts the wire shape. Conversion must go through the v1.1 normalizer and preserve object id, revision id, locator, binding id, catalog ref, API pointer, and artifact hash. | Never downgrade by dropping identity fields. Preserve the v1.1 source and roll back the adapter/package version instead. |

Changing a logical object id, revision id, catalog snapshot hash, API artifact hash, JSON Pointer,
or binding target is an identity/freshness change. It requires a new compiled plan identity and
must not reuse a previous plan as if it were fresh.

### Neutral data-binding artifact

- `kind: dpm.data-binding-artifact.v1` and `version: 1.0` are immutable wire markers for the
  rehearsal contract.
- An additive optional field may be introduced only through an explicitly accepted compatible
  artifact revision. A required-field, identity, hash, or semantic change requires a new artifact
  kind/version and a migration adapter.
- A consumer must reject an unknown artifact kind/version rather than guessing a shape.
- The artifact's deep-frozen logical/API/catalog records, freshness tuple, and provenance links
  are copied into a read model; the consumer must not mutate the source artifact in place.

## Package migration sequence

1. The external owner accepts this document, the neutral artifact kind/version, and the
   compatibility window.
2. The external package publishes the declared public subpaths and runs the clean consumer smoke
   against its own package artifact and dependency tree.
3. Consumers switch imports only to declared package names/subpaths; no source or deep chunk import
   is introduced.
4. The monorepo package remains as an adapter for the agreed compatibility window and forwards or
   re-emits the accepted artifact without changing identity fields.
5. After the window, the owner may deprecate an old import surface only with a release note,
   migration example, and a passing rollback fixture.

## Rollback procedure

If external extraction or a consumer migration fails:

1. Stop the external package/version rollout; do not mutate published artifact records or rewrite
   v1.0/v1.1 manifests in place.
2. Restore the last accepted adapter/package version and its corresponding artifact kind/version.
3. Recompile plans from the preserved manifest, catalog snapshot, API artifact hash, and registry
   snapshot. A changed freshness hash must produce a new plan identity.
4. Keep the failed external artifact and diagnostic output for review, but exclude it from the
   executable read model until it passes validation and provenance checks.
5. Resume migration only after the owner updates the compatibility contract and the external
   consumer smoke plus package/type/gateway checks pass again.

## Evidence

- Local packed-artifact rehearsal: `packages/dpm/test/package-extraction-smoke.mjs`.
- Clean runtime consumer fixture: `packages/dpm/test/external-consumer-fixture.mjs`.
- Clean declaration consumer fixture: `packages/dpm/test/external-consumer-type-fixture.ts`,
  compiled with `tsc --noEmit` against the packed package's public declarations.
- Clean rollback consumer fixture: `packages/dpm/test/external-consumer-rollback-fixture.mjs`,
  proving stale rollout rejection, new plan identity for changed freshness, and restoration from
  preserved inputs.
- Owner handoff checklist: `docs/internal/goals/goal-68-extraction-acceptance-checklist.md`.
- Public package/type smoke: `packages/dpm/test/package-subpath-import-smoke.mjs` and
  `packages/dpm/test/package-subpath-type-consumer.ts`.
- Interim owner decision record: `docs/internal/goals/owner-decision-record.md`. GitHub Issues and
  the structured owner acceptance form are enabled as the current issue/review workflow. Owner CI
  workflow [29353177517](https://github.com/mineclover/data-governance/actions/runs/29353177517)
  passed for commit `60c6c36` with Node.js 25 and pnpm 10.30.3.
- Formal owner acceptance, registry publication, compatibility-window decision, and canonical
  adapter transition remain intentionally pending; they are not implied by the rehearsal.
