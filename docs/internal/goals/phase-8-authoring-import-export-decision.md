# Phase 8 Authoring Import/Export Decision

**Status: private follow-on activated 2026-07-15; no public-release effect**

This record supplements the [Phase 8 private activation decision](./phase-8-decision-record.md)
and the [scoped lookup decision](./phase-8-scoped-lookup-decision.md). It activates only
library-level import/export helpers over the accepted `data_definitions` `1.1` contract.

## Decisions

| Decision | Adopted rule | Reason |
| --- | --- | --- |
| Surface | Expose pure helpers through the existing private `authoring` subpath. | Enables clean consumers without adding a repository, CLI, or deployment dependency. |
| Export shape | Export the normalized `data_definitions` `1.1` input shape, excluding derived `locator`, `identity`, `targetIdentity`, and other runtime-only fields. | Keeps the artifact portable and prevents derived identity values from becoming a second source of truth. |
| Determinism | Sort fields by `objectId`, API bindings by `bindingId`, preserve canonical nested values, use two-space JSON, and end with one newline. | Makes review, hashing, and fixture comparison stable. |
| Import validation | Parse the canonical JSON, require version `1.1`, and pass the input through existing identity normalization. | Reuses the accepted contract validation and rejects malformed or unsupported input before authoring. |
| Side effects | Import/export must not write revisions, drafts, identity indexes, audit events, or database rows. | Keeps the helper safe for preview and offline authoring workflows. |
| Compatibility boundary | Keep package identity, wire version, T1 metadata, license, tag, registry, and adapter unchanged. | Preserves the private release gate. |

## Acceptance criteria

- exporting the same normalized definitions twice produces byte-identical JSON;
- importing exported JSON reconstructs equivalent normalized definitions and derived identities;
- exported JSON contains no runtime-derived identity fields;
- invalid JSON, unsupported versions, and invalid identity definitions fail deterministically;
- sync/async authoring workflows can consume imported definitions without repository mutation;
- package build, typecheck, tests, docs, boundary, roadmap, and consumer smoke remain green.

## Deferred follow-ons

- explain/read-model presentation and machine-readable quick fixes;
- bulk edit and unrestricted authoring;
- cross-definition search and durable broad indexing;
- PostgreSQL migration/deployment and external authorization integration;
- public metadata, license, registry publication, `v*` tag, and adapter cutover.
