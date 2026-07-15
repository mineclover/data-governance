# DPM T1 Release Readiness

**Status: T1 approval recorded; release execution in progress**

This document records the approved execution path for the first external owner artifact release
(`T1`). The repository remains private, while the approved public package artifact and one-release
compatibility transition are executed through the gates below.

## Private preparation path

1. Prepare a candidate on private `main` or in a private pull request.
2. Run [DPM T1 preflight](../../../.github/workflows/t1-preflight.yml), either from the pull request
   or through manual dispatch on the selected branch ref.
3. Confirm the workflow run, package identity, registry, license, compatibility window,
   rollback plan, and release reference using the [T1 candidate decision packet](./t1-candidate-decision-packet.md)
   and [T1 release approval issue form](../../../.github/ISSUE_TEMPLATE/t1-release-approval.yml).
4. Owner approval is recorded in [Issue #2](https://github.com/mineclover/data-governance/issues/2).
5. Create the exact `v0.1.0` tag on `main`; [the T1 release gate](../../../.github/workflows/release-gate.yml)
   reruns the full verification suite.

## Current evidence

- T1 release candidate source: private `main`, represented by the linked owner CI and preflight runs.
- Owner CI: [workflow 29431640691](https://github.com/mineclover/data-governance/actions/runs/29431640691), passed for the selected approved candidate.
- Latest private T1 preflight: [workflow 29429853413](https://github.com/mineclover/data-governance/actions/runs/29429853413), passed for the selected private candidate.
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
- Public registry publication and license metadata are approved; adapter cutover follows the
  successful `@mineclover/dpm@0.1.0` publication and compatibility smoke.

## Non-goals of preflight

- The preflight does not publish to npm or create a release; the release gate verifies the approved tag.
- Its release gate requires all six explicit Issue #2 approval rows before accepting a `v*` tag.
- It does not remove the existing `@oa-sdk/dpm` compatibility surface; that adapter remains through one
  subsequent compatibility release.
