# Phase 8 Control-Plane Slice Proposal

**Status: proposal only — implementation is deferred until explicit owner authorization**

This proposal is the next roadmap step after the accepted Phase 7 neutral artifact and provenance
contract. It does not activate Phase 8, add persisted schemas, publish a package, or authorize an
adapter cutover.

## Recommended representative slice

Build one end-to-end **binding definition authoring slice** over the accepted neutral artifact:

1. Find one definition by logical object id, API pointer, or DB coordinate.
2. Create a draft from an immutable published revision with an optimistic base-revision check.
3. Run validate-preview and produce a deterministic semantic diff with breaking-change classification.
4. Submit the draft for approval and publish an immutable revision with audit readback.
5. Roll back the published revision using the preserved artifact, freshness, and provenance inputs.

This slice intentionally proves search, draft/edit, validation, publish, audit, and rollback in one
consumer-visible workflow instead of creating disconnected endpoint-sized goals.

## Required owner decisions before implementation

- **Activation:** explicitly activate Phase 8 as an owner-authorized product goal.
- **Persistence:** choose the draft/revision storage boundary and concurrency authority.
- **Security:** define editor, reviewer, publisher, and rollback authorization.
- **Public seam:** approve the package/API surface and consumer fixture contract.
- **Audit:** define the immutable event and readback fields required for publish and rollback.
- **Compatibility:** confirm that this feature remains in the external owner environment and does not
  add new canonical DPM behavior to the maintenance-only monorepo package.

## Verification contract after activation

- one fixture covers logical, API, and DB identity lookup;
- stale base revisions are rejected deterministically;
- preview diff and breaking classification are stable and reviewable;
- publish creates an immutable revision and audit readback;
- rollback restores the preserved artifact/provenance identity;
- the clean consumer uses only declared public package/API surfaces.

## Explicit non-goals

- generic search infrastructure or a cross-product indexing platform;
- bulk editing or unrestricted authoring convenience;
- production tokenization, vault, row rewrite, or physical FK execution;
- public registry publication, license selection, `v*` tagging, or adapter cutover.

Until the activation decisions above are recorded, the correct action is to keep this proposal
reviewable and continue private contract maintenance/evidence refreshes.
