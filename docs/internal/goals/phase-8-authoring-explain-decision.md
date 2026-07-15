# Phase 8 Authoring Explain Decision

**Status: private follow-on activated 2026-07-15; no public-release effect**

This record supplements the [Phase 8 private activation decision](./phase-8-decision-record.md),
the [scoped lookup decision](./phase-8-scoped-lookup-decision.md), and the
[import/export decision](./phase-8-authoring-import-export-decision.md). It activates a pure
identity explanation helper for review and debugging.

## Decisions

| Decision | Adopted rule | Reason |
| --- | --- | --- |
| Surface | Expose `explainDpmAuthoringDefinitions` through the private `authoring` subpath. | Gives consumers a stable review/readback surface without a service or CLI dependency. |
| Content | Explain logical field identity, locator, entity, type/origin/lifecycle, storage coordinate, and API binding identity/context. | Covers the accepted logical/API/DB contract and where-used context without inventing new metadata. |
| Data safety | Never include sample values, tokens, secrets, or operational row data. | Keeps the helper contract-only and safe for logs/review output. |
| Determinism | Sort fields and bindings by stable identity and return deeply frozen output. | Makes explanations suitable for snapshots, review, and repeatable diagnostics. |
| Side effects | Do not write drafts, revisions, audit events, indexes, or database rows. | Keeps explanation read-only and independent of authorization/deployment. |
| Compatibility boundary | Keep package identity, wire version, T1 metadata, license, tag, registry, and adapter unchanged. | Preserves the private release gate. |

## Acceptance criteria

- the explanation includes all logical fields and their API bindings in deterministic order;
- logical/API/DB identities remain distinguishable and derived identity values are exposed only as
  readback, not as import authority;
- no data values or secret-bearing fields appear in the result;
- returned structures are immutable to callers;
- package build, typecheck, tests, docs, boundary, roadmap, and consumer smoke remain green.

## Deferred follow-ons

- machine-readable quick fixes and bulk edit;
- cross-definition search and durable broad indexing;
- sensitivity/owner metadata and relationship/policy/trace extensions;
- PostgreSQL migration/deployment and external authorization integration;
- public metadata, license, registry publication, `v*` tag, and adapter cutover.
