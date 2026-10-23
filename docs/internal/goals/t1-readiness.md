# DPM T1 Release Readiness

**Status: v0.1.3 OIDC validation release in progress; repository public (confirmed 2026-10-24)**

This document records the approved execution path for the first publishable external owner
artifact. The repository is public. The earlier GitHub `v0.1.0` release is retained as history;
`v0.1.2` is the completed public package release, and `v0.1.3` is the OIDC validation release.

## Preparation path (completed)

1. Prepare a candidate on `main` or in a pull request.
2. Run [DPM T1 preflight](../../../.github/workflows/t1-preflight.yml), either from the pull request
   or through manual dispatch on the selected branch ref.
3. Confirm the workflow run, package identity, registry, license, compatibility window,
   rollback plan, and release reference using the [T1 candidate decision packet](./t1-candidate-decision-packet.md)
   and [T1 release approval issue form](../../../.github/ISSUE_TEMPLATE/t1-release-approval.yml).
4. Owner approval for the validation release is recorded in [Issue #3](https://github.com/mineclover/data-governance/issues/3).
5. Configure npm Trusted Publishing for `publish.yml`, create the exact `v0.1.3` tag on `main`, and
   publish the package; [the T1 release gate](../../../.github/workflows/release-gate.yml) reruns the
   full verification suite.
6. Create the matching GitHub Release and close Issue #3 after the OIDC validation publish succeeds.

## Current evidence

- T1 release candidate source: `main`, represented by the linked owner CI and preflight runs.
- Owner CI: [workflow 29436919685](https://github.com/mineclover/data-governance/actions/runs/29436919685), passed for the approved public-candidate metadata.
- Latest T1 preflight: [workflow 29437184000](https://github.com/mineclover/data-governance/actions/runs/29437184000), passed for the same candidate.
- Previous release gate: [workflow 29437426766](https://github.com/mineclover/data-governance/actions/runs/29437426766), passed for the superseded `v0.1.0` identity candidate.
- The workflow run records the tested revision automatically; approval documents reference the run links and source ref rather than manually copied commit identifiers.
- Approved decisions are recorded in the [T1 candidate decision packet](./t1-candidate-decision-packet.md)
  and [Issue #3](https://github.com/mineclover/data-governance/issues/3).
- The release gate consumes all six checked Issue #3 approval rows before accepting `v0.1.3`.
- Release gate: [`release-gate.yml`](../../../.github/workflows/release-gate.yml), active for `v*` tags.
- The release gate now checks all six required Issue #2 approval rows, including the final release
  authorization, before verifying any `v*` tag;
  the readiness guard also verifies that this approval check and the deferred
  cross-definition read-model contract check remain wired.
- Repository visibility: public (confirmed 2026-10-23).
- Public registry publication and Apache-2.0 license metadata are approved; `@oa-sdk/dpm@0.1.2`
  was published on 2026-07-28 and is the current `latest`. That historical release used the
  repository `NPM_TOKEN`; future releases use npm Trusted Publishing. The historical `oa-sdk`
  repository remains a non-publishing mirror.
- Matching GitHub Release [`v0.1.2`](https://github.com/mineclover/data-governance/releases/tag/v0.1.2)
  was created on 2026-10-23, and [Issue #2](https://github.com/mineclover/data-governance/issues/2)
  was closed after the release record was completed.
- The matching `v0.1.3` GitHub Release remains pending until the first successful OIDC publish
  validates the npm Trusted Publisher configuration before 2026-10-25 15:24 UTC.
- npm Trusted Publishing is now the required publication mechanism. The npm package configuration
  must trust the `publish.yml` workflow in the `npm-release` environment.

## Non-goals of preflight

- The preflight does not publish to npm or create a release; the release gate verifies the approved tag.
- Its release gate requires all six explicit Issue #2 approval rows before accepting a `v*` tag.
- It does not change the existing `@oa-sdk/dpm` consumer import surface; the historical repository
  remains non-publishing after canonical cutover.
