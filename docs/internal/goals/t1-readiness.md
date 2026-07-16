# DPM T1 Release Readiness

**Status: v0.1.1 package-identity transition; release execution in progress**

This document records the approved execution path for the first publishable external owner
artifact. The repository remains private. The earlier private GitHub `v0.1.0` release is retained
as history; `v0.1.1` is the corrected public package identity and registry release.

## Private preparation path

1. Prepare a candidate on private `main` or in a private pull request.
2. Run [DPM T1 preflight](../../../.github/workflows/t1-preflight.yml), either from the pull request
   or through manual dispatch on the selected branch ref.
3. Confirm the workflow run, package identity, registry, license, compatibility window,
   rollback plan, and release reference using the [T1 candidate decision packet](./t1-candidate-decision-packet.md)
   and [T1 release approval issue form](../../../.github/ISSUE_TEMPLATE/t1-release-approval.yml).
4. Owner approval is recorded in [Issue #2](https://github.com/mineclover/data-governance/issues/2).
5. Create the exact `v0.1.1` tag on `main`; [the T1 release gate](../../../.github/workflows/release-gate.yml)
   reruns the full verification suite.

## Current evidence

- T1 release candidate source: private `main`, represented by the linked owner CI and preflight runs.
- Owner CI: [workflow 29436919685](https://github.com/mineclover/data-governance/actions/runs/29436919685), passed for the approved public-candidate metadata.
- Latest T1 preflight: [workflow 29437184000](https://github.com/mineclover/data-governance/actions/runs/29437184000), passed for the same candidate.
- Previous private release gate: [workflow 29437426766](https://github.com/mineclover/data-governance/actions/runs/29437426766), passed for the superseded `v0.1.0` identity candidate.
- The workflow run records the tested revision automatically; approval documents reference the run links and source ref rather than manually copied commit identifiers.
- Approved decisions are recorded in the [T1 candidate decision packet](./t1-candidate-decision-packet.md)
  and [Issue #2](https://github.com/mineclover/data-governance/issues/2).
- The release gate consumes all six checked Issue #2 approval rows before accepting the exact tag.
- Release gate: [`release-gate.yml`](../../../.github/workflows/release-gate.yml), active for `v*` tags.
- The release gate now checks all six required Issue #2 approval rows, including the final release
  authorization, before verifying any `v*` tag;
  the private readiness guard also verifies that this approval check and the deferred
  cross-definition read-model contract check remain wired.
- Repository visibility: private.
- Public registry publication and Apache-2.0 license metadata are approved; publish
  `@context-action/dpm@0.1.1`, then cut over the compatibility adapter after compatibility smoke.

## Non-goals of preflight

- The preflight does not publish to npm or create a release; the release gate verifies the approved tag.
- Its release gate requires all six explicit Issue #2 approval rows before accepting a `v*` tag.
- It does not remove the existing `@oa-sdk/dpm` compatibility surface; that adapter remains through one
  subsequent compatibility release.
