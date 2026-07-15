# Phase 8 Private Activation Decision Record

**Status: private representative slice activated 2026-07-15; T1 public release remains deferred**

This record resolves the implementation decisions required by the [Phase 8 control-plane slice
proposal](./phase-8-control-plane-proposal.md). The decision activates only one representative
authoring slice in the private `mineclover/data-governance` owner repository. It does not authorize
public package metadata, registry publication, `v*` tagging, license selection, or adapter cutover.

## Decisions

| Decision | Adopted rule | Reason |
| --- | --- | --- |
| Activation | Activate Phase 8 for one binding-definition authoring slice in the private owner repository. | Enables progress while preserving the T1 and runtime boundaries. |
| Persistence boundary | Define a repository port and ship an in-memory reference adapter first. Durable database schema, migrations, and deployment are deferred. | Proves revision semantics without prematurely selecting production storage. |
| Revision/concurrency | Published revisions are immutable. Drafts carry an explicit `baseRevisionId`; stale bases are rejected deterministically. | Prevents lost updates and makes rollback/readback reproducible. |
| Authorization | Require an actor and role check for `editor`, `reviewer`, `publisher`, and `rollback` actions. The default policy is deny. | Keeps security decisions explicit and prevents an unowned implicit permission model. |
| Public seam | Expose the slice through the declared `@oa-sdk/dpm/authoring` subpath and root export only; tests use package-level surfaces. | Preserves clean-consumer compatibility and avoids deep imports. |
| Audit | Record append-only immutable events for draft creation, approval, publish, and rollback. Inject the clock and id generator for deterministic tests. | Makes state transitions reviewable without coupling the slice to a deployment-specific audit service. |
| Compatibility | Keep the implementation in the private owner package. Do not add new canonical behavior to the historical `oa-sdk` mirror or perform adapter cutover. | Maintains the accepted extraction and one-release compatibility policy. |

## Activated slice

The first implementation must cover this complete path:

1. Seed or read one published identity definition by logical object id, API pointer, or DB coordinate.
2. Create a draft from an immutable published revision with a base-revision check.
3. Produce a deterministic semantic diff and breaking-change classification.
4. Submit the draft for review and publish an immutable revision after reviewer/publisher checks.
5. Roll back to a preserved published revision and expose audit readback.

The slice uses the accepted `DpmIdentityDataDefinitions` v1.1 contract and existing identity
normalizers. It does not introduce a new wire version or claim production durability.

## Acceptance gates

- lookup returns deterministic results for logical, API, and DB identities;
- stale draft bases reject without mutating the store;
- removed fields/bindings and incompatible type/storage changes are classified as breaking;
- reviewer and publisher roles are required for approval and publish;
- published revisions and audit events cannot be mutated through returned values;
- rollback creates a new published revision from the preserved target revision;
- the package build, typecheck, tests, documentation, boundary, and consumer smoke remain green.

## Deferred decisions

- durable persistence and production concurrency authority;
- integration with an external identity/access-control provider;
- cross-product indexing, bulk edit, unrestricted authoring, and generic search infrastructure;
- public package metadata, license, registry publication, `v*` tag, and adapter cutover;
- production tokenization, vault execution, row rewriting, and data-plane deployment.
