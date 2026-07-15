# DPM T1 Release Readiness

**Status: private preflight path available; T1 public release is not approved**

This document defines the safe preparation path before the first accepted external owner artifact
release (`T1`). It does not authorize public registry publication, license finalization, a `v*` tag,
or the `@oa-sdk/dpm` adapter cutover.

## Private preparation path

1. Prepare a candidate commit in the private owner repository or a private pull request.
2. Run [DPM T1 preflight](../../../.github/workflows/t1-preflight.yml), either from the pull request
   or through manual dispatch with the candidate branch/commit.
3. Confirm the exact candidate commit, package identity, registry, license, compatibility window,
   rollback plan, and release reference in the [T1 release approval issue form](../../../.github/ISSUE_TEMPLATE/t1-release-approval.yml).
4. Obtain explicit approval from the `mineclover` repository owner or a delegated release authority.
5. Only after approval, create the exact `v*` tag on `main`; [the T1 release gate](../../../.github/workflows/release-gate.yml)
   reruns the full verification suite.

## Current evidence

- Latest owner commit: `9981dc4`.
- Latest owner CI: [workflow 29381989604](https://github.com/mineclover/data-governance/actions/runs/29381989604), passed.
- Latest private T1 preflight: [workflow 29382126333](https://github.com/mineclover/data-governance/actions/runs/29382126333), passed.
- Release gate: [`release-gate.yml`](../../../.github/workflows/release-gate.yml), active for `v*` tags.
- Repository visibility: private.
- Public registry, license, and adapter cutover: pending the T1 approval issue.

## Non-goals of preflight

- It does not publish to npm, GitHub Packages, or another registry.
- It does not create a SemVer tag or GitHub Release.
- It does not change the canonical package name or add a public license file.
- It does not remove or replace the existing `@oa-sdk/dpm` compatibility surface.
