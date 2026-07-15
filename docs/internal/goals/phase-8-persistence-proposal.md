# Phase 8 Persistence and Identity Index Proposal

**Status: PostgreSQL target contract and async adapter prepared; migration and deployment remain deferred**

This proposal resolves the next Phase 8 persistence direction without applying a production schema.
The private authoring service continues to use its repository port and in-memory reference adapter;
the PostgreSQL contract below is a prepared durable adapter boundary.

## Adopted direction

- PostgreSQL is the recommended durable persistence target for published revisions, drafts, and
  append-only audit events.
- Published revisions are insert-only. A revision primary key prevents replacement, while the
  service's `baseRevisionId` check remains the optimistic concurrency authority for draft publish.
- Draft rows may transition from `draft` to `pending-approval`; published rows never transition.
- JSONB stores the normalized v1.1 identity definition and optional artifact/freshness/provenance
  source. Reads must re-run the DPM identity normalizer before returning data to consumers.
- A normalized identity index stores object, API, and DB lookup keys. It is rebuilt atomically with
  each published revision and is not a generic cross-product search index.
- Audit events are append-only and use a unique event id. Duplicate event ids fail rather than
  overwrite history.

## Proposed tables

| Table | Purpose | Mutation rule |
| --- | --- | --- |
| `dpm.authoring_published_revisions` | Immutable published definition revisions | Insert only |
| `dpm.authoring_drafts` | Draft definitions and review state | Update same draft with base-revision guard |
| `dpm.authoring_audit_events` | Draft, approval, publish, and rollback history | Append only |
| `dpm.authoring_identity_index` | Canonical object/API/DB lookup keys | Replace only for the same published revision during its insert transaction |

The schema and SQL query contract live in the `@oa-sdk/dpm/authoring` public category so a future
service can use a package-level seam. No database driver dependency is added.

## Lookup keys

- `object`: `data-field:<encoded-object-id>`
- `api`: the existing canonical API object identity
- `db`: the existing catalog-scoped database column identity

The lookup result returns definition id, revision id, and object id; the service then hydrates the
immutable published revision. This keeps identity semantics aligned with the accepted Phase 5–7
contract and avoids indexing display names as canonical keys.

## Deferred gates

- running the schema against any environment;
- selecting connection pooling, transaction middleware, backup, retention, and deployment ownership;
- replacing the in-memory service repository with an asynchronous production service;
- adding broad filters, full-text search, bulk edit, or a cross-product index;
- public package metadata, registry publication, license, T1 tag, and adapter cutover.

The async PostgreSQL adapter contract and fake-client tests are now prepared. Actual migration
requires a separate owner-approved operational change.
