# Phase 8 Scoped Lookup Extension Decision

**Status: private follow-on implemented 2026-07-15; no public-release effect**

This record supplements the [Phase 8 private activation decision](./phase-8-decision-record.md).
It defines the next small read-model work unit without activating cross-product search, production
indexing, or unrestricted authoring.

## Decisions

| Decision | Adopted rule | Reason |
| --- | --- | --- |
| Query scope | Keep lookup scoped to one `definitionId` and its latest published revision. | Avoids introducing cross-definition search infrastructure before its ownership and persistence contract is decided. |
| Field filters | Add deterministic filters for entity, full locator, field name, semantic type, origin, and lifecycle. | These dimensions already exist in the accepted identity contract and require no wire-version change. |
| Reverse identity context | API and DB exact lookups return the matched field plus all API bindings for that field. | Makes the logical/API/DB relationship and where-used context observable from either external identity. |
| Async behavior | Use the existing canonical identity index for exact object/API/DB queries; hydrate and filter the latest revision for field-filter queries. | Reuses the prepared PostgreSQL contract without adding migration or a new index table. |
| Unsupported filters | Do not invent `sensitivity`, `owner`, relationship, policy, or trace filters in this work unit. | Those dimensions are not part of `DpmIdentityDataDefinitions` and require a separate read-model contract. |
| Public/compatibility boundary | Keep the implementation private in `mineclover/data-governance`; do not change package identity, wire version, adapter, tag, registry, or license. | Preserves the approved T1 gate and extraction boundary. |

## Acceptance criteria

- sync and async authoring services return stable, sorted matches for the same field filters;
- full locator matching is exact and does not confuse fields with the same name in different entities;
- API and DB identity lookup continues to use canonical identity matching and returns all bindings for
  the matched logical field;
- empty filter results are deterministic and do not mutate revisions, drafts, indexes, or audit
  events;
- package build, typecheck, tests, docs, boundary, roadmap, and consumer smoke remain green.

## Deferred follow-ons

- cross-definition or cross-product search and durable broad indexing;
- sensitivity/owner metadata and relationship/policy/trace where-used records;
- automatic mutation, bulk edit, and unrestricted authoring workflows;
- PostgreSQL migration/deployment and external authorization integration;
- public metadata, license, registry publication, `v*` tag, and adapter cutover.
