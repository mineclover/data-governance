# DPM Owner Decision Record

**Status: `@oa-sdk/dpm@0.1.3` OIDC-published 2026-10-24; repository public (confirmed 2026-10-24)**

> **Amendment 2026-10-24:** the repository is public, and `@oa-sdk/dpm@0.1.3` is the latest npm
> version published through GitHub Actions OIDC. The prior `0.1.2` release used `NPM_TOKEN`.
> Phase 10 data-plane scope remains explicitly deferred.

This record is the accepted owner decision for the extracted DPM contract plane. It authorizes the
approved public package release while preserving the existing import surface. It does not authorize
re-enabling publication from the historical mirror.

## Decisions

- **Canonical repository:** [`mineclover/data-governance`](https://github.com/mineclover/data-governance)
- **Visibility:** public
- **Default branch:** `main`
- **Owning namespace:** `mineclover`
- **Formal release authority:** the `mineclover` repository owner. An explicitly delegated
  maintainer may prepare a release, but owner approval is required for contract/version changes,
  compatibility promises, and adapter cutover.
- **Issue/review location:** [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1)
  and the repository pull-request review workflow.
- **Extraction baseline:** initial extraction recorded in the canonical repository history
- **Required verification:** `.github/workflows/ci.yml` runs on pushes to `main` and pull requests
  with Node.js 25, pnpm 11.28.6, build, typecheck, boundary, documentation, test, and consumer
  smoke gates.
- **Package/publication policy:** publish `@oa-sdk/dpm` to the public npm registry under Apache-2.0
  through the GitHub Actions `publish.yml` workflow using npm Trusted Publishing via GitHub Actions
  OIDC. The repository is public. The historical `v0.1.2` publication used `NPM_TOKEN`; future
  releases must use the configured Trusted Publisher. The previous `@context-action/dpm@0.1.1`
  candidate is superseded.
- **Artifact policy:** `kind: dpm.data-binding-artifact.v1` / `version: 1.0` is accepted as the
  owner contract. Unknown markers or versions must be rejected rather than guessed.
- **Manifest policy:** `data_definitions` `1.0` is the frozen structural compatibility contract;
  `1.1` is deferred experimental and has no compatibility promise.
- **Canonical documents:** this owner repository is canonical for the extraction contract,
  migration/rollback rules, and owner decisions. The `oa-sdk` documents remain the historical mirror.
- **Phase 8 scope:** the representative authoring slice is activated under the separate
  [Phase 8 activation decision record](./phase-8-decision-record.md). This does not change T1 or
  public-release authority.

## Compatibility window

The transition is keyed to owner artifact releases rather than a calendar date:

1. Until the first accepted public package publication, `oa-sdk/packages/dpm` remains the source
   and compatibility implementation.
2. At the approved `@oa-sdk/dpm@0.1.2` publication, the external owner artifact becomes canonical
   and the historical `oa-sdk` repository becomes a non-publishing mirror.
3. Existing `@oa-sdk/dpm` imports remain unchanged; no alternate adapter package is published.
4. Re-enabling publication from the historical mirror requires a separately approved owner decision.

The historical mirror must not publish a competing artifact or add new canonical DPM behavior.
The canonical package must preserve object identity, freshness, and provenance fields.

## Public release gate

The public release proceeded after the owner-approved Issue #2 recorded all of the following:

- public package identity, with `@oa-sdk/dpm` as the selected target;
- registry scope and publication target;
- license and redistribution policy;
- a SemVer release tag or GitHub Release on `main`;
- a successful owner CI run for the selected source ref;
- explicit approval from the `mineclover` repository owner.

The superseded `v0.1.0` and `v0.1.1` GitHub Releases remain immutable. The approved `v0.1.2` tag
defines the publishable artifact transition; its npm publication completed on 2026-07-28 and its
matching GitHub Release was created on 2026-10-23. A normal commit or branch build does not replace
that gate.

Breaking removal of `@oa-sdk/dpm` requires a later separately approved major release with a migration
guide, deprecation notice, and passing rollback fixture.

## Governance enforcement

- `.github/CODEOWNERS` requests `@mineclover` review for every repository change.
- `.github/workflows/release-gate.yml` verifies every `v*` tag is an ancestor of `main` and reruns
  the full owner build, typecheck, boundary, documentation, test, and consumer-smoke gates.
- `docs/internal/goals/t1-readiness.md`, `.github/workflows/t1-preflight.yml`, and the
  `t1-release-approval.yml` issue form provide a candidate/preflight path before T1.
- The release gate does not publish a package. Publication uses `publish.yml` with npm Trusted
  Publishing after the exact `v*` gate succeeds.
- GitHub branch protection is not currently enabled, so CODEOWNERS is a review-routing control until
  required-review enforcement is enabled.

## Rollback acceptance

The packed rollback rehearsal from the extraction baseline proves stale rollout rejection, a new
plan identity for changed freshness, and restoration from preserved inputs. The accepted rollback
rule is to restore the previous adapter/artifact and recompile from preserved manifest, catalog,
API, and registry inputs; a changed freshness hash must never reuse the previous plan identity.

Evidence and owner approval are recorded in [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1).

## Evidence

- External repository creation and initial push: recorded in the canonical repository history.
- Latest external owner CI and document gates: [`29427810791`](https://github.com/mineclover/data-governance/actions/runs/29427810791) for the selected source ref.
- `@oa-sdk/dpm@0.1.2` npm publication: 2026-07-28 (`latest`; repository metadata points to this repository).
- Structured owner acceptance form: `.github/ISSUE_TEMPLATE/dpm-owner-acceptance.yml`.
- Canonical owner document set: [`docs/internal/goals/README.md`](./README.md).
- Migration and rollback contract: [`goal-68-dpm-extraction-migration.md`](./goal-68-dpm-extraction-migration.md).

## Explicitly deferred

- Re-enabling publication from the historical `oa-sdk` mirror without a separate owner decision.
- Broad search, draft/edit/publish, authoring convenience, and other control-plane features beyond
  the activated representative slice.
- Production tokenization, vault execution, row rewriting, and data-plane deployment.

These items require separate product, security, and release-owner decisions and are not implied by
this owner acceptance.
