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
   rollback plan, and release reference using the [T1 candidate decision packet](./t1-candidate-decision-packet.md)
   and [T1 release approval issue form](../../../.github/ISSUE_TEMPLATE/t1-release-approval.yml).
4. Obtain explicit approval from the `mineclover` repository owner or a delegated release authority.
5. Only after approval, create the exact `v*` tag on `main`; [the T1 release gate](../../../.github/workflows/release-gate.yml)
   reruns the full verification suite.

## Current evidence

- Latest private owner candidate: commit `8110ce5912c1971808d1840cd07c546ebe09200e` (`docs: link authoring migration rehearsal evidence`).
- Latest owner CI: [workflow 29398261709](https://github.com/mineclover/data-governance/actions/runs/29398261709), passed for the exact candidate commit.
- Latest private T1 preflight: [workflow 29398294576](https://github.com/mineclover/data-governance/actions/runs/29398294576), passed for the exact 40-character candidate SHA.
- Recommended candidate decisions are assembled in the [T1 candidate decision packet](./t1-candidate-decision-packet.md);
  they remain proposals until Issue #2 is explicitly approved.
- Pending T1 decision record: [Issue #2](https://github.com/mineclover/data-governance/issues/2).
- The current owner comment on Issue #2 labels the packet as preparation rather than approval and
  leaves the license decision unresolved; checked preparation items do not satisfy the final
  release gate.
- Release gate: [`release-gate.yml`](../../../.github/workflows/release-gate.yml), active for `v*` tags.
- Repository visibility: private.
- Public registry, license, and adapter cutover: pending the T1 approval issue.

## Non-goals of preflight

- It does not publish to npm, GitHub Packages, or another registry.
- It does not create a SemVer tag or GitHub Release.
- It does not change the canonical package name or add a public license file.
- It does not remove or replace the existing `@oa-sdk/dpm` compatibility surface.
