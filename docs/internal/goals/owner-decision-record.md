# DPM Private Owner Decision Record

**Status: interim private-maintenance decision recorded 2026-07-15; formal release and cutover acceptance remain open**

This record captures the current owner decision for the extracted DPM contract plane. It is
deliberately an interim private-maintenance decision, not a public package release approval or a
completed compatibility-adapter cutover.

## Decision

- **Repository:** [`mineclover/data-governance`](https://github.com/mineclover/data-governance)
- **Visibility:** private
- **Default branch:** `main`
- **Owner namespace:** `mineclover`
- **Extraction baseline:** commit `7f1fb3fe1597053d8eec769492b517523569953a`
- **Required verification:** `.github/workflows/ci.yml` runs on pushes to `main` and pull requests
  with Node.js 25, pnpm 10.30.3, build, typecheck, boundary, test, and consumer smoke gates.
- **Package policy:** `@oa-sdk/dpm` remains private and is not published to a public registry.
- **Artifact rehearsal policy:** `dpm.data-binding-artifact.v1` / `1.0` is accepted for private
  extraction rehearsal only.
- **Manifest policy:** `data_definitions` `1.0` remains the frozen structural compatibility
  contract; `1.1` remains experimental and has no public compatibility promise.
- **Source transition:** `oa-sdk/packages/dpm` remains the source/compatibility implementation
  until a formal compatibility window and adapter cutover decision are recorded.

## Evidence

- External repository creation and initial push: `7f1fb3f`.
- External owner CI workflow push: `8ab1c66`.
- Repository governance check: GitHub Issues are enabled at
  `https://github.com/mineclover/data-governance/issues` as the current issue/review
  location; formal release authority is still unconfirmed.
- Canonical owner-document set and reproducible link gate: `ffa9f5c`, `591aefb`, and
  `0c14ad9`; owner CI run
  [29352088888](https://github.com/mineclover/data-governance/actions/runs/29352088888)
  passed the build, typecheck, boundary, documentation, test, and DPM consumer-smoke checks.
- External build, typecheck, boundary, 120 test files/269 tests, package subpath, declaration,
  packed runtime, workflow, rollback, and pack checks passed before the owner CI was added.
- The repository remains private on GitHub and tracks `origin/main`.

## Open formal sign-off

The following decisions remain intentionally open and must be recorded before a public release or
monorepo adapter cutover:

1. Name the formal release authority. The current issue/review location is GitHub Issues at
   `https://github.com/mineclover/data-governance/issues`.
2. Define the compatibility window and deprecation release for existing `@oa-sdk/dpm` imports.
3. Select license, package metadata, registry scope, and any future publication policy.
4. Canonically link the roadmap, Goal 68, migration contract, and this decision record.
5. Attach a review/sign-off reference for the rollback fixture and accepted artifact contract.
