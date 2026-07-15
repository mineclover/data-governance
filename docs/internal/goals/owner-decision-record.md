# DPM Private Owner Decision Record

**Status: private owner acceptance recorded 2026-07-15; public registry release remains disabled**

This record is the accepted owner decision for the extracted DPM contract plane. It authorizes
private extraction maintenance and the planned compatibility transition. It does not authorize a
public registry release or removal of the existing import surface.

## Decisions

- **Canonical repository:** [`mineclover/data-governance`](https://github.com/mineclover/data-governance)
- **Visibility:** private
- **Default branch:** `main`
- **Owning namespace:** `mineclover`
- **Formal release authority:** the `mineclover` repository owner. An explicitly delegated
  maintainer may prepare a release, but owner approval is required for contract/version changes,
  compatibility promises, and adapter cutover.
- **Issue/review location:** [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1)
  and the repository pull-request review workflow.
- **Extraction baseline:** commit `7f1fb3fe1597053d8eec769492b517523569953a`
- **Required verification:** `.github/workflows/ci.yml` runs on pushes to `main` and pull requests
  with Node.js 25, pnpm 10.30.3, build, typecheck, boundary, documentation, test, and consumer
  smoke gates.
- **Package/publication policy:** `@oa-sdk/dpm` remains private and is not published to a public
  registry. Public package name/scope, license, and public release metadata are intentionally
  deferred until a separate public-release approval. The recommended future package target is
  `@mineclover/dpm`; this is a naming decision only and does not authorize publication.
- **Artifact policy:** `kind: dpm.data-binding-artifact.v1` / `version: 1.0` is accepted as the
  private owner contract. Unknown markers or versions must be rejected rather than guessed.
- **Manifest policy:** `data_definitions` `1.0` is the frozen structural compatibility contract;
  `1.1` is deferred experimental and has no compatibility promise.
- **Canonical documents:** this owner repository is canonical for the extraction contract,
  migration/rollback rules, and owner decisions. The `oa-sdk` documents remain the historical and
  compatibility mirror until the adapter transition is complete.
- **Phase 8 scope:** the private representative authoring slice is activated under the separate
  [Phase 8 activation decision record](./phase-8-decision-record.md). This does not change T1 or
  public-release authority.

## Compatibility window

The transition is keyed to owner artifact releases rather than a calendar date:

1. Until the first accepted external owner artifact release (`T1`),
   `oa-sdk/packages/dpm` remains the source and compatibility implementation.
2. At `T1`, the external owner artifact becomes canonical and the monorepo package becomes a
   forwarding compatibility adapter.
3. Existing `@oa-sdk/dpm` imports remain supported through one subsequent compatibility release
   after `T1`. That final compatibility release must carry a deprecation notice.
4. Removing the old import surface requires a separately approved breaking release and a passing
   rollback fixture.

The adapter must forward or re-emit accepted artifacts without changing object identity, freshness,
or provenance fields. No new canonical DPM behavior is added to the monorepo during this window.

## Public release gate

The current recommendation is to keep the repository and package private. A future public release
may proceed only after a separate owner-approved issue or pull request records all of the following:

- public package identity, with `@mineclover/dpm` as the default target and `@oa-sdk/dpm` retained
  only as the compatibility adapter;
- registry scope and publication target;
- license and redistribution policy;
- a SemVer release tag or GitHub Release on `main`;
- a successful owner CI run for the exact release commit;
- explicit approval from the `mineclover` repository owner.

That approved tag/release is the definition of the first accepted owner artifact release (`T1`). A
normal commit, a successful branch build, or a private rehearsal does not constitute `T1`. Until
then, no public package metadata or public registry publication is added.

Breaking removal of `@oa-sdk/dpm` requires a later separately approved major release with a migration
guide, deprecation notice, and passing rollback fixture.

## Governance enforcement

- `.github/CODEOWNERS` requests `@mineclover` review for every repository change.
- `.github/workflows/release-gate.yml` verifies every `v*` tag is an ancestor of `main` and reruns
  the full owner build, typecheck, boundary, documentation, test, and consumer-smoke gates.
- `docs/internal/goals/t1-readiness.md`, `.github/workflows/t1-preflight.yml`, and the
  `t1-release-approval.yml` issue form provide a private candidate/preflight path before T1.
- The release gate does not publish a package. Public publication still requires the separate owner
  approval described above.
- GitHub branch protection is not available under the current private-repository plan, so CODEOWNERS
  is a review-routing control until required-review enforcement is enabled.

## Rollback acceptance

The packed rollback rehearsal from the extraction baseline proves stale rollout rejection, a new
plan identity for changed freshness, and restoration from preserved inputs. The accepted rollback
rule is to restore the previous adapter/artifact and recompile from preserved manifest, catalog,
API, and registry inputs; a changed freshness hash must never reuse the previous plan identity.

Evidence and owner approval are recorded in [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1).

## Evidence

- External repository creation and initial push: `7f1fb3f`.
- External owner CI and document gates: [`29381266646`](https://github.com/mineclover/data-governance/actions/runs/29381266646) for commit `03c4436`.
- Structured owner acceptance form: `.github/ISSUE_TEMPLATE/dpm-owner-acceptance.yml`.
- Canonical owner document set: [`docs/internal/goals/README.md`](./README.md).
- Migration and rollback contract: [`goal-68-dpm-extraction-migration.md`](./goal-68-dpm-extraction-migration.md).

## Explicitly deferred

- Public registry publication, public package metadata, and license selection.
- Broad search, draft/edit/publish, authoring convenience, and other control-plane features beyond
  the activated representative slice.
- Production tokenization, vault execution, row rewriting, and data-plane deployment.

These items require separate product, security, and release-owner decisions and are not implied by
this private owner acceptance.
