# DPM T1 Candidate Decision Packet

**Status: owner-approved; public release execution authorized**
**Updated: 2026-07-16**

This packet records the approved decisions for the first publishable DPM artifact. The
owner-approved values below authorize the public package artifact and exact release reference. The
repository itself remains private, and the historical `oa-sdk` repository is non-publishing.

## Recommended decisions

| Decision | Recommendation | Why | Approval state |
| --- | --- | --- | --- |
| Public package identity | `@oa-sdk/dpm` | Keep the canonical repository and npm namespace aligned while remaining independent from the separate `context-action` repository. | Approved |
| Registry | npm public registry | It is the lowest-friction distribution target for a TypeScript package and supports the package's existing Node/pnpm consumer workflow. | Approved |
| First release reference | `v0.1.2` | Publish the corrected `oa-sdk` scope identity without moving the existing private GitHub `v0.1.0` or `v0.1.1` tags. Promote to `v1.0.0` only through a later stability decision. | Approved |
| License | Apache-2.0 | Permissive baseline with an explicit patent grant for a reusable library. | Approved |
| Redistribution policy | Public package may be redistributed under the approved license; generated/private operational data remains governed by its owning system. | Separates library rights from customer data and deployment policy. | Approved |
| Package continuity | Reuse the existing `@oa-sdk/dpm` import identity from the canonical owner repository; keep the historical `oa-sdk` repository as a non-publishing mirror. | Existing consumers require no import migration and no conflicting adapter package is created. | Approved |
| Cutover | Publish the canonical owner artifact through GitHub Actions using the `NPM_TOKEN` repository secret and freeze the historical mirror's publish path. | Prevents two repositories from competing for the same npm package identity. | Approved |

## Candidate baseline

The current private readiness baseline is the owner-repository `main` ref recorded in
[T1 readiness](./t1-readiness.md). It is not itself a T1 release candidate until all of the
following are true:

1. The selected private branch or pull request passes T1 preflight and owner CI.
2. The owner has approved the package, registry, license, compatibility, rollback, and release
   reference decisions in [Issue #2](https://github.com/mineclover/data-governance/issues/2).
3. The exact approved release reference is created through the release gate.

The candidate should be selected by private branch or pull request plus the successful workflow
run links. GitHub Actions records the resolved revision for each run, so approval does not require
manual revision entry or copy/paste synchronization across documents.

## Compatibility and rollback contract

After approval, the sequence should be:

1. Publish `@oa-sdk/dpm@0.1.2` from the approved tag through GitHub Actions using `NPM_TOKEN`.
2. Keep the historical `oa-sdk` repository as a non-publishing mirror while consumers continue using
   the unchanged `@oa-sdk/dpm` import identity.
3. Verify clean-install, subpath-import, type-consumer, and representative authoring workflows for
   the unchanged package surface.
4. Retain the prior private artifact and historical mirror as rollback references.
5. Require a separate owner-approved decision before re-enabling publication from the historical
   mirror.

If any release-gate, install, consumer, or rollback evidence fails, stop publication/cutover and
return to the private candidate. No partial registry or tag action is authorized by this packet.

## Actions intentionally deferred

- Re-enabling publication from the historical `oa-sdk` repository without a separate owner decision.
- Applying the PostgreSQL migration or deploying the authoring storage contract.

## Approval checklist for Issue #2

The owner or delegated release authority should copy the exact final values into the
[T1 release approval form](../../../.github/ISSUE_TEMPLATE/t1-release-approval.yml), then approve
only after reviewing:

- candidate source ref and successful preflight/owner CI run links;
- package identity and registry target;
- license and redistribution policy;
- `v0.1.2` or an explicitly substituted release reference;
- package continuity, non-publishing mirror, and rollback evidence;
- release-gate output for the exact approved tag.

The checklist is complete in Issue #2. The repository is public, and `@oa-sdk/dpm@0.1.2` is
published. Future releases must still follow the sequence and verification gates above.
