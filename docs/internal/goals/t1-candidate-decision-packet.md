# DPM T1 Candidate Decision Packet

**Status: owner-approved; public release execution authorized**
**Updated: 2026-07-16**

This packet assembles the recommended decisions for the first public DPM artifact. It is a
The owner-approved values below authorize the public package artifact, exact release reference,
and one-release compatibility transition. The repository itself remains private.

## Recommended decisions

| Decision | Recommendation | Why | Approval state |
| --- | --- | --- | --- |
| Public package identity | `@mineclover/dpm` | Align the artifact with the private owner repository and avoid carrying the historical `@oa-sdk` namespace into the public contract. | Approved |
| Registry | npm public registry | It is the lowest-friction distribution target for a TypeScript package and supports the package's existing Node/pnpm consumer workflow. | Approved |
| First release reference | `v0.1.0` | Use an explicitly limited first public release while external consumers validate the relationship, identity, neutral artifact, authoring, and compatibility contracts. Promote to `v1.0.0` only through a later stability decision. | Approved |
| License | Apache-2.0 | Permissive baseline with an explicit patent grant for a reusable library. | Approved |
| Redistribution policy | Public package may be redistributed under the approved license; generated/private operational data remains governed by its owning system. | Separates library rights from customer data and deployment policy. | Approved |
| Compatibility window | Keep `@oa-sdk/dpm` as a forwarding compatibility adapter for one subsequent release. | Gives existing consumers a migration window while keeping `@mineclover/dpm` canonical. | Approved |
| Adapter cutover | Announce deprecation in the compatibility release; remove the adapter only through a separately approved breaking release. | Makes rollback and consumer migration observable and reversible. | Approved |

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

1. Publish `@mineclover/dpm@0.1.0` from the approved tag.
2. Keep `@oa-sdk/dpm` as a forwarding adapter for one compatibility release, with a deprecation
   notice pointing to the canonical package and migration notes.
3. Verify clean-install, subpath-import, type-consumer, and representative authoring workflows for
   both package surfaces.
4. Retain the prior adapter path as the rollback target until the compatibility window closes.
5. Require a separate owner-approved breaking-release decision before removing the adapter.

If any release-gate, install, consumer, or rollback evidence fails, stop publication/cutover and
return to the private candidate. No partial registry or tag action is authorized by this packet.

## Actions intentionally deferred

- Replacing, redirecting, or removing the `@oa-sdk/dpm` adapter beyond the approved one-release window.
- Applying the PostgreSQL migration or deploying the authoring storage contract.

## Approval checklist for Issue #2

The owner or delegated release authority should copy the exact final values into the
[T1 release approval form](../../../.github/ISSUE_TEMPLATE/t1-release-approval.yml), then approve
only after reviewing:

- candidate source ref and successful private preflight/owner CI run links;
- package identity and registry target;
- license and redistribution policy;
- `v0.1.0` or an explicitly substituted release reference;
- one-release compatibility, deprecation, and rollback evidence;
- release-gate output for the exact approved tag.

The checklist is complete in Issue #2. The repository remains private, and the exact tag, registry
publication, and adapter transition must still follow the sequence and verification gates above.
